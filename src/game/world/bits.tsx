import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Mesh } from 'three'

/** Плоский светящийся круг, всегда повёрнутый к камере. Дешёвое свечение без постобработки. */
export function BillboardGlow({
  color,
  size,
  opacity,
}: {
  color: string
  size: number
  opacity: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(({ camera }) => {
    if (ref.current) ref.current.quaternion.copy(camera.quaternion)
  })
  return (
    <mesh ref={ref}>
      <circleGeometry args={[size, 20]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
