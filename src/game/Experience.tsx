import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitCamera } from './camera/OrbitCamera'
import { Hud } from './ui/Hud'
import { useLab } from './state'
import {
  DivisionControls,
  DivisionMode,
  DivisionPhase,
} from '../labs/biology/grade-10/devision/DivisionControls'
import { Division3DWorld } from '../labs/biology/grade-10/devision/Division3DWorld'
import { Cell3DScene, CellControls } from '../labs/biology/grade-10/cell/CellStructureWorld'

export function Experience() {
  const { pack, view } = useLab()
  const [divMode, setDivMode] = useState<DivisionMode>('mitosis')
  const [divPhase, setDivPhase] = useState<DivisionPhase>('prophase')
  const [cellType, setCellType] = useState<'plant' | 'animal' | 'bacteria'>('plant')
  const Location = pack.Location

  const isCell3D = pack.id.includes('cell')
  const is3D =
    pack.id === 'photosynthesis' ||
    pack.id === 'bio-dna-3d' ||
    pack.id === 'bio-division-3d' ||
    isCell3D

  if (!is3D) {
    return (
      <div className="app">
        <Location markerIds={view.markerIds} />
        <Hud />
      </div>
    )
  }

  return (
    <div className="app">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: isCell3D ? [0, 0.8, 4.4] :[0, 2, 6], fov: 45 }}

        onCreated={({ gl, camera }) => {
          gl.toneMappingExposure = 1.08
          if (isCell3D) {
            camera.lookAt(0, 0, 0)
          } else {
            camera.lookAt(-0.7, 1.75, 0)
          }
        }}
      >
        {pack.id === 'bio-division-3d' ? (
          <Division3DWorld mode={divMode} phase={divPhase} />
        ) : isCell3D ? (
          <Cell3DScene cellType={cellType} />
        ) : (
          <Location markerIds={view.markerIds} />
        )}
        <OrbitCamera />
      </Canvas>
      <Hud />
      {pack.id === 'bio-division-3d' && (
        <DivisionControls
          mode={divMode}
          setMode={setDivMode}
          phase={divPhase}
          setPhase={setDivPhase}
        />
      )}
      {isCell3D && <CellControls cellType={cellType} setCellType={setCellType} />}
    </div>
  )
}
