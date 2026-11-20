import { lazy } from 'react'
import type { LabPack } from './types'
import { photosynthesisPack } from '../labs/photosynthesis/pack'
import { chemIndicatorsPack } from '../labs/chemistry/pack'
import { chemQualitativePack } from '../labs/chemistry/qualitativePack'
import { chemDetectivePack } from '../labs/chemistry/detectivePack'
import { bioCellPack } from '../labs/biology/cellPack'
import { bioDnaPack } from '../labs/biology/dnaPack'
import { bioDivisionPack } from '../labs/biology/divisionPack'

const LazyLeafWorld = lazy(() =>
  import('../game/world/LeafWorld').then((m) => ({ default: m.LeafWorld })),
)
const LazyBioCellWorld = lazy(() =>
  import('../labs/biology/CellStructureWorld').then((m) => ({ default: m.CellStructureWorld })),
)
const LazyDna3DWorld = lazy(() =>
  import('../labs/biology/Dna3DWorld').then((m) => ({ default: m.Dna3DWorld })),
)
const LazyDivision3DWorld = lazy(() =>
  import('../labs/biology/Division3DWorld').then((m) => ({ default: m.Division3DWorld })),
)
const LazyChemIndicatorsWorld = lazy(() =>
  import('../labs/chemistry/ChemIndicatorsWorld').then((m) => ({ default: m.ChemIndicatorsWorld })),
)
const LazyChemQualitativeWorld = lazy(() =>
  import('../labs/chemistry/QualitativeWorld').then((m) => ({ default: m.QualitativeWorld })),
)
const LazyChemDetectiveWorld = lazy(() =>
  import('../labs/chemistry/DetectiveWorld').then((m) => ({ default: m.DetectiveWorld })),
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
