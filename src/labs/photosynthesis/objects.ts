import type { Bounds, InteractableDef, Vec3 } from '../../platform/types'
import { layout } from './layout'

/** Четыре ткани разреза. Каждая точка открывает свой научный текст. */
export const leafObjects: readonly InteractableDef[] = [
  {
    id: 'epidermis',
    role: 'cell',
    factId: 'epidermis',
    prompt: 'Верхняя кожица',
    position: layout.markers.epidermis,
    radius: 0.45,
    scale: 1,
  },
  {
    id: 'palisade',
    role: 'chloroplast',
    factId: 'palisade',
    prompt: 'Столбчатая мякоть',
    position: layout.markers.palisade,
    radius: 0.45,
    scale: 1,
  },
  {
    id: 'vein',
    role: 'water',
    factId: 'vein',
    prompt: 'Жилка',
    position: layout.markers.vein,
    radius: 0.45,
    scale: 1,
  },
  {
    id: 'stoma',
    role: 'co2',
    factId: 'stoma',
    prompt: 'Устьице',
    position: layout.markers.stoma,
    radius: 0.45,
    scale: 1,
  },
]

export const leafBounds: Bounds = {
  min: [-8, -1, -4],
  max: [8, 7, 8],
}

export const leafSpawn: Vec3 = [4.8, 3.5, 10.2]
