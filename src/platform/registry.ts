import type { LabPack } from './types'
import { photosynthesisPack } from '../labs/photosynthesis/pack'
import { chemIndicatorsPack } from '../labs/chemistry/pack'

export const labPacks: Record<string, LabPack> = {
  photosynthesis: photosynthesisPack,
  'chem-indicators': chemIndicatorsPack,
}

export function getLab(id: string): LabPack | undefined {
  return labPacks[id]
}
