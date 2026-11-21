import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  DoubleSide,
  TubeGeometry,
  Vector3,
  type Group,
} from 'three'
import { useLab } from '../../../../game/state'
import type { DivisionMode, DivisionPhase } from './DivisionControls'

/** Реалистичная 3D-хромосома: две сестринские хроматиды (X) или одна дочерняя хроматида (V) */
function Chromosome3D({
  color,
  isDuplicated,
  scale = 1,
  onClick,
  onHover,
}: {
  color: string
  isDuplicated: boolean
  scale?: number
  onClick: () => void
  onHover: (v: boolean) => void
}) {
  const { armLeftGeo, armRightGeo } = useMemo(() => {
    const leftCurve = new CatmullRomCurve3([
      new Vector3(-0.18, 0.44, 0.03),
      new Vector3(-0.04, 0.06, 0),
      new Vector3(-0.04, -0.06, 0),
      new Vector3(-0.18, -0.44, -0.03),
    ])
    const rightCurve = new CatmullRomCurve3([
      new Vector3(0.18, 0.44, -0.03),
      new Vector3(0.04, 0.06, 0),
      new Vector3(0.04, -0.06, 0),
      new Vector3(0.18, -0.44, 0.03),
    ])
    return {
      armLeftGeo: new TubeGeometry(leftCurve, 24, 0.062, 12, false),
      armRightGeo: new TubeGeometry(rightCurve, 24, 0.062, 12, false),
    }
  }, [])

  return (
    <group
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(false)
        document.body.style.cursor = 'grab'
      }}
    >
      {/* Первая хроматида */}
      <mesh geometry={armLeftGeo}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.28}
          roughness={0.28}
          metalness={0.08}
        />
      </mesh>

      {/* Вторая сестринская хроматида (только у двухроматидных хромосом) */}
      {isDuplicated && (
        <mesh geometry={armRightGeo}>
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.28}
            roughness={0.28}
            metalness={0.08}
          />
        </mesh>
      )}

      {/* Центромера / кинетохор */}
      <mesh position-x={isDuplicated ? 0 : -0.04}>
        <sphereGeometry args={[0.078, 16, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.85} />
      </mesh>
    </group>
  )
}

/** Клеточный центр (пара перпендикулярных центриолей на полюсе клетки) */
function Centrosome({
  positionX,
  onClick,
}: {
  positionX: number
  onClick: () => void
}) {
  return (
    <group
      position-x={positionX}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'grab'
      }}
    >
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.065, 0.065, 0.24, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
      </mesh>
      <mesh position-y={0.1} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.065, 0.065, 0.24, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.6} />
      </mesh>
      <pointLight intensity={1.8} distance={2.2} color="#fbbf24" />
    </group>
  )
}

/** Изогнутая 3D-нить веретена деления от центриоли к хромосоме */
function SpindleThread({
  fromX,
  to,
}: {
  fromX: number
  to: [number, number, number]
}) {
  const geo = useMemo(() => {
    const midX = (fromX + to[0]) * 0.5
    const curve = new CatmullRomCurve3([
      new Vector3(fromX, 0, 0),
      new Vector3(midX, to[1] * 0.72, to[2] * 0.72),
      new Vector3(to[0], to[1], to[2]),
    ])
    return new TubeGeometry(curve, 20, 0.012, 6, false)
  }, [fromX, to])

  return (
    <mesh geometry={geo} raycast={() => null}>
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.42} />
    </mesh>
  )
}
export function Division3DWorld({
  mode,
  phase,
}: {
  mode: DivisionMode
  phase: DivisionPhase
}) {
  const { facts, api } = useLab()
  const { size } = useThree()
  const rootRef = useRef<Group>(null)
  const [, setHovered] = useState(false)

  const isMobile = size.width < 640
  const sceneScale = isMobile ? 0.56 : 0.78
  const scenePosX = isMobile ? 0 : -0.35

  const factKeys = Object.keys(facts)
  const inspectByIndex = (idx: number) => {
    const key = factKeys[idx] ?? factKeys[0]
    if (key) api.inspect(key, key)
  }

  useFrame((_, delta) => {
    if (rootRef.current) {
      rootRef.current.rotation.y += delta * 0.12
    }
  })

  const poleX = phase === 'prophase' ? 1.55 : phase === 'telophase' ? 2.25 : 1.95
  const isMeiosis1 = mode === 'meiosis1'

  // Координаты и структура хромосом в зависимости от режима (Митоз / Мейоз I / Мейоз II) и фазы
  const chromosomeItems = useMemo(() => {
    // 1. ПРОФАЗА: хроматин спирализуется в X-хромосомы; в Мейозе I гомологичные пары сближаются (биваленты / конъюгация)
    if (phase === 'prophase') {
      if (isMeiosis1) {
        return [
          { pos: [-0.28, 0.58, 0.15] as [number, number, number], rotZ: 0.25, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [-0.05, 0.52, -0.1] as [number, number, number], rotZ: -0.2, color: '#fb7185', dup: true, pole: poleX },
          { pos: [0.12, -0.52, 0.12] as [number, number, number], rotZ: 0.3, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [0.34, -0.58, -0.14] as [number, number, number], rotZ: -0.25, color: '#fb7185', dup: true, pole: poleX },
        ]
      }
      return [
        { pos: [-0.38, 0.55, 0.22] as [number, number, number], rotZ: 0.45, color: '#38bdf8', dup: true, pole: -poleX },
        { pos: [0.35, 0.42, -0.2] as [number, number, number], rotZ: -0.5, color: '#fb7185', dup: true, pole: poleX },
        { pos: [-0.25, -0.48, -0.18] as [number, number, number], rotZ: -0.35, color: '#34d399', dup: true, pole: -poleX },
        { pos: [0.32, -0.42, 0.24] as [number, number, number], rotZ: 0.6, color: '#c084fc', dup: true, pole: poleX },
      ]
    }

    // 2. МЕТАФАЗА: выстраивание строго по экватору (в Мейозе I — биваленты по обе стороны экватора)
    if (phase === 'metaphase') {
      if (isMeiosis1) {
        return [
          { pos: [-0.24, 0.65, 0.1] as [number, number, number], rotZ: 0, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [0.24, 0.65, -0.1] as [number, number, number], rotZ: 0, color: '#fb7185', dup: true, pole: poleX },
          { pos: [-0.24, -0.65, -0.1] as [number, number, number], rotZ: 0, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [0.24, -0.65, 0.1] as [number, number, number], rotZ: 0, color: '#fb7185', dup: true, pole: poleX },
        ]
      }
      return [
        { pos: [0, 0.85, 0.12] as [number, number, number], rotZ: 0, color: '#38bdf8', dup: true, pole: -poleX },
        { pos: [0, 0.28, -0.14] as [number, number, number], rotZ: 0, color: '#fb7185', dup: true, pole: poleX },
        { pos: [0, -0.28, 0.14] as [number, number, number], rotZ: 0, color: '#34d399', dup: true, pole: -poleX },
        { pos: [0, -0.85, -0.12] as [number, number, number], rotZ: 0, color: '#c084fc', dup: true, pole: poleX },
      ]
    }

    // 3. АНАФАЗА: в Мейозе I к полюсам расходятся целые двухроматидные гомологи (dup: true), в Митозе и Мейозе II — однороматидные (dup: false)
    if (phase === 'anaphase') {
      if (isMeiosis1) {
        return [
          { pos: [-1.05, 0.56, 0.12] as [number, number, number], rotZ: 0.15, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [-1.05, -0.56, -0.12] as [number, number, number], rotZ: -0.15, color: '#38bdf8', dup: true, pole: -poleX },
          { pos: [1.05, 0.56, -0.12] as [number, number, number], rotZ: -0.15, color: '#fb7185', dup: true, pole: poleX },
          { pos: [1.05, -0.56, 0.12] as [number, number, number], rotZ: 0.15, color: '#fb7185', dup: true, pole: poleX },
        ]
      }
      return [
        { pos: [-1.1, 0.72, 0.1] as [number, number, number], rotZ: 0.2, color: '#38bdf8', dup: false, pole: -poleX },
        { pos: [-1.1, 0.24, -0.1] as [number, number, number], rotZ: 0.1, color: '#fb7185', dup: false, pole: -poleX },
        { pos: [-1.1, -0.24, 0.1] as [number, number, number], rotZ: -0.1, color: '#34d399', dup: false, pole: -poleX },
        { pos: [-1.1, -0.72, -0.1] as [number, number, number], rotZ: -0.2, color: '#c084fc', dup: false, pole: -poleX },
        { pos: [1.1, 0.72, 0.1] as [number, number, number], rotZ: -0.2, color: '#38bdf8', dup: false, pole: poleX },
        { pos: [1.1, 0.24, -0.1] as [number, number, number], rotZ: -0.1, color: '#fb7185', dup: false, pole: poleX },
        { pos: [1.1, -0.24, 0.1] as [number, number, number], rotZ: 0.1, color: '#34d399', dup: false, pole: poleX },
        { pos: [1.1, -0.72, -0.1] as [number, number, number], rotZ: 0.2, color: '#c084fc', dup: false, pole: poleX },
      ]
    }

    // 4. ТЕЛОФАЗА: хромосомы на полюсах вокруг формирующихся дочерних ядер
    return [
      { pos: [-1.45, 0.36, 0.1] as [number, number, number], rotZ: 0.35, color: '#38bdf8', dup: isMeiosis1, pole: -poleX },
      { pos: [-1.45, -0.36, -0.1] as [number, number, number], rotZ: -0.35, color: '#fb7185', dup: isMeiosis1, pole: -poleX },
      { pos: [1.45, 0.36, -0.1] as [number, number, number], rotZ: -0.35, color: '#38bdf8', dup: isMeiosis1, pole: poleX },
      { pos: [1.45, -0.36, 0.1] as [number, number, number], rotZ: 0.35, color: '#fb7185', dup: isMeiosis1, pole: poleX },
    ]
  }, [phase, isMeiosis1, poleX])

  return (
    <group>
      <color attach="background" args={['#070b14']} />
      <ambientLight intensity={0.85} />
      <directionalLight position-x={4} position-y={7} position-z={6} intensity={1.5} color="#ffffff" />
      <pointLight position-x={-4} position-y={2} position-z={4} intensity={1.1} color="#38bdf8" />
      <pointLight position-x={4} position-y={2} position-z={4} intensity={1.1} color="#34d399" />

      <group ref={rootRef} position-x={scenePosX} position-y={1.88} scale={sceneScale}>
        {/* КЛЕТОЧНАЯ МЕМБРАНА (в Телофазе формирует перетяжку цитокинеза из двух дочерних клеток) */}
        {phase !== 'telophase' ? (
          <mesh
            scale={[phase === 'anaphase' ? 1.48 : 1.28, 1.0, 1.0]}
            onClick={(e) => {
              e.stopPropagation()
              inspectByIndex(3)
            }}
          >
            <sphereGeometry args={[1.85, 40, 40]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.15}
              roughness={0.2}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ) : (
          <group
            onClick={(e) => {
              e.stopPropagation()
              inspectByIndex(3)
            }}
          >
            {/* Левая дочерняя клетка */}
            <mesh position-x={-1.32}>
              <sphereGeometry args={[1.38, 36, 36]} />
              <meshPhysicalMaterial
                color="#34d399"
                transparent
                opacity={0.18}
                roughness={0.2}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Правая дочерняя клетка */}
            <mesh position-x={1.32}>
              <sphereGeometry args={[1.38, 36, 36]} />
              <meshPhysicalMaterial
                color="#34d399"
                transparent
                opacity={0.18}
                roughness={0.2}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}

        {/* ЯДЕРНАЯ ОБОЛОЧКА (растворяется в Профазе и восстанавливается в Телофазе) */}
        {phase === 'prophase' && (
          <mesh raycast={() => null}>
            <sphereGeometry args={[1.05, 24, 24]} />
            <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.24} />
          </mesh>
        )}

        {phase === 'telophase' && (
          <>
            <mesh position-x={-1.45} raycast={() => null}>
              <sphereGeometry args={[0.78, 28, 28]} />
              <meshPhysicalMaterial color="#a855f7" transparent opacity={0.25} roughness={0.25} depthWrite={false} />
            </mesh>
            <mesh position-x={1.45} raycast={() => null}>
              <sphereGeometry args={[0.78, 28, 28]} />
              <meshPhysicalMaterial color="#a855f7" transparent opacity={0.25} roughness={0.25} depthWrite={false} />
            </mesh>
          </>
        )}

        {/* ЦЕНТРИОЛИ НА ПОЛЮСАХ */}
        <Centrosome positionX={-poleX} onClick={() => inspectByIndex(1)} />
        <Centrosome positionX={poleX} onClick={() => inspectByIndex(1)} />

        {/* НИТИ ВЕРЕТЕНА ДЕЛЕНИЯ (активны в Профазе, Метафазе и Анафазе) */}
        {phase !== 'telophase' &&
          chromosomeItems.map((item, idx) => (
            <SpindleThread key={`spindle-${idx}`} fromX={item.pole} to={item.pos} />
          ))}

        {/* ХРОМОСОМЫ */}
        {chromosomeItems.map((item, idx) => (
          <group key={`chr-${idx}`} position-x={item.pos[0]} position-y={item.pos[1]} position-z={item.pos[2]} rotation-z={item.rotZ}>
            <Chromosome3D
              color={item.color}
              isDuplicated={item.dup}
              scale={0.85}
              onClick={() => inspectByIndex(idx % Math.max(1, factKeys.length))}
              onHover={setHovered}
            />
          </group>
        ))}
      </group>
    </group>
  )
}
