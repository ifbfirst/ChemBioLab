import { LeafWorld } from '../../game/world/LeafWorld'
import type { LabPack } from '../../platform/types'
import { photosynthesisFacts } from './facts'
import { exploreLeafMission, photosynthesisRules } from './logic'
import { leafBounds, leafObjects, leafSpawn } from './objects'

export const photosynthesisPack: LabPack = {
  id: 'photosynthesis',
  subject: 'biology',
  title: 'Секрет зелёного листа',
  grade: 6,
  storageKey: 'himbio-lab:photosynthesis:leaf-section',
  facts: photosynthesisFacts,
  objects: leafObjects,
  rules: photosynthesisRules,
  mission: exploreLeafMission,
  bounds: leafBounds,
  spawn: leafSpawn,
  Location: LeafWorld,
}
