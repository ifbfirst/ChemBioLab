import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Object3D,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from 'three'
import type { Vec3 } from '../../platform/types'
import { layout, palisadeX } from '../../labs/biology/grade-6/photosynthesis/layout'
import { useLab } from '../state'

/**
 * Разрез листовой пластинки для 6 класса.
 * Сверху вниз: верхняя кожица, столбчатая мякоть, жилка сбоку, нижняя кожица с устьицем.
 * Лучи, трубки и кружки — схема, а не микрофотография. Это отмечено в карточках тканей.
 */

const BACKGROUND = '#123024'

function Tag({ text, position, color }: { text: string; position: Vec3; color: string }) {
  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 160
    const ctx = canvas.getContext('2d')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    if (ctx) {
      ctx.clearRect(0, 0, 512, 160)
      ctx.font = '700 78px "Segoe UI", sans-serif'
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 256, 80)
      texture.needsUpdate = true
    }
    const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const next = new Sprite(material)
    next.scale.set(1.7, 0.53, 1)
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
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} depthWrite={false} toneMapped={false} />
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
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * (hot ? 0.12 : 0.04)
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
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial
          color={hot ? '#fff6b0' : '#e7ff9a'}
          emissive="#e4ff6a"
          emissiveIntensity={hot ? 1.4 : 0.7}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.28, 0.36, 28]} />
        <meshBasicMaterial
          color="#f3ff8a"
          transparent
          opacity={hot ? 0.95 : 0.55}
          side={DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={hot ? 6 : 2.5} distance={2.4} decay={2} color="#f3ff9a" />
    </group>
  )
}

function LightRays({ active }: { active: boolean }) {
  const material = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const mesh = material.current
    if (!mesh) return
    const glow = active ? 0.55 + Math.sin(clock.elapsedTime * 2) * 0.12 : 0.25
    mesh.scale.setScalar(0.98 + Math.sin(clock.elapsedTime * 1.4) * 0.03)
    const mat = mesh.material
    if (!Array.isArray(mat) && 'opacity' in mat) mat.opacity = glow
  })

  const xs = [-2.1, -0.5, 1.1]
  return (
    <group>
      {xs.map((x) => (
        <mesh key={x} position={[x, 4.7, 0]}>
          <cylinderGeometry args={[0.06, 0.24, 1.7, 12, 1, true]} />
          <meshBasicMaterial
            color="#ffe38a"
            transparent
            opacity={0.25}
            depthWrite={false}
            side={DoubleSide}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh ref={material} position={[-0.5, 5.55, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#fff1a8" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
      </mesh>
      <Flow from={[-2.1, 5.6, 0]} to={[-2.1, 3.6, 0]} color="#ffe56a" count={3} active={active} speed={0.45} size={0.06} />
      <Flow from={[1.1, 5.6, 0]} to={[1.1, 3.6, 0]} color="#ffe56a" count={3} active={active} speed={0.45} size={0.06} />
      <Tag text="Свет" position={[-0.5, 5.85, 0.2]} color="#ffe7a0" />
    </group>
  )
}

function UpperEpidermis() {
  return (
    <group position={[0, layout.upperY, 0]}>
      {Array.from({ length: 9 }, (_, index) => {
        const x = -3.6 + index * 0.9
        return (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.86, 0.34, 1.7]} />
            <meshStandardMaterial
              color="#e7fff0"
              transparent
              opacity={0.45}
              roughness={0.15}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function Palisade({ synthesis }: { synthesis: boolean }) {
  return (
    <group>
      {palisadeX.map((x) => (
        <group key={x} position={[x, layout.palisadeY, 0]}>
          <mesh>
            <capsuleGeometry args={[0.34, 1.05, 4, 12]} />
            <meshStandardMaterial color="#d9ffe4" transparent opacity={0.38} roughness={0.25} depthWrite={false} />
          </mesh>
          <mesh position={[0.05, 0.28, 0.12]} scale={x === -1.05 && synthesis ? [1.28, 1.28, 1.28] : [1, 1, 1]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial
              color="#3dff78"
              emissive={synthesis && x === -1.05 ? '#d6ff55' : '#1f9a40'}
              emissiveIntensity={synthesis && x === -1.05 ? 1.4 : 0.55}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[-0.08, -0.22, -0.05]} scale={[1.15, 0.7, 0.8]}>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshStandardMaterial color="#2fbf62" emissive="#147a32" emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Vein() {
  return (
    <group position={layout.vein}>
      <mesh scale={[0.85, 1.35, 0.7]}>
        <sphereGeometry args={[0.62, 20, 16]} />
        <meshStandardMaterial color="#8fd7a4" transparent opacity={0.3} roughness={0.4} depthWrite={false} />
      </mesh>
      {/* Ксилема (вода вверх) */}
      <mesh position={[-0.12, 0.28, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.35, 16]} />
        <meshStandardMaterial color="#2f7dff" emissive="#1a4ec4" emissiveIntensity={0.35} roughness={0.35} />
      </mesh>
      {/* Флоэма (глюкоза вниз) */}
      <mesh position={[0.22, -0.18, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1.15, 16]} />
        <meshStandardMaterial color="#ff9238" emissive="#b5520e" emissiveIntensity={0.35} roughness={0.35} />
      </mesh>
      <Tag text="H₂O" position={[-0.55, 1.15, 0.35]} color="#93c5fd" />
      <Tag text="Глюкоза" position={[0.15, -1.05, 0.35]} color="#fdba74" />
    </group>
  )
}

/** Нижняя кожица с реалистичным бобовидным устьицем */
function LowerEpidermis({ open }: { open: boolean }) {
  const gap = open ? 0.14 : 0.04
  const leftXs = [-3.6, -2.7, -1.8, -0.95]
  const rightXs = [0.95, 1.8, 2.7, 3.6]

  return (
    <group position={[0, layout.lowerY, 0]}>
      {[...leftXs, ...rightXs].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.86, 0.32, 1.7]} />
          <meshStandardMaterial color="#d8f7e3" transparent opacity={0.45} roughness={0.2} depthWrite={false} />
        </mesh>
      ))}

      {/* Устьице: две бобовидные замыкающие клетки */}
      <group position={layout.stoma} rotation={[Math.PI / 2, 0, 0]}>
        <group position={[-0.18 - gap, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <torusGeometry args={[0.34, 0.12, 16, 28, Math.PI * 1.1]} />
            <meshStandardMaterial color="#58b868" roughness={0.35} />
          </mesh>
          <mesh position={[0.2, 0.2, 0.06]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#a3e635" />
          </mesh>
        </group>

        <group position={[0.18 + gap, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh>
            <torusGeometry args={[0.34, 0.12, 16, 28, Math.PI * 1.1]} />
            <meshStandardMaterial color="#58b868" roughness={0.35} />
          </mesh>
          <mesh position={[0.2, 0.2, 0.06]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#a3e635" />
          </mesh>
        </group>

        {/* Темная устьичная щель */}
        <mesh position={[0, 0, -0.02]}>
          <cylinderGeometry args={[0.1 + gap, 0.1 + gap, 0.16, 16]} />
          <meshBasicMaterial color="#05130c" />
        </mesh>
      </group>
    </group>
  )
}

export function LeafWorld({ markerIds }: { markerIds: readonly string[] }) {
  const { state, api } = useLab()
  const root = useRef<Group>(null)

  const hasEpidermis = state.studied.includes('epidermis')
  const hasVein = state.studied.includes('vein')
  const hasStoma = state.studied.includes('stoma')
  const synth = state.synthesis

  return (
    <group ref={root}>
      <color attach="background" args={[BACKGROUND]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 9, 6]} intensity={1.45} />

      <UpperEpidermis />
      <Palisade synthesis={synth} />
      <Vein />
      <LowerEpidermis open={hasStoma || synth} />

      {/* Потоки: по 3-4 аккуратные частицы вместо каши */}
      <LightRays active={hasEpidermis || synth} />

      {/* Вода по ксилеме */}
      <Flow
        from={layout.xylemFrom}
        to={layout.xylemTo}
        color="#60a5fa"
        count={4}
        active={hasVein || synth}
        speed={0.42}
        size={0.075}
      />

      {/* CO2 через устьице */}
      <Flow
        from={layout.co2From}
        to={layout.co2To}
        color="#ffffff"
        count={3}
        active={hasStoma || synth}
        speed={0.38}
        size={0.07}
      />
      {(hasStoma || synth) && <Tag text="CO₂" position={[-0.65, -0.25, 0.25]} color="#ffffff" />}

      {/* Выходные потоки только при запуске фотосинтеза */}
      <Flow
        from={layout.phloemFrom}
        to={layout.phloemTo}
        color="#fb923c"
        count={4}
        active={synth}
        speed={0.4}
        size={0.08}
      />
      <Flow
        from={layout.o2From}
        to={layout.o2To}
        color="#dff56a"
        count={3}
        active={synth}
        speed={0.38}
        size={0.07}
      />
      {synth && <Tag text="O₂" position={[0.75, -0.25, 0.35]} color="#dff56a" />}

      {/* Интерактивные маркеры */}
      {markerIds.includes('epidermis') && (
        <Marker
          position={layout.markers.epidermis}
          hot={state.focusingId === 'epidermis'}
          onSelect={() => api.inspect('epidermis', 'epidermis')}
        />
      )}
      {markerIds.includes('palisade') && (
        <Marker
          position={layout.markers.palisade}
          hot={state.focusingId === 'palisade'}
          onSelect={() => api.inspect('palisade', 'palisade')}
        />
      )}
      {markerIds.includes('vein') && (
        <Marker
          position={layout.markers.vein}
          hot={state.focusingId === 'vein'}
          onSelect={() => api.inspect('vein', 'vein')}
        />
      )}
      {markerIds.includes('stoma') && (
        <Marker
          position={layout.markers.stoma}
          hot={state.focusingId === 'stoma'}
          onSelect={() => api.inspect('stoma', 'stoma')}
        />
      )}
    </group>
  )
}
