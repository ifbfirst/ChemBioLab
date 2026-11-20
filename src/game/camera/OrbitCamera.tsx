import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { cameraFrames } from '../../labs/photosynthesis/layout'
import { useLab } from '../state'
import { cameraZoom } from './zoom'

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Свободный обзор разреза. Клик по ткани плавно подводит камеру. */
export function OrbitCamera() {
  const { camera, gl } = useThree()
  const { state } = useLab()
  const focusRef = useRef(state.focusingId)
  focusRef.current = state.focusingId

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

  const flight = useRef<{
    fromPos: Vector3
    toPos: Vector3
    fromTarget: Vector3
    toTarget: Vector3
    t: number
  } | null>(null)
  const lastFocus = useRef<string | null>(null)

  useEffect(() => {
    gl.domElement.style.cursor = 'grab'
    return () => {
      controls.dispose()
    }
  }, [controls, gl])

  useFrame((_, delta) => {
    const focus = focusRef.current
    if (focus !== lastFocus.current) {
      lastFocus.current = focus
      if (focus && cameraFrames[focus]) {
        const frame = cameraFrames[focus]
        flight.current = {
          fromPos: camera.position.clone(),
          toPos: new Vector3(...frame.position),
          fromTarget: controls.target.clone(),
          toTarget: new Vector3(...frame.target),
          t: 0,
        }
      }
    }

    if (cameraZoom.steps !== 0) {
      const steps = cameraZoom.steps
      cameraZoom.steps = 0
      flight.current = null
      // dollyOut/dollyIn expect a factor below 1: dividing by it moves the camera farther.
      const factor = 0.84 ** Math.abs(steps)
      if (steps < 0) controls.dollyOut(factor)
      else controls.dollyIn(factor)
    }

    const move = flight.current
    if (move && move.t < 1) {
      controls.enabled = false
      move.t = Math.min(1, move.t + Math.min(delta, 0.05) / 1.05)
      const k = smoothstep(move.t)
      camera.position.lerpVectors(move.fromPos, move.toPos, k)
      controls.target.lerpVectors(move.fromTarget, move.toTarget, k)
      if (move.t >= 1) controls.enabled = true
    } else {
      controls.enabled = true
    }

    controls.update()
  })

  return null
}
