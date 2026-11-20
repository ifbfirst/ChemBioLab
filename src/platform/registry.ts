import type { LabPack } from './types'
import { photosynthesisPack } from '../labs/photosynthesis/pack'
import { chemIndicatorsPack } from '../labs/chemistry/pack'
import { chemQualitativePack } from '../labs/chemistry/qualitativePack'
import { bioCellPack } from '../labs/biology/cellPack'
import { chemDetectivePack } from '../labs/chemistry/detectivePack'
import { bioDnaPack } from '../labs/biology/dnaPack'
import { bioDivisionPack } from '../labs/biology/divisionPack'

export const labPacks: Record<string, LabPack> = {
  photosynthesis: photosynthesisPack,
  'chem-indicators': chemIndicatorsPack,
  'chem-qualitative': chemQualitativePack,
  'bio-cell': bioCellPack,
  'chem-detective': chemDetectivePack,
  'bio-dna-3d': bioDnaPack,
  'bio-division-3d': bioDivisionPack,
}


export function getLab(id: string): LabPack | undefined {
  return labPacks[id]
}
