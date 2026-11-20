import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
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
import { useLab } from '../../game/state'

const PAIRS = [
  { left: '#38bdf8', right: '#facc15', mrna: '#facc15' },
  { left: '#4ade80', right: '#fb923c', mrna: '#fb923c' },
  { left: '#facc15', right: '#38bdf8', mrna: '#38bdf8' },
  { left: '#fb923c', right: '#4ade80', mrna: '#4ade80' },
  { left: '#38bdf8', right: '#facc15', mrna: '#facc15' },
  { left: '#4ade80', right: '#fb923c', mrna: '#fb923c' },
  { left: '#facc15', right: '#38bdf8', mrna: '#38bdf8' },
  { left: '#fb923c', right: '#4ade80', mrna: '#4ade80' },
  { left: '#38bdf8', right: '#facc15', mrna: '#facc15' },
  { left: '#4ade80', right: '#fb923c', mrna: '#fb923c' },
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
      ctx.font = '700 44px "Segoe UI", sans-serif'
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 384, 70)
      texture.needsUpdate = true
    }
    const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const next = new Sprite(material)
    next.scale.set(3.2, 0.58, 1)
    return next
  }, [text, color])

  return <primitive object={sprite} position={position} />
}

/** Яркие розовые нуклеотиды РНК, летящие к месту сборки */
function NucleotideFlow({ active }: { active: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const start = useMemo(() => new Vector3(3.2, 4.2, 0.6), [])
  const end = useMemo(() => new Vector3(-1.3, 1.85, 0.6), [])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    mesh.visible = active
    if (!active) return
    const time = clock.elapsedTime * 0.55
    for (let i = 0; i < 3; i++) {
      const t = (time + i / 3) % 1
      dummy.position.lerpVectors(start, end, t)
      dummy.scale.setScalar(0.16)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 3]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
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

  useFrame(({ camera, clock }) => {
    if (!ring.current) return
    ring.current.lookAt(camera.position)
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.12
    ring.current.scale.set(s, s, s)
  })

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'grab'
        }}
      >
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#e7ff9a" emissive="#dff56a" emissiveIntensity={1.3} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial color="#f3ff8a" transparent opacity={0.85} side={DoubleSide} />
      </mesh>
      <pointLight intensity={3} distance={2.5} color="#f3ff8a" />
    </group>
  )
}

export function Dna3DWorld({ markerIds }: { markerIds: readonly string[] }) {
  const { state, api } = useLab()
  const helixRef = useRef<Group>(null)
  const mrnaRef = useRef<Group>(null)
  const [builtCount, setBuiltCount] = useState(0)
  const [reclosed, setReclosed] = useState(false)
  const timerRef = useRef(0)

  const synth = state.synthesis

  useFrame(({ clock }, delta) => {
    if (helixRef.current) {
      if (!synth) {
        helixRef.current.rotation.y += delta * 0.3
      } else {
        helixRef.current.rotation.y += (0 - helixRef.current.rotation.y) * Math.min(1, delta * 3)
      }
    }

    if (synth) {
      timerRef.current += delta
      // Каждые 0.55 сек добавляется 1 звено иРНК (всего 6 звеньев за 3.3 сек)
      const count = Math.min(6, Math.floor(timerRef.current / 0.55) + 1)
      if (count !== builtCount) setBuiltCount(count)

      // После 3.6 сек спираль ДНК смыкается обратно!
      if (timerRef.current > 3.6 && !reclosed) setReclosed(true)

      if (mrnaRef.current) {
        // Готовая розовая цепь иРНК уезжает вправо на x = +2.35 и остаётся там
        const slideOut = Math.min(3.5, Math.max(0, (timerRef.current - 3.3) * 1.5))
        const gentleFloat = timerRef.current > 5.6 ? Math.sin(clock.elapsedTime * 1.8) * 0.08 : 0
        mrnaRef.current.position.x = -1.15 + slideOut + gentleFloat
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

  return (
    <group>
      <color attach="background" args={['#0c1e26']} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.5} />

      {/* Двойная спираль ДНК */}
      <group ref={helixRef} position={[-1.3, 1.85, 0]}>
        {rungs.map((r, idx) => {
          const split = synth && !reclosed && r.isMiddle ? 1.4 : 0
          const rowAngle = synth ? r.angle * 0.2 : r.angle

          return (
            <group key={idx} position={[0, r.y, 0]} rotation={[0, rowAngle, 0]}>
              <mesh position={[-1.35 - split, 0, 0]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.3} />
              </mesh>
              <mesh position={[1.35 + split, 0, 0]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.3} />
              </mesh>

              <mesh position={[-0.68 - split, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 1.15, 12]} />
                <meshStandardMaterial color={r.left} emissive={r.left} emissiveIntensity={0.45} />
              </mesh>

              <mesh position={[0.68 + split, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 1.15, 12]} />
                <meshStandardMaterial color={r.right} emissive={r.right} emissiveIntensity={0.45} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Пошаговая сборка КОНТРАСТНОЙ РОЗОВОЙ НИТИ иРНК */}
      {synth && (
        <>
          <Tag
            text={reclosed ? '1. ДНК восстановила связи' : '1. Разрыв связей ДНК'}
            position={[-1.3, 4.95, 0.2]}
            color="#cbd5e1"
          />

          <NucleotideFlow active={!reclosed} />
          {!reclosed && (
            <Tag text="2. Нуклеотиды РНК" position={[2.5, 4.35, 0.5]} color="#fb7185" />
          )}

          {/* Новая одноцепочечная нить иРНК с ярко-розовым остовом */}
          <group ref={mrnaRef} position={[-1.15, 1.85, 0.65]}>
            {/* Вертикальная связующая нить остова иРНК, растущая сверху вниз */}
            {builtCount > 1 && (
              <mesh position={[0, (2.5 - (builtCount - 1) / 2) * 0.62, 0]}>
                <cylinderGeometry args={[0.08, 0.08, (builtCount - 1) * 0.62, 12]} />
                <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.9} />
              </mesh>
            )}

            {rungs.slice(2, 2 + builtCount).map((r, i) => (
              <group key={i} position={[0, (2.5 - i) * 0.62, 0]}>
                {/* Ярко-розовый узел остова иРНК */}
                <mesh>
                  <sphereGeometry args={[0.25, 16, 16]} />
                  <meshStandardMaterial color="#f43f5e" emissive="#fb7185" emissiveIntensity={1.1} />
                </mesh>
                {/* Нуклеотид иРНК */}
                <mesh position={[-0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.1, 0.1, 1.15, 12]} />
                  <meshStandardMaterial color={r.mrna} emissive={r.mrna} emissiveIntensity={0.85} />
                </mesh>
              </group>
            ))}
          </group>

          <Tag text="3. Готовая цепь иРНК" position={[2.35, 4.2, 0.5]} color="#fb7185" />
        </>
      )}

      {/* Интерактивные маркеры */}
      {markerIds.includes('backbone') && (
        <PulseMarker position={[-2.65, 3.2, 0.5]} onSelect={() => api.inspect('backbone', 'backbone')} />
      )}
      {markerIds.includes('bases') && (
        <PulseMarker position={[-1.3, 1.85, 1.1]} onSelect={() => api.inspect('bases', 'bases')} />
      )}
      {markerIds.includes('transcription') && (
        <PulseMarker position={[0.15, 0.55, 0.5]} onSelect={() => api.inspect('transcription', 'transcription')} />
      )}
    </group>
  )
}
