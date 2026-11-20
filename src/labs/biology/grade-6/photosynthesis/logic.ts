import type { InteractableDef, MissionDefinition, MissionRules, MissionView } from '../../../../platform/types'

const tissueIds = ['epidermis', 'palisade', 'vein', 'stoma'] as const

export const exploreLeafMission: MissionDefinition = {
  id: 'study-leaf-section',
  title: 'Изучи лист',
  intro:
    'Перед тобой разрез листовой пластинки. Вращай его мышью и нажимай на светящиеся точки.',
  stages: [
    {
      id: 'tissues',
      objective: 'Изучи четыре части разреза: нажимай на светящиеся точки.',
      allGroups: [
        { label: 'кожица', objectIds: ['epidermis'] },
        { label: 'мякоть', objectIds: ['palisade'] },
        { label: 'жилка', objectIds: ['vein'] },
        { label: 'устьице', objectIds: ['stoma'] },
      ],
    },
  ],
  summaryTitle: 'Фотосинтез',
  summary: [
    'В хлоропласте сходятся свет, вода и углекислый газ.',
    'Образуются органические вещества, а кислород выходит через устьице.',
  ],
  nextMissionTitle: 'Виртуальный эксперимент',
  nextMissionText: 'Следующая миссия покажет, как меняется фотосинтез, если убрать свет, воду или углекислый газ.',
}

function studiedTissue(studied: readonly string[], id: string): boolean {
  return studied.includes(id)
}

export function getView(studied: readonly string[], _introOpen: boolean): MissionView {
  const doneCount = tissueIds.filter((id) => studiedTissue(studied, id)).length
  const done = doneCount === tissueIds.length
  return {
    missionTitle: exploreLeafMission.title,
    step: doneCount,
    steps: tissueIds.length,
    objective: done
      ? 'Все части изучены. Запусти фотосинтез.'
      : 'Изучи четыре части разреза: нажимай на светящиеся точки.',
    chips: exploreLeafMission.stages[0]?.allGroups?.map((group) => ({
      label: group.label,
      done: group.objectIds.some((id) => studied.includes(id)),
    })),
    markerIds: tissueIds.filter((id) => !studiedTissue(studied, id)),
    done,
  }
}

export function applyInspect(studied: readonly string[], objectId: string): readonly string[] {
  if (!tissueIds.includes(objectId as (typeof tissueIds)[number])) return studied
  if (studied.includes(objectId)) return studied
  return [...studied, objectId]
}

export function pickInteractable(): InteractableDef | null {
  return null
}

export const photosynthesisRules: MissionRules = {
  applyInspect,
  getView,
  pickInteractable: () => pickInteractable(),
}
