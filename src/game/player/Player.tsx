import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Group, type Mesh } from 'three'
import { consumeLook, debugPose, debugTeleport, input } from '../input'
import { useLab } from '../state'

const SPEED = 4.4
const LOOK_SPEED = 0.00215

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Player() {
  const { pack, state, api } = useLab()
  const { gl, camera } = useThree()
  const group = useRef<Group>(null)
  const halo = useRef<Mesh>(null)
  const pos = useRef(new Vector3(...pack.spawn))
  const vel = useRef(new Vector3())
  const yaw = useRef(0)
  const pitch = useRef(0.42)
  const focusPoint = useRef(new Vector3())
  const focusFact = useRef('chloroplast')
  const focusId = useRef('')
  const focusT = useRef(0)
  const focusFired = useRef(false)
  const promptId = useRef<string | null>(null)
  const seenReset = useRef(state.resetPose)
  const cameraReady = useRef(false)
  const roll = useRef(0)
  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const scratch = useMemo(
    () => ({
      desired: new Vector3(),
      look: new Vector3(),
      closeCam: new Vector3(),
      fromPlayer: new Vector3(),
      currentLook: new Vector3(),
    }),
    [],
  )

  const stateRef = useRef(state)
  const apiRef = useRef(api)
  const rulesRef = useRef(pack.rules)
  stateRef.current = state
  apiRef.current = api
  rulesRef.current = pack.rules

  const blockedRef = useRef(false)

  useEffect(() => {
    const blocked =
      state.introOpen ||
      state.paused ||
      state.panelFactId !== null ||
      state.finale === 'summary' ||
      state.finale === 'next'
    blockedRef.current = blocked
    if (blocked && document.pointerLockElement) document.exitPointerLock()
  }, [state.introOpen, state.paused, state.panelFactId, state.finale])

  useEffect(() => {
    const element = gl.domElement
    let dragging = false

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || blockedRef.current) return
      dragging = true
      try {
        const lock = element.requestPointerLock()
        void Promise.resolve(lock).catch(() => {})
      } catch {
        // Захват указателя недоступен: обзор остаётся на удержании кнопки мыши.
      }
    }
    const onUp = () => {
      dragging = false
    }
    const onMove = (event: MouseEvent) => {
      if (blockedRef.current) return
      if (document.pointerLockElement === element || dragging) {
        input.lookX += event.movementX
        input.lookY += event.movementY
      }
    }
    const onLock = () => {
      const locked = document.pointerLockElement === element
      apiRef.current.setPointer(locked)
      element.style.cursor = locked ? 'none' : 'grab'
    }

    element.style.touchAction = 'none'
    element.style.cursor = 'grab'
    element.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('pointerlockchange', onLock)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerlockchange', onLock)
    }
  }, [gl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const current = stateRef.current
    const dialog =
      current.paused ||
      current.panelFactId !== null ||
      current.finale === 'summary' ||
      current.finale === 'next'
    const focusing = current.focusingId !== null
    const canMove = !current.introOpen && !dialog && !focusing

    if (seenReset.current !== current.resetPose) {
      seenReset.current = current.resetPose
      pos.current.set(...pack.spawn)
      vel.current.set(0, 0, 0)
      yaw.current = 0
      pitch.current = 0.42
      focusT.current = 0
      focusFired.current = false
      cameraReady.current = false
    }

    if (debugTeleport.current) {
      pos.current.set(debugTeleport.current.x, debugTeleport.current.y, debugTeleport.current.z)
      vel.current.set(0, 0, 0)
      debugTeleport.current = null
    }

    if (focusing) {
      focusT.current = Math.min(1, focusT.current + dt / 1.15)
      if (focusT.current >= 1 && !focusFired.current) {
        focusFired.current = true
        apiRef.current.inspect(focusId.current, focusFact.current)
      }
    } else {
      focusT.current = 0
      focusFired.current = false
    }

    const look = consumeLook()
    if (canMove) {
      yaw.current += clamp(look.x, -80, 80) * LOOK_SPEED
      pitch.current = clamp(pitch.current + clamp(look.y, -80, 80) * 0.0018, 0.22, 1.05)
    } else if (current.introOpen && !reduceMotion) {
      const drift = Math.sin(performance.now() * 0.00018) * 0.2
      yaw.current += (drift - yaw.current) * (1 - Math.exp(-dt * 0.8))
    }

    if (input.jumpPressed) {
      input.jumpPressed = false
      if (canMove && pos.current.y <= pack.bounds.min[1] + 0.04) vel.current.y = 5.15
    }
    if (input.interactPressed) {
      input.interactPressed = false
      if (canMove) {
        const obj = rulesRef.current.pickInteractable(pos.current, current.studied)
        if (obj?.role === 'chloroplast') {
          focusPoint.current.set(...obj.position)
          focusFact.current = obj.factId
          focusId.current = obj.id
          apiRef.current.focus(obj.id)
        } else if (obj) {
          apiRef.current.inspect(obj.id, obj.factId)
        }
      }
    }

    if (canMove) {
      let forward = 0
      let strafe = 0
      if (input.keys.KeyW || input.keys.ArrowUp) forward += 1
      if (input.keys.KeyS || input.keys.ArrowDown) forward -= 1
      if (input.keys.KeyD || input.keys.ArrowRight) strafe += 1
      if (input.keys.KeyA || input.keys.ArrowLeft) strafe -= 1
      forward += -input.moveY
      strafe += input.moveX
      const length = Math.hypot(forward, strafe)
      if (length > 1) {
        forward /= length
        strafe /= length
      }

      const targetX = (Math.sin(yaw.current) * forward + Math.cos(yaw.current) * strafe) * SPEED
      const targetZ = (-Math.cos(yaw.current) * forward + Math.sin(yaw.current) * strafe) * SPEED
      const blend = 1 - Math.exp(-10 * dt)
      vel.current.x += (targetX - vel.current.x) * blend
      vel.current.z += (targetZ - vel.current.z) * blend
      vel.current.y -= 14.5 * dt

      pos.current.x += vel.current.x * dt
      pos.current.y += vel.current.y * dt
      pos.current.z += vel.current.z * dt
      pos.current.x = clamp(pos.current.x, pack.bounds.min[0], pack.bounds.max[0])
      pos.current.z = clamp(pos.current.z, pack.bounds.min[2], pack.bounds.max[2])
      if (pos.current.y <= pack.bounds.min[1]) {
        pos.current.y = pack.bounds.min[1]
        vel.current.y = 0
      }
      if (pos.current.y > pack.bounds.max[1]) {
        pos.current.y = pack.bounds.max[1]
        vel.current.y = 0
      }

      roll.current += (-strafe * 0.18 - roll.current) * (1 - Math.exp(-6 * dt))
    } else {
      vel.current.x = 0
      vel.current.z = 0
      vel.current.y = 0
    }

    const moving = Math.hypot(vel.current.x, vel.current.z) > 0.35
    const bob = reduceMotion
      ? 0
      : Math.sin(performance.now() * (moving ? 0.006 : 0.002)) * (moving ? 0.06 : 0.03)

    if (group.current) {
      group.current.position.set(pos.current.x, pos.current.y + bob, pos.current.z)
      group.current.rotation.y = yaw.current
      group.current.rotation.z = roll.current
    }
    if (halo.current) halo.current.position.set(pos.current.x, 0.08, pos.current.z)

    debugPose.x = pos.current.x
    debugPose.y = pos.current.y
    debugPose.z = pos.current.z
    debugPose.cx = camera.position.x
    debugPose.cy = camera.position.y
    debugPose.cz = camera.position.z

    const nearest = canMove
      ? rulesRef.current.pickInteractable(pos.current, current.studied)
      : null
    const nextPrompt = nearest?.id ?? null
    if (nextPrompt !== promptId.current) {
      promptId.current = nextPrompt
      apiRef.current.setPrompt(nextPrompt)
    }

    if (dialog) return

    const amount = focusing ? focusT.current : 0
    const back = 4.6
    const ahead = 6.5
    const lookY = 0.2 - (pitch.current - 0.42) * 1.15
    const camY = 2.45 + (pitch.current - 0.42) * 0.7
    scratch.look.set(
      pos.current.x + Math.sin(yaw.current) * ahead,
      pos.current.y + lookY,
      pos.current.z - Math.cos(yaw.current) * ahead,
    )
    scratch.desired.set(
      pos.current.x - Math.sin(yaw.current) * back,
      pos.current.y + camY,
      pos.current.z + Math.cos(yaw.current) * back,
    )

    if (amount > 0) {
      const t = amount * amount * (3 - 2 * amount)
      scratch.fromPlayer.set(
        pos.current.x - focusPoint.current.x,
        0.35,
        pos.current.z - focusPoint.current.z,
      )
      if (scratch.fromPlayer.lengthSq() < 0.04) scratch.fromPlayer.set(0, 0.35, 1)
      scratch.fromPlayer.normalize().multiplyScalar(2.35)
      scratch.closeCam.copy(focusPoint.current).add(scratch.fromPlayer)
      scratch.closeCam.y = focusPoint.current.y + 0.55
      scratch.desired.lerp(scratch.closeCam, t)
      scratch.look.lerp(focusPoint.current, t)
    }

    scratch.desired.x = clamp(scratch.desired.x, -12, 12)
    scratch.desired.y = clamp(scratch.desired.y, 0.45, 8.1)
    scratch.desired.z = clamp(scratch.desired.z, -16, 12)

    if (!cameraReady.current) {
      cameraReady.current = true
      camera.position.copy(scratch.desired)
      scratch.currentLook.copy(scratch.look)
      camera.lookAt(scratch.currentLook)
      return
    }

    const k = 1 - Math.exp(-dt * (amount > 0 ? 3.4 : 4.8))
    camera.position.lerp(scratch.desired, k)
    scratch.currentLook.lerp(scratch.look, 1 - Math.exp(-dt * 6))
    camera.lookAt(scratch.currentLook)
  })

  return (
    <>
      <group ref={group}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial color="#f4fff8" emissive="#b8ff9a" emissiveIntensity={0.75} roughness={0.28} />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.4, 0.028, 8, 28]} />
          <meshStandardMaterial color="#f6ffd8" emissive="#e4ff6a" emissiveIntensity={1.05} roughness={0.3} />
        </mesh>
        
        <pointLight intensity={8} distance={8} decay={2} color="#f0ffd8" />
      </group>
      <mesh ref={halo} rotation-x={-Math.PI / 2} position={[pack.spawn[0], 0.08, pack.spawn[2]]}>
        <ringGeometry args={[0.34, 0.46, 32]} />
        <meshBasicMaterial color="#e4ff6a" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  )
}
