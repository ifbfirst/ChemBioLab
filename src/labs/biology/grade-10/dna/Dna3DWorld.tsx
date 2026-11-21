import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  Object3D,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from 'three'
import type { Vec3 } from '../../../../platform/types'
import { useLab } from '../../../../game/state'

const PAIRS = [
  { left: '#38bdf8', right: '#facc15', mrna: '#fb7185' },
  { left: '#4ade80', right: '#fb923c', mrna: '#f472b6' },
  { left: '#facc15', right: '#38bdf8', mrna: '#38bdf8' },
  { left: '#fb923c', right: '#4ade80', mrna: '#4ade80' },
  { left: '#38bdf8', right: '#facc15', mrna: '#fb7185' },
  { left: '#4ade80', right: '#fb923c', mrna: '#f472b6' },
  { left: '#facc15', right: '#38bdf8', mrna: '#38bdf8' },
  { left: '#fb923c', right: '#4ade80', mrna: '#4ade80' },
  { left: '#38bdf8', right: '#facc15', mrna: '#fb7185' },
  { left: '#4ade80', right: '#fb923c', mrna: '#f472b6' },
]

function Tag({ text, position, color }: { text: string; position: Vec3; color: string }) {
  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 768
    canvas.height = 140
    const ctx = canvas.getContext('2d')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    if (ctx) {
      ctx.clearRect(0, 0, 768, 140)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'
      ctx.beginPath()
      ctx.roundRect(64, 24, 640, 92, 46)
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.font = '700 38px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 384, 70)
      texture.needsUpdate = true
    }
    const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const next = new Sprite(material)
    next.scale.set(3.0, 0.55, 1)
    return next
  }, [text, color])

  return <primitive object={sprite} position={position} />
}

function NucleotideFlow({ active }: { active: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const start = useMemo(() => new Vector3(2.4, 3.8, 0.8), [])
  const end = useMemo(() => new Vector3(-1.1, 1.85, 0.75), [])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    mesh.visible = active
    if (!active) return
    const time = clock.elapsedTime * 0.65
    for (let i = 0; i < 4; i++) {
      const t = (time + i / 4) % 1
      dummy.position.lerpVectors(start, end, t)
      dummy.position.y += Math.sin(t * Math.PI) * 0.35
      dummy.scale.setScalar(0.13 * (1 - t * 0.25))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 4]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#fb7185" transparent opacity={0.95} toneMapped={false} />
    </instancedMesh>
  )
}

function PulseMarker({
  position,
  onSelect,
}: {
  position: Vec3
  onSelect: () => void
}) {
  const ring = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ camera, clock }) => {
    if (!ring.current) return
    ring.current.lookAt(camera.position)
    const s = (hovered ? 1.25 : 1) + Math.sin(clock.elapsedTime * 3.5) * 0.12
    ring.current.scale.set(s, s, s)
  })

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'grab'
        }}
      >
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color="#e7ff9a"
          emissive="#bef264"
          emissiveIntensity={hovered ? 1.8 : 1.25}
        />
      </mesh>
      <mesh ref={ring} raycast={() => null}>
        <ringGeometry args={[0.3, 0.38, 28]} />
        <meshBasicMaterial color="#ecfccb" transparent opacity={0.9} side={DoubleSide} />
      </mesh>
    </group>
  )
}
export function Dna3DWorld({ markerIds: _markerIds }: { markerIds: readonly string[] }) {
  const { state, facts, api } = useLab()
  const helixRef = useRef<Group>(null)
  const mrnaRef = useRef<Group>(null)
  const polyRef = useRef<Mesh>(null)
  const [builtCount, setBuiltCount] = useState(0)
  const [reclosed, setReclosed] = useState(false)
  const timerRef = useRef(0)

  const synth = state.synthesis
  const factKeys = Object.keys(facts)

  const { leftStrandGeo, rightStrandGeo } = useMemo(() => {
    const leftPts: Vector3[] = []
    const rightPts: Vector3[] = []
    PAIRS.forEach((_, i) => {
      const y = (i - PAIRS.length / 2) * 0.62
      const angle = i * 0.52
      leftPts.push(new Vector3(Math.cos(angle) * -1.35, y, Math.sin(angle) * 1.35))
      rightPts.push(new Vector3(Math.cos(angle) * 1.35, y, Math.sin(angle) * -1.35))
    })
    return {
      leftStrandGeo: new TubeGeometry(new CatmullRomCurve3(leftPts), 64, 0.085, 12, false),
      rightStrandGeo: new TubeGeometry(new CatmullRomCurve3(rightPts), 64, 0.085, 12, false),
    }
  }, [])

  useFrame(({ clock }, delta) => {
    if (helixRef.current) {
      if (!synth) {
        helixRef.current.rotation.y += delta * 0.28
      } else {
        helixRef.current.rotation.y += (0 - helixRef.current.rotation.y) * Math.min(1, delta * 3.5)
      }
    }

    if (synth) {
      timerRef.current += delta
      const count = Math.min(6, Math.floor(timerRef.current / 0.5) + 1)
      if (count !== builtCount) setBuiltCount(count)

      if (timerRef.current > 3.4 && !reclosed) setReclosed(true)

      if (polyRef.current) {
        const progress = Math.min(1, timerRef.current / 3.2)
        polyRef.current.position.y = 3.1 - progress * 3.2
        polyRef.current.visible = !reclosed
      }

      if (mrnaRef.current) {
        const slideOut = Math.min(2.4, Math.max(0, (timerRef.current - 3.2) * 1.3))
        const gentleFloat = timerRef.current > 5.2 ? Math.sin(clock.elapsedTime * 1.8) * 0.08 : 0
        mrnaRef.current.position.x = -1.05 + slideOut + gentleFloat
      }
    } else {
      timerRef.current = 0
      if (builtCount !== 0) setBuiltCount(0)
      if (reclosed) setReclosed(false)
    }
  })

  const rungs = useMemo(() => {
    return PAIRS.map((pair, i) => ({
      y: (i - PAIRS.length / 2) * 0.62,
      angle: i * 0.52,
      isMiddle: i >= 2 && i <= 7,
      ...pair,
    }))
  }, [])

  const f0 = factKeys.at(0)
  const f1 = factKeys.at(1)
  const f2 = factKeys.at(2)

  return (
    <group position-x={-0.35} position-y={0.68} scale={0.62}>
      <color attach="background" args={['#070b14']} />
      <fog attach="fog" args={['#070b14', 10, 22]} />
      <ambientLight intensity={0.95} />
      <directionalLight position-x={4} position-y={7} position-z={6} intensity={1.6} color="#ffffff" />
      <pointLight position-x={-4} position-y={2} position-z={4} intensity={1.1} color="#38bdf8" />
      <pointLight position-x={3} position-y={1} position-z={3} intensity={0.9} color="#34d399" />

      {/* Двойная спираль ДНК */}
      <group ref={helixRef} position-x={-1.25} position-y={1.85} position-z={0}>
        {(!synth || reclosed) && (
          <>
            <mesh geometry={leftStrandGeo} raycast={() => null}>
              <meshPhysicalMaterial color="#64748b" metalness={0.25} roughness={0.25} />
            </mesh>
            <mesh geometry={rightStrandGeo} raycast={() => null}>
              <meshPhysicalMaterial color="#64748b" metalness={0.25} roughness={0.25} />
            </mesh>
          </>
        )}

        {rungs.map((r, idx) => {
          const split = synth && !reclosed && r.isMiddle ? 1.25 : 0
          const rowAngle = synth && !reclosed ? r.angle * 0.15 : r.angle


          return (
            <group key={idx} position-x={0} position-y={r.y} position-z={0} rotation-y={rowAngle}>
              <mesh position-x={-1.35 - split}>
                <sphereGeometry args={[0.2, 18, 18]} />
                <meshPhysicalMaterial color="#94a3b8" metalness={0.3} roughness={0.25} />
              </mesh>
              <mesh position-x={1.35 + split}>
                <sphereGeometry args={[0.2, 18, 18]} />
                <meshPhysicalMaterial color="#94a3b8" metalness={0.3} roughness={0.25} />
              </mesh>

              <mesh position-x={-0.68 - split} rotation-z={Math.PI / 2}>
                <capsuleGeometry args={[0.085, 0.96, 8, 14]} />
                <meshStandardMaterial color={r.left} emissive={r.left} emissiveIntensity={0.4} roughness={0.3} />
              </mesh>

              <mesh position-x={0.68 + split} rotation-z={Math.PI / 2}>
                <capsuleGeometry args={[0.085, 0.96, 8, 14]} />
                <meshStandardMaterial color={r.right} emissive={r.right} emissiveIntensity={0.4} roughness={0.3} />
              </mesh>
            </group>
          )
        })}

        {/* 3 постоянных маркера по списку фактов ДНК (исчезают только после изучения) */}
        {!synth && f0 && !state.studied.includes(f0) && (
          <PulseMarker position={[-1.35, 1.86, 0.25]} onSelect={() => api.inspect(f0, f0)} />
        )}
        {!synth && f1 && !state.studied.includes(f1) && (
          <PulseMarker position={[0.35, 0.0, 0.25]} onSelect={() => api.inspect(f1, f1)} />
        )}
        {!synth && f2 && !state.studied.includes(f2) && (
          <PulseMarker position={[1.35, -1.86, 0.25]} onSelect={() => api.inspect(f2, f2)} />
        )}
      </group>

      {/* Визуализация транскрипции (синтез иРНК) */}
      {synth && (
        <>
          <Tag
            text={reclosed ? 'ДНК восстановила спираль' : '1. РНК-полимераза расплетает ДНК'}
            position={[-1.25, 4.95, 0.2]}
            color="#e2e8f0"
          />

          <mesh ref={polyRef} position-x={-1.25} position-y={2.5} position-z={0.3} rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.65, 0.11, 16, 48]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.1}
              transparent
              opacity={0.75}
            />
          </mesh>

          <NucleotideFlow active={!reclosed} />
          {!reclosed && (
            <Tag text="2. Комплементарная сборка иРНК" position={[1.95, 4.25, 0.5]} color="#fb7185" />
          )}
          {reclosed && (
            <Tag text="Готовая одноцепочечная иРНК" position={[1.35, 4.25, 0.65]} color="#fda4af" />
          )}

          {/* Одноцепочечная нить иРНК */}
          <group ref={mrnaRef} position-x={-1.05} position-y={1.85} position-z={0.75}>
            {builtCount > 1 && (
              <mesh position-x={0} position-y={(2.5 - (builtCount - 1) / 2) * 0.62} position-z={0}>
                <cylinderGeometry args={[0.075, 0.075, (builtCount - 1) * 0.62, 14]} />
                <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.85} />
              </mesh>
            )}

            {rungs.slice(2, 2 + builtCount).map((r, i) => {
              const yPos = (2.5 - i) * 0.62
              return (
                <group key={i} position-x={0} position-y={yPos} position-z={0}>
                  <mesh>
                    <sphereGeometry args={[0.17, 16, 16]} />
                    <meshPhysicalMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.6} roughness={0.2} />
                  </mesh>
                  <mesh position-x={-0.48} rotation-z={Math.PI / 2}>
                    <capsuleGeometry args={[0.075, 0.68, 8, 12]} />
                    <meshStandardMaterial color={r.mrna} emissive={r.mrna} emissiveIntensity={0.55} />
                  </mesh>
                </group>
              )
            })}
          </group>
        </>
      )}
    </group>
  )
}
