import type { Vec3 } from '../../../../platform/types'

/** Учебный разрез листовой пластинки. Координаты только для сцены, не для научных текстов. */
export const palisadeX = [-3.15, -2.1, -1.05, 0, 1.05, 2.1] as const

export const layout = {
  upperY: 3.42,
  palisadeY: 2.18,
  lowerY: 0.32,
  vein: [3.55, 1.85, 0] as Vec3,
  xylemFrom: [3.48, 1.15, 0] as Vec3,
  xylemTo: [3.48, 2.75, 0] as Vec3,
  phloemFrom: [1.35, 2.35, 0.1] as Vec3,
  phloemTo: [3.82, 1.15, 0] as Vec3,
  stoma: [0, 0.32, 0] as Vec3,
  co2From: [0, -0.35, 0.15] as Vec3,
  co2To: [0, 1.45, 0.05] as Vec3,
  o2From: [0.15, 1.25, 0.1] as Vec3,
  o2To: [0.45, -0.45, 0.35] as Vec3,
  hero: [-0.97, 2.5, 0.18] as Vec3,
  markers: {
    epidermis: [0, 4.15, 1.15] as Vec3,
    palisade: [-2.1, 3.05, 1.15] as Vec3,
    vein: [3.55, 3.05, 1.15] as Vec3,
    stoma: [0.85, 0.95, 1.15] as Vec3,
  },
}

export const cameraFrames: Record<string, { position: Vec3; target: Vec3 }> = {
  home: { position: [0.4, 2.35, 11.4], target: [-0.7, 1.75, 0] },
  epidermis: { position: [0.2, 5.6, 6.4], target: [0, 3.5, 0] },
  palisade: { position: [-1.2, 2.7, 4.6], target: [-1.05, 2.3, 0] },
  vein: { position: [6.4, 2.4, 4.4], target: [3.55, 1.9, 0] },
  stoma: { position: [0.15, 1.15, 4.5], target: [0, 0.32, 0] },
  synthesis: { position: [0.8, 2.9, 3.3], target: [-0.97, 2.5, 0.18] },
}
