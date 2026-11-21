import { lazy } from 'react'
import type { LabPack } from './types'
import { photosynthesisPack } from '../labs/biology/grade-6/photosynthesis/pack'
import { bioCellPack } from '../labs/biology/grade-10/cell/pack'
import { bioDnaPack } from '../labs/biology/grade-10/dna/pack'
import { bioDivisionPack } from '../labs/biology/grade-10/devision/pack'

import { chemIndicatorsPack } from '../labs/chemistry/grade-8/indicators/pack'
import { chemQualitativePack } from '../labs/chemistry/grade-8/qualitative/qualitativePack'
import { chemDetectivePack } from '../labs/chemistry/grade-9/detective/detectivePack'

const LazyLeafWorld = lazy(() =>
  import('../labs/biology/grade-6/photosynthesis/LeafWorld').then((m) => ({ default: m.LeafWorld })),
)
const LazyBioCellWorld = lazy(() =>
  import('../labs/biology/grade-10/cell/CellStructureWorld').then((m) => ({
    default: m.CellStructureWorld,
  })),
)
const LazyDna3DWorld = lazy(() =>
  import('../labs/biology/grade-10/dna/Dna3DWorld').then((m) => ({ default: m.Dna3DWorld })),
)
const LazyDivision3DWorld = lazy(() =>
  import('../labs/biology/grade-10/devision/Division3DWorld').then((m) => ({
    default: m.Division3DWorld,
  })),
)
const LazyChemIndicatorsWorld = lazy(() =>
  import('../labs/chemistry/grade-8/indicators/ChemIndicatorsWorld').then((m) => ({
    default: m.ChemIndicatorsWorld,
  })),
)
const LazyChemQualitativeWorld = lazy(() =>
  import('../labs/chemistry/grade-8/qualitative/QualitativeWorld').then((m) => ({
    default: m.QualitativeWorld,
  })),
)
const LazyChemDetectiveWorld = lazy(() =>
  import('../labs/chemistry/grade-9/detective/DetectiveWorld').then((m) => ({
    default: m.DetectiveWorld,
  })),
)

export const labPacks: Record<string, LabPack> = {
  photosynthesis: { ...photosynthesisPack, Location: LazyLeafWorld },
  'bio-cell': { ...bioCellPack, Location: LazyBioCellWorld },
  'bio-dna-3d': { ...bioDnaPack, Location: LazyDna3DWorld },
  'bio-division-3d': { ...bioDivisionPack, Location: LazyDivision3DWorld },
  'chem-indicators': { ...chemIndicatorsPack, Location: LazyChemIndicatorsWorld },
  'chem-qualitative': { ...chemQualitativePack, Location: LazyChemQualitativeWorld },
  'chem-detective': { ...chemDetectivePack, Location: LazyChemDetectiveWorld },
}

export function getLab(id: string): LabPack | undefined {
  return labPacks[id]
}
