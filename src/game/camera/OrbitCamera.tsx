import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { cameraZoom } from './zoom'

/** Свободный обзор сцены без автоматического наезда камеры. */
export function OrbitCamera() {
  const { camera, gl } = useThree()

  const controls = useMemo(() => {
    const next = new OrbitControls(camera, gl.domElement)
    next.enableDamping = true
    next.dampingFactor = 0.08
    next.enablePan = false
    next.enableZoom = true
    next.zoomSpeed = 1.25
    next.minDistance = 2.2
    next.maxDistance = 36
    next.minPolarAngle = 0.25
    next.maxPolarAngle = Math.PI * 0.92
    next.target.set(-0.7, 1.75, 0)
    next.update()
    return next
  }, [camera, gl])

  useEffect(() => {
    gl.domElement.style.cursor = 'grab'
    return () => {
      controls.dispose()
    }
  }, [controls, gl])

  useFrame(() => {
    if (cameraZoom.steps !== 0) {
      const steps = cameraZoom.steps
      cameraZoom.steps = 0
      // dollyOut/dollyIn expect a factor below 1: dividing by it moves the camera farther.
      const factor = 0.84 ** Math.abs(steps)
      if (steps < 0) controls.dollyOut(factor)
      else controls.dollyIn(factor)
    }

    controls.update()
  })

  return null
}
