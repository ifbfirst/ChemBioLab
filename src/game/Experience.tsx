import { Canvas } from '@react-three/fiber'
import { OrbitCamera } from './camera/OrbitCamera'
import { Hud } from './ui/Hud'
import { useLab } from './state'
import { cameraFrames } from '../labs/photosynthesis/layout'

export function Experience() {
  const { pack, view } = useLab()
  const Location = pack.Location
  const home = cameraFrames.home

  if (pack.subject === 'chemistry') {
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
        <Location markerIds={view.markerIds} />
        <OrbitCamera />
      </Canvas>
      <Hud />
    </div>
  )
}
