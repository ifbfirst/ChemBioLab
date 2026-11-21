import { useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  AdditiveBlending,
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  Object3D,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  type InstancedMesh,
  type Mesh,
} from 'three'
import type { Vec3 } from '../../../../platform/types'
import { useLab } from '../../../../game/state'

const BACKGROUND = '#071410'
const PALISADE_X = [-3.15, -2.1, -1.05, 0, 1.05, 2.1] as const

const LAYOUT = {
  upperY: 3.45,
  palisadeY: 2.15,
  lowerY: 0.25,
  vein: [3.65, 1.85, 0] as Vec3,
  xylemFrom: [3.48, 0.95, 0] as Vec3,
  xylemTo: [3.48, 2.75, 0] as Vec3,
  phloemFrom: [1.45, 2.35, 0.1] as Vec3,
  phloemTo: [3.85, 0.95, 0] as Vec3,
  co2From: [0, -0.55, 0.12] as Vec3,
  co2To: [0, 1.55, 0.05] as Vec3,
  o2From: [0.18, 1.35, 0.1] as Vec3,
  o2To: [0.42, -0.6, 0.25] as Vec3,
  markers: {
    epidermis: [-0.4, 3.92, 0.95] as Vec3,
    palisade: [-2.1, 2.75, 0.95] as Vec3,
    vein: [3.65, 2.85, 0.95] as Vec3,
    stoma: [0.85, 0.72, 0.95] as Vec3,
  } as Record<string, Vec3>,
}

function Tag({ text, position, color }: { text: string; position: Vec3; color: string }) {
  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 140
    const ctx = canvas.getContext('2d')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    if (ctx) {
      ctx.clearRect(0, 0, 512, 140)
      ctx.fillStyle = 'rgba(7, 20, 16, 0.78)'
      ctx.beginPath()
      ctx.roundRect(76, 26, 360, 88, 44)
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.font = '700 44px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 256, 70)
      texture.needsUpdate = true
    }
    const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const next = new Sprite(material)
    next.scale.set(1.85, 0.5, 1)
    return next
  }, [text, color])

  return <primitive object={sprite} position={position} />
}

function Flow({
  from,
  to,
  color,
  count,
  active,
  speed,
  size,
}: {
  from: Vec3
  to: Vec3
  color: string
  count: number
  active: boolean
  speed: number
  size: number
}) {
  const ref = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const start = useMemo(() => new Vector3(...from), [from])
  const end = useMemo(() => new Vector3(...to), [to])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    mesh.visible = active
    if (!active) return
    const time = clock.elapsedTime * speed
    for (let index = 0; index < count; index += 1) {
      const t = (time + index / count) % 1
      dummy.position.lerpVectors(start, end, t)
      dummy.scale.setScalar(size)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

function Marker({
  position,
  hot,
  onSelect,
}: {
  position: Vec3
  hot: boolean
  onSelect: () => void
}) {
  const ring = useRef<Mesh>(null)
  const down = useRef({ x: 0, y: 0 })

  useFrame(({ camera, clock }) => {
    if (!ring.current) return
    ring.current.lookAt(camera.position)
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * (hot ? 0.14 : 0.05)
    ring.current.scale.set(pulse, pulse, pulse)
  })

  const selectIfClick = (event: ThreeEvent<PointerEvent>) => {
    const dx = event.clientX - down.current.x
    const dy = event.clientY - down.current.y
    if (dx * dx + dy * dy > 36) return
    event.stopPropagation()
    onSelect()
  }

  return (
    <group position={position}>
      <mesh
        onPointerDown={(event) => {
          event.stopPropagation()
          down.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerUp={selectIfClick}
        onPointerOver={(event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'grab'
        }}
      >
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshStandardMaterial
          color={hot ? '#fef08a' : '#d9f99d'}
          emissive="#bef264"
          emissiveIntensity={hot ? 1.5 : 0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} raycast={() => null}>
        <ringGeometry args={[0.24, 0.31, 28]} />
        <meshBasicMaterial
          color="#ecfccb"
          transparent
          opacity={hot ? 0.95 : 0.6}
          side={DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={hot ? 4.5 : 2.0} distance={2.2} decay={2} color="#bef264" />
    </group>
  )
}
function LightRays({ active }: { active: boolean }) {
  const xs = [-2.1, -0.5, 1.1]
  return (
    <group>
      {xs.map((x) => (
        <mesh key={x} position={[x, 4.45, 0]}>
          <cylinderGeometry args={[0.04, 0.22, 1.25, 16, 1, true]} />
          <meshBasicMaterial
            color="#fde047"
            transparent
            opacity={active ? 0.38 : 0.2}
            depthWrite={false}
            side={DoubleSide}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
      <Flow from={[-2.1, 5.05, 0]} to={[-2.1, 3.65, 0]} color="#fde047" count={3} active={active} speed={0.5} size={0.055} />
      <Flow from={[1.1, 5.05, 0]} to={[1.1, 3.65, 0]} color="#fde047" count={3} active={active} speed={0.5} size={0.055} />
      <Tag text="Свет" position={[-0.5, 5.25, 0.1]} color="#fef08a" />
    </group>
  )
}

function UpperEpidermis() {
  return (
    <group position={[0, LAYOUT.upperY, 0]}>
      {/* Тонкая восковая кутикула поверх эпидермиса */}
      <mesh position={[0.15, 0.21, 0]}>
        <boxGeometry args={[8.5, 0.05, 1.75]} />
        <meshPhysicalMaterial color="#a7f3d0" transparent opacity={0.32} roughness={0.1} depthWrite={false} />
      </mesh>

      {Array.from({ length: 9 }, (_, index) => {
        const x = -3.6 + index * 0.9
        return (
          <group key={x} position={[x, 0, 0]}>
            <mesh scale={[1.05, 0.42, 1.8]}>
              <sphereGeometry args={[0.42, 18, 14]} />
              <meshPhysicalMaterial
                color="#d1fae5"
                transparent
                opacity={0.42}
                roughness={0.2}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0.1, 0, 0.2]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color="#6ee7b7" opacity={0.6} transparent />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Palisade({ synthesis }: { synthesis: boolean }) {
  const chloroplasts: Vec3[] = [
    [-0.16, 0.42, 0.14],
    [0.16, 0.25, -0.14],
    [-0.15, -0.05, -0.15],
    [0.16, -0.32, 0.14],
    [-0.12, -0.52, 0.05],
  ]

  return (
    <group>
      {PALISADE_X.map((x) => {
        const isHero = x === -1.05 && synthesis
        return (
          <group key={x} position={[x, LAYOUT.palisadeY, 0]}>
            {/* Стенка столбчатой клетки */}
            <mesh>
              <capsuleGeometry args={[0.35, 1.08, 8, 18]} />
              <meshPhysicalMaterial
                color="#a7f3d0"
                transparent
                opacity={0.28}
                roughness={0.18}
                depthWrite={false}
              />
            </mesh>

            {/* Центральная вакуоль */}
            <mesh scale={[0.55, 1.35, 0.55]}>
              <sphereGeometry args={[0.32, 14, 14]} />
              <meshPhysicalMaterial
                color="#38bdf8"
                transparent
                opacity={0.16}
                roughness={0.1}
                depthWrite={false}
              />
            </mesh>

            {/* Дисковидные хлоропласты вдоль стенок */}
            {chloroplasts.map((cPos, idx) => (
              <mesh
                key={idx}
                position={cPos}
                rotation={[0.3, idx * 0.8, 0.2]}
                scale={isHero && idx === 1 ? [1.35, 0.8, 1.35] : [1.1, 0.62, 1.1]}
              >
                <sphereGeometry args={[0.115, 14, 10]} />
                <meshStandardMaterial
                  color="#22c55e"
                  emissive={isHero ? '#a3e635' : '#15803d'}
                  emissiveIntensity={isHero ? 1.3 : 0.55}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

function Vein() {
  return (
    <group position={LAYOUT.vein}>
      {/* Склеренхимная обкладка пучка */}
      <mesh scale={[0.92, 1.38, 0.82]}>
        <sphereGeometry args={[0.68, 24, 18]} />
        <meshPhysicalMaterial color="#6ee7b7" transparent opacity={0.24} roughness={0.3} depthWrite={false} />
      </mesh>

      {/* Сосуды ксилемы (вода вверх) */}
      <mesh position={[-0.17, 0.26, 0.08]}>
        <cylinderGeometry args={[0.13, 0.13, 1.35, 18]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[-0.02, 0.26, -0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 1.3, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.5} roughness={0.25} />
      </mesh>

      {/* Ситовидные трубки флоэмы (органические вещества вниз) */}
      <mesh position={[0.19, -0.22, 0.06]}>
        <cylinderGeometry args={[0.12, 0.12, 1.25, 18]} />
        <meshStandardMaterial color="#f97316" emissive="#c2410c" emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
      <Tag text="Жилка" position={[0, 1.48, 0.15]} color="#bae6fd" />
    </group>
  )
}

function SpongyAndLowerEpidermis() {
  const spongyCells: { pos: Vec3; scale: Vec3 }[] = [
    { pos: [-2.85, 1.12, 0.18], scale: [1.15, 0.78, 0.85] },
    { pos: [-1.85, 0.92, -0.22], scale: [1.2, 0.72, 0.8] },
    { pos: [-0.95, 1.18, 0.16], scale: [1.05, 0.76, 0.85] },
    { pos: [0.95, 1.15, -0.16], scale: [1.1, 0.75, 0.82] },
    { pos: [1.95, 0.94, 0.2], scale: [1.22, 0.74, 0.85] },
    { pos: [2.75, 1.18, -0.15], scale: [1.05, 0.72, 0.8] },
  ]

  // Бобовидные замыкающие клетки устьица
  const { leftGuardGeo, rightGuardGeo } = useMemo(() => {
    const leftCurve = new CatmullRomCurve3([
      new Vector3(-0.08, 0, -0.36),
      new Vector3(-0.34, 0, -0.16),
      new Vector3(-0.34, 0, 0.16),
      new Vector3(-0.08, 0, 0.36),
    ])
    const rightCurve = new CatmullRomCurve3([
      new Vector3(0.08, 0, -0.36),
      new Vector3(0.34, 0, -0.16),
      new Vector3(0.34, 0, 0.16),
      new Vector3(0.08, 0, 0.36),
    ])
    return {
      leftGuardGeo: new TubeGeometry(leftCurve, 24, 0.125, 14, false),
      rightGuardGeo: new TubeGeometry(rightCurve, 24, 0.125, 14, false),
    }
  }, [])

  return (
    <group>
      {/* Губчатая мякоть с воздушными межклетниками */}
      {spongyCells.map((cell, idx) => (
        <group key={idx} position={cell.pos}>
          <mesh scale={cell.scale}>
            <sphereGeometry args={[0.38, 18, 14]} />
            <meshPhysicalMaterial
              color="#6ee7b7"
              transparent
              opacity={0.34}
              roughness={0.25}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-0.12, 0.05, 0.1]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0.14, -0.04, -0.08]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}

      {/* Клетки нижней кожицы */}
      {[-3.15, -2.25, -1.35, 1.35, 2.25, 3.15].map((x) => (
        <mesh key={x} position={[x, LAYOUT.lowerY, 0]} scale={[1.05, 0.38, 1.8]}>
          <sphereGeometry args={[0.41, 16, 12]} />
          <meshPhysicalMaterial color="#a7f3d0" transparent opacity={0.38} roughness={0.2} depthWrite={false} />
        </mesh>
      ))}

      {/* Бобовидные замыкающие клетки устьица */}
      <group position={[0, LAYOUT.lowerY, 0]}>
        <mesh geometry={leftGuardGeo}>
          <meshStandardMaterial color="#4ade80" emissive="#16a34a" emissiveIntensity={0.5} roughness={0.25} />
        </mesh>
        <mesh geometry={rightGuardGeo}>
          <meshStandardMaterial color="#4ade80" emissive="#16a34a" emissiveIntensity={0.5} roughness={0.25} />
        </mesh>
      </group>
      <Tag text="Устьице" position={[0, -0.45, 0.2]} color="#bbf7d0" />
    </group>
  )
}

export function LeafWorld({ markerIds }: { markerIds: readonly string[] }) {
  const { state, api } = useLab()
  const { size } = useThree()
  const isMobile = size.width < 640

  // Уменьшенный масштаб, чтобы весь лист с лучами солнца и устьицем помещался в кадр
  const sceneScale = isMobile ? 0.36 : 0.56
  const scenePosX = isMobile ? -0.15 : -0.55
  const scenePosY = isMobile ? 0.85 : 0.72

  const synth = state.synthesis

  return (
    <group>
      <color attach="background" args={[BACKGROUND]} />
      <ambientLight intensity={1.0} />
      <directionalLight position-x={4} position-y={8} position-z={6} intensity={1.5} color="#ffffff" />
      <pointLight position-x={-3} position-y={2} position-z={4} intensity={0.8} color="#34d399" />

      <group position-x={scenePosX} position-y={scenePosY} scale={sceneScale}>
        <LightRays active={synth} />
        <UpperEpidermis />
        <Palisade synthesis={synth} />
        <Vein />
        <SpongyAndLowerEpidermis />

        {/* Потоки веществ при фотосинтезе */}
        <Flow from={LAYOUT.xylemFrom} to={LAYOUT.xylemTo} color="#60a5fa" count={4} active={synth} speed={0.55} size={0.065} />
        <Flow from={LAYOUT.co2From} to={LAYOUT.co2To} color="#ffffff" count={4} active={synth} speed={0.5} size={0.06} />
        <Flow from={LAYOUT.phloemFrom} to={LAYOUT.phloemTo} color="#fb923c" count={4} active={synth} speed={0.5} size={0.065} />
        <Flow from={LAYOUT.o2From} to={LAYOUT.o2To} color="#bef264" count={4} active={synth} speed={0.55} size={0.06} />

        {/* Интерактивные точки изучения */}
        {Object.entries(LAYOUT.markers).map(([id, pos]) => {
          const isHot = markerIds.includes(id)
          if (!isHot) return null
          return (
            <Marker
              key={id}
              position={pos}
              hot={isHot}
              onSelect={() => api.inspect(id, id)}
            />
          )
        })}
      </group>
    </group>
  )
}
