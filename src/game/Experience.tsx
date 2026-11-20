import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitCamera } from './camera/OrbitCamera'
import { Hud } from './ui/Hud'
import { useLab } from './state'
import { cameraFrames } from '../labs/photosynthesis/layout'
import { Division3DWorld } from '../labs/biology/Division3DWorld'
import {
  DivisionControls,
  type DivisionMode,
  type DivisionPhase,
} from '../labs/biology/DivisionControls'

export function Experience() {
  const { pack, view } = useLab()
  const [divMode, setDivMode] = useState<DivisionMode>('mitosis')
  const [divPhase, setDivPhase] = useState<DivisionPhase>('prophase')
  const Location = pack.Location
  const home = cameraFrames.home

  const is3D =
    pack.id === 'photosynthesis' ||
    pack.id === 'bio-dna-3d' ||
    pack.id === 'bio-division-3d'

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
        dpr={[1, 1.75]}
        camera={{ fov: 38, position: home.position, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera }) => {
          gl.toneMappingExposure = 1.08
          camera.lookAt(-0.7, 1.75, 0)
        }}
      >
        {pack.id === 'bio-division-3d' ? (
          <Division3DWorld mode={divMode} phase={divPhase} />
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
    </div>
  )
}
