import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
} from 'three'
import type { Vec3 } from '../../platform/types'
import type { DivisionMode, DivisionPhase } from './DivisionControls'

const PHASE_TITLES: Record<DivisionPhase, string> = {
  prophase: '1. Профаза',
  metaphase: '2. Метафаза',
  anaphase: '3. Анафаза',
  telophase: '4. Телофаза',
}

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
      ctx.font = '700 42px "Segoe UI", sans-serif'
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

/** Отдельная 3D-хромосома / хроматида, плавно плывущая в целевую точку */
function SmoothChromosome({
  targetPos,
  targetRotZ,
  color,
  crossoverColor,
  twoChromatids,
}: {
  targetPos: Vec3
  targetRotZ: number
  color: string
  crossoverColor?: string
  twoChromatids: boolean
}) {
  const groupRef = useRef<Group>(null)
  const targetVec = useMemo(() => new Vector3(...targetPos), [targetPos])

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    const speed = Math.min(1, delta * 3.2)
    g.position.lerp(targetVec, speed)
    g.rotation.z += (targetRotZ - g.rotation.z) * speed
  })

  return (
    <group ref={groupRef} position={targetPos}>
      {/* Первая хроматида */}
      <mesh position={[twoChromatids ? -0.09 : 0, 0, 0]} rotation={[0, 0, twoChromatids ? 0.18 : 0]}>
        <capsuleGeometry args={[0.072, 0.55, 6, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />
      </mesh>

      {/* Вторая хроматида (для X-образной двухроматидной хромосомы) */}
      {twoChromatids && (
        <mesh position={[0.09, 0, 0]} rotation={[0, 0, -0.18]}>
          <capsuleGeometry args={[0.072, 0.55, 6, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />
        </mesh>
      )}

      {/* Участок кроссинговера */}
      {crossoverColor && (
        <mesh position={[twoChromatids ? 0.13 : 0, -0.22, 0.02]} rotation={[0, 0, twoChromatids ? -0.18 : 0]}>
          <sphereGeometry args={[0.082, 12, 12]} />
          <meshStandardMaterial color={crossoverColor} emissive={crossoverColor} emissiveIntensity={0.6} />
        </mesh>
      )}

      {/* Центромера */}
      <mesh>
        <sphereGeometry args={[0.088, 12, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

export function Division3DWorld({
  mode = 'mitosis',
  phase = 'prophase',
}: {
  markerIds?: readonly string[]
  mode?: DivisionMode
  phase?: DivisionPhase
}) {
  const cellGroup = useRef<Group>(null)
  const mainMembraneRef = useRef<Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (cellGroup.current) {
      cellGroup.current.position.y = 1.95 + Math.sin(clock.elapsedTime * 1.4) * 0.04
    }
    if (mainMembraneRef.current) {
      const targetScaleX = phase === 'anaphase' ? 1.38 : 1.05
      mainMembraneRef.current.scale.x += (targetScaleX - mainMembraneRef.current.scale.x) * Math.min(1, delta * 3)
    }
  })

  // Безопасное расхождение, чтобы хромосомы оставались внутри новых ядер и не наезжали на центриоли
  const spread = phase === 'anaphase' ? 1.45 : phase === 'telophase' ? 1.72 : 0
  const isSplit = phase === 'anaphase' || phase === 'telophase'

  return (
    <>
      <color attach="background" args={['#0d1f22']} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.5} />

      <group ref={cellGroup} position={[-0.6, 1.95, 0]}>
        {/* Оболочка клетки */}
        {phase !== 'telophase' ? (
          <mesh ref={mainMembraneRef} scale={[1.05, 1, 0.85]}>
            <sphereGeometry args={[2.55, 32, 24]} />
            <meshStandardMaterial color="#34d399" transparent opacity={0.14} roughness={0.2} depthWrite={false} />
          </mesh>
        ) : (
          <>
            <mesh position={[-1.75, 0, 0]}>
              <sphereGeometry args={[1.55, 28, 22]} />
              <meshStandardMaterial color="#34d399" transparent opacity={0.18} depthWrite={false} />
            </mesh>
            <mesh position={[1.75, 0, 0]}>
              <sphereGeometry args={[1.55, 28, 22]} />
              <meshStandardMaterial color="#34d399" transparent opacity={0.18} depthWrite={false} />
            </mesh>
          </>
        )}

        {/* Центриоли на полюсах (в телофазе сдвинуты к внешним краям дочерних клеток) */}
        <mesh position={[phase === 'telophase' ? -3.05 : -2.6, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 12]} />
          <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[phase === 'telophase' ? 3.05 : 2.6, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 12]} />
          <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.6} />
        </mesh>

        {/* Нити веретена деления (исчезают в телофазе!) */}
        {phase !== 'telophase' &&
          [-0.95, -0.32, 0.32, 0.95].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 5.1, 8]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={0.26} side={DoubleSide} />
            </mesh>
          ))}

        {/* РЕЖИМ 1: МИТОЗ (в метафазе 1 ряд из 4 хромосом; в анафазе к обоим полюсам идут ВСЕ 4 цвета!) */}
        {mode === 'mitosis' && (
          <>
            {/* 1. Голубая хромосома -> делится на левую и правую хроматиды */}
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [-0.45, 0.75, 0.1] : [-spread, 0.95, 0.1]}
              targetRotZ={phase === 'prophase' ? 0.4 : 0}
              color="#38bdf8"
              twoChromatids={!isSplit}
            />
            {isSplit && (
              <SmoothChromosome targetPos={[spread, 0.95, 0.1]} targetRotZ={0} color="#38bdf8" twoChromatids={false} />
            )}

            {/* 2. Розовая хромосома -> делится на левую и правую хроматиды */}
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [0.45, 0.65, -0.1] : [-spread, 0.32, -0.1]}
              targetRotZ={phase === 'prophase' ? -0.35 : 0}
              color="#fb7185"
              twoChromatids={!isSplit}
            />
            {isSplit && (
              <SmoothChromosome targetPos={[spread, 0.32, -0.1]} targetRotZ={0} color="#fb7185" twoChromatids={false} />
            )}

            {/* 3. Зелёная хромосома -> делится на левую и правую хроматиды */}
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [-0.4, -0.65, -0.15] : [-spread, -0.32, -0.15]}
              targetRotZ={phase === 'prophase' ? -0.5 : 0}
              color="#4ade80"
              twoChromatids={!isSplit}
            />
            {isSplit && (
              <SmoothChromosome targetPos={[spread, -0.32, -0.15]} targetRotZ={0} color="#4ade80" twoChromatids={false} />
            )}

            {/* 4. Оранжевая хромосома -> делится на левую и правую хроматиды */}
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [0.4, -0.75, 0.15] : [-spread, -0.95, 0.15]}
              targetRotZ={phase === 'prophase' ? 0.45 : 0}
              color="#fb923c"
              twoChromatids={!isSplit}
            />
            {isSplit && (
              <SmoothChromosome targetPos={[spread, -0.95, 0.15]} targetRotZ={0} color="#fb923c" twoChromatids={false} />
            )}
          </>
        )}

        {/* РЕЖИМ 2: МЕЙОЗ I (биваленты в 2 ряда; к полюсам расходятся целые X-хромосомы!) */}
        {mode === 'meiosis1' && (
          <>
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [-0.25, 0.65, 0.1] : [-0.22 - spread, 0.65, 0.1]}
              targetRotZ={phase === 'prophase' ? 0.25 : 0}
              color="#38bdf8"
              crossoverColor="#fb7185"
              twoChromatids={true}
            />
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [0.25, 0.65, -0.1] : [0.22 + spread, 0.65, -0.1]}
              targetRotZ={phase === 'prophase' ? -0.25 : 0}
              color="#fb7185"
              crossoverColor="#38bdf8"
              twoChromatids={true}
            />
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [-0.25, -0.65, -0.15] : [-0.22 - spread, -0.65, -0.15]}
              targetRotZ={phase === 'prophase' ? -0.25 : 0}
              color="#4ade80"
              crossoverColor="#fb923c"
              twoChromatids={true}
            />
            <SmoothChromosome
              targetPos={phase === 'prophase' ? [0.25, -0.65, 0.15] : [0.22 + spread, -0.65, 0.15]}
              targetRotZ={phase === 'prophase' ? 0.25 : 0}
              color="#fb923c"
              crossoverColor="#4ade80"
              twoChromatids={true}
            />
          </>
        )}

        <Tag
        text={`${mode === 'mitosis' ? 'Митоз' : 'Мейоз I'} • ${PHASE_TITLES[phase]}`}
        position={[0, 3.05, 0]}
        color="#dff56a"
      />
    </group>
  </>
)
}
