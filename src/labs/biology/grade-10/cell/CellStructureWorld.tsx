import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CheckCircle2, Microscope } from 'lucide-react'
import * as THREE from 'three'
import { useLab } from '../../../../game/state'

type CellType = 'plant' | 'animal' | 'bacteria'

interface Organelle3D {
  id: string
  label: string
  presentIn: CellType[]
  color: string
}

const CELL_TABS: { id: CellType; label: string; short: string }[] = [
  { id: 'plant', label: 'Растительная', short: 'Растение' },
  { id: 'animal', label: 'Животная', short: 'Животное' },
  { id: 'bacteria', label: 'Бактерия', short: 'Бактерия' },
]

const ORGANELLES_3D: Organelle3D[] = [
  { id: 'nucleus', label: 'Ядро', presentIn: ['plant', 'animal'], color: '#a855f7' },
  { id: 'chloroplast', label: 'Хлоропласт', presentIn: ['plant'], color: '#22c55e' },
  { id: 'vacuole', label: 'Вакуоль', presentIn: ['plant'], color: '#38bdf8' },
  { id: 'mitochondria', label: 'Митохондрия', presentIn: ['plant', 'animal'], color: '#f97316' },
  { id: 'ribosome', label: 'Рибосомы', presentIn: ['plant', 'animal', 'bacteria'], color: '#eab308' },
  { id: 'wall', label: 'Клет. стенка', presentIn: ['plant', 'bacteria'], color: '#10b981' },
]

export function Cell3DScene({ cellType }: { cellType: CellType }) {
  const { facts, api } = useLab()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const rootRef = useRef<THREE.Group>(null)

  const flagellumGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.22, 0, 0),
      new THREE.Vector3(1.52, 0.16, 0.06),
      new THREE.Vector3(1.85, -0.14, -0.05),
      new THREE.Vector3(2.18, 0.12, 0.04),
      new THREE.Vector3(2.48, -0.04, 0),
    ])
    return new THREE.TubeGeometry(curve, 32, 0.028, 8, false)
  }, [])

  const factKeys = Object.keys(facts)
  const resolveFactId = (shortKey: string, fallbackIndex: number) =>
    factKeys.find((k) => k.toLowerCase().includes(shortKey)) ?? factKeys[fallbackIndex] ?? shortKey

  const onSelect = (shortKey: string) => {
    const idx = ORGANELLES_3D.findIndex((o) => o.id === shortKey)
    const targetId = resolveFactId(shortKey, idx >= 0 ? idx : 0)
    api.inspect(targetId, targetId)
  }

  useFrame((_, delta) => {
    if (rootRef.current) {
      rootRef.current.rotation.y += delta * 0.14
    }
  })

  return (
    <group ref={rootRef} position-x={-0.35} position-y={1.85} scale={0.7}>
      <ambientLight intensity={0.9} />
      <directionalLight position-x={4} position-y={6} position-z={5} intensity={1.4} color="#ffffff" />
      <pointLight position-x={-4} position-y={-3} position-z={4} intensity={0.85} color="#38bdf8" />

      {/* 1. ОБОЛОЧКА / КЛЕТОЧНАЯ СТЕНКА */}
      {cellType === 'plant' && (
        <group>
          <mesh
            scale={[1.18, 0.85, 1.05]}
            onClick={(e) => {
              if (e.intersections.some((hit) => hit.object.userData?.isOrganelle)) return
              e.stopPropagation()
              onSelect('wall')
            }}
            onPointerOver={(e) => {
              if (e.intersections.some((hit) => hit.object.userData?.isOrganelle)) return
              setHoveredId('wall')
            }}
            onPointerOut={() => setHoveredId(null)}
          >
            <dodecahedronGeometry args={[1.58, 1]} />
            <meshPhysicalMaterial
              color={hoveredId === 'wall' ? '#34d399' : '#10b981'}
              transparent
              opacity={hoveredId === 'wall' ? 0.26 : 0.18}
              roughness={0.25}
              depthWrite={false}
            />
          </mesh>

          <mesh raycast={() => null} scale={[1.12, 0.8, 1.0]}>
            <dodecahedronGeometry args={[1.52, 1]} />
            <meshPhysicalMaterial
              color="#34d399"
              transparent
              opacity={0.12}
              roughness={0.3}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {cellType === 'animal' && (
        <mesh raycast={() => null} scale={[1.1, 0.92, 1.05]}>
          <sphereGeometry args={[1.55, 36, 36]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.16}
            roughness={0.2}
            depthWrite={false}
          />
        </mesh>
      )}

      {cellType === 'bacteria' && (
        <group>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => {
              if (e.intersections.some((hit) => hit.object.userData?.isOrganelle)) return
              e.stopPropagation()
              onSelect('wall')
            }}
            onPointerOver={(e) => {
              if (e.intersections.some((hit) => hit.object.userData?.isOrganelle)) return
              setHoveredId('wall')
            }}
            onPointerOut={() => setHoveredId(null)}
          >
            <capsuleGeometry args={[0.74, 1.48, 20, 32]} />
            <meshPhysicalMaterial
              color={hoveredId === 'wall' ? '#34d399' : '#10b981'}
              transparent
              opacity={hoveredId === 'wall' ? 0.3 : 0.22}
              roughness={0.25}
              depthWrite={false}
            />
          </mesh>

          <mesh geometry={flagellumGeo} raycast={() => null}>
            <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.45} />
          </mesh>

          <mesh position={[-0.15, 0, 0]} rotation={[0.5, 0.3, 0]} raycast={() => null}>
            <torusKnotGeometry args={[0.3, 0.042, 64, 12, 2, 3]} />
            <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.45} />
          </mesh>
        </group>
      )}
      {/* 2. ЯДРО С ЯДРЫШКОМ */}
      {(cellType === 'plant' || cellType === 'animal') && (
        <group
          position={cellType === 'plant' ? [-0.82, 0.12, 0.12] : [0, 0.05, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('nucleus')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHoveredId('nucleus')
          }}
          onPointerOut={() => setHoveredId(null)}
          scale={hoveredId === 'nucleus' ? 1.14 : 1}
        >
          <mesh userData={{ isOrganelle: true }}>
            <sphereGeometry args={[0.42, 28, 28]} />
            <meshPhysicalMaterial color="#a855f7" transparent opacity={0.72} roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.06, 0.08]} userData={{ isOrganelle: true }}>
            <sphereGeometry args={[0.16, 20, 20]} />
            <meshStandardMaterial color="#e9d5ff" emissive="#9333ea" emissiveIntensity={0.65} />
          </mesh>
        </group>
      )}

      {/* 3. ЦЕНТРАЛЬНАЯ ВАКУОЛЬ */}
      {cellType === 'plant' && (
        <mesh
          position={[0.42, -0.05, -0.18]}
          userData={{ isOrganelle: true }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect('vacuole')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHoveredId('vacuole')
          }}
          onPointerOut={() => setHoveredId(null)}
          scale={hoveredId === 'vacuole' ? 1.08 : 1}
        >
          <sphereGeometry args={[0.64, 28, 28]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.45} roughness={0.12} />
        </mesh>
      )}

      {/* 4. ХЛОРОПЛАСТЫ */}
      {cellType === 'plant' &&
        [
          { pos: [0.98, 0.52, 0.52] as [number, number, number], rot: [0.4, 0.2, -0.5] as [number, number, number] },
          { pos: [-0.42, 0.58, -0.58] as [number, number, number], rot: [-0.3, 0.6, 0.4] as [number, number, number] },
          { pos: [0.88, -0.48, 0.54] as [number, number, number], rot: [0.2, -0.4, 0.3] as [number, number, number] },
        ].map((cp, idx) => (
          <group
            key={idx}
            position={cp.pos}
            rotation={cp.rot}
            onClick={(e) => {
              e.stopPropagation()
              onSelect('chloroplast')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId('chloroplast')
            }}
            onPointerOut={() => setHoveredId(null)}
            scale={hoveredId === 'chloroplast' ? 1.16 : 1}
          >
            <mesh scale={[1.65, 0.78, 0.98]} userData={{ isOrganelle: true }}>
              <sphereGeometry args={[0.25, 20, 20]} />
              <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.45} />
            </mesh>
          </group>
        ))}

      {/* 5. МИТОХОНДРИИ */}
      {(cellType === 'plant' || cellType === 'animal') &&
        [
          { pos: [-0.52, -0.54, 0.62] as [number, number, number], rot: [0.3, 0.5, 0.8] as [number, number, number] },
          { pos: [0.72, 0.46, -0.62] as [number, number, number], rot: [-0.4, 0.2, -0.6] as [number, number, number] },
        ].map((mt, idx) => (
          <mesh
            key={idx}
            position={mt.pos}
            rotation={mt.rot}
            userData={{ isOrganelle: true }}
            onClick={(e) => {
              e.stopPropagation()
              onSelect('mitochondria')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId('mitochondria')
            }}
            onPointerOut={() => setHoveredId(null)}
            scale={hoveredId === 'mitochondria' ? 1.18 : 1}
          >
            <capsuleGeometry args={[0.15, 0.34, 12, 20]} />
            <meshStandardMaterial color="#f97316" emissive="#c2410c" emissiveIntensity={0.45} />
          </mesh>
        ))}

      {/* 6. РИБОСОМЫ НА МЕМБРАНАХ ЭПС */}
      <group
        position={cellType === 'plant' ? [-0.82, 0.12, 0.12] : [0, 0.05, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect('ribosome')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('ribosome')
        }}
        onPointerOut={() => setHoveredId(null)}
        scale={hoveredId === 'ribosome' ? 1.14 : 1}
      >
        <mesh userData={{ isOrganelle: true }}>
          <torusGeometry args={[0.58, 0.12, 8, 24, Math.PI * 1.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {cellType !== 'bacteria' && (
          <mesh rotation={[0.35, 0.15, 0]}>
            <torusGeometry args={[0.58, 0.024, 10, 36, Math.PI * 1.35]} />
            <meshStandardMaterial color="#c084fc" transparent opacity={0.45} roughness={0.4} />
          </mesh>
        )}

        {Array.from({ length: 14 }, (_, idx) => {
          const angle = (idx / 14) * Math.PI * 1.35
          const radius = cellType === 'bacteria' ? 0.44 : 0.58
          const rx = Math.cos(angle) * radius
          const ry = Math.sin(angle) * radius
          const rz = (idx % 2 === 0 ? 1 : -1) * 0.06
          return (
            <mesh key={idx} position={[rx, ry, rz]} userData={{ isOrganelle: true }}>
              <sphereGeometry args={[0.036, 10, 10]} />
              <meshStandardMaterial
                color={hoveredId === 'ribosome' ? '#fde047' : '#eab308'}
                emissive="#ca8a04"
                emissiveIntensity={0.65}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function CellControls({
  cellType,
  setCellType,
}: {
  cellType: CellType
  setCellType: (t: CellType) => void
}) {
  return (
    <div
    data-bottom-dock
    className="pointer-events-none fixed inset-x-0 bottom-3 z-10 mx-auto flex max-w-md justify-center px-3 sm:bottom-5"
  >

      <div className="pointer-events-auto flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/90 p-2 shadow-xl backdrop-blur-md">
        <div className="hidden items-center gap-1.5 pl-2 text-xs font-bold text-slate-300 sm:flex">
          <Microscope className="h-4 w-4 text-emerald-400" />
          <span>Препарат:</span>
        </div>

        <div className="grid w-full grid-cols-3 gap-1 sm:flex sm:w-auto">
          {CELL_TABS.map((tab) => {
            const active = cellType === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCellType(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export function CellStructureWorld() {
  return null
}
