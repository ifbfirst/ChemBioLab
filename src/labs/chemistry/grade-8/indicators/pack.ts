import type {
    Bounds,
    Fact,
    InteractableDef,
    LabPack,
    MissionDefinition,
    MissionRules,
    MissionView,
    Vec3,
  } from '../../../../platform/types'
  import { ChemIndicatorsWorld } from './ChemIndicatorsWorld'
  
  const stepIds = ['acid-litmus', 'alkali-phenol', 'water-methyl'] as const
  
  const indicatorsFacts: Record<string, Fact> = {
    'acid-litmus': {
      id: 'acid-litmus',
      title: 'Кислая среда (HCl + лакмус)',
      body: 'В растворе соляной кислоты (HCl) присутствуют ионы водорода H⁺. Фиолетовый лакмус в кислой среде становится красным.',
      note: 'Уравнение диссоциации: HCl → H⁺ + Cl⁻.',
    },
    'alkali-phenol': {
      id: 'alkali-phenol',
      title: 'Щелочная среда (NaOH + фенолфталеин)',
      body: 'Гидроксид натрия (NaOH) — щёлочь, дающая гидроксид-ионы OH⁻. Бесцветный фенолфталеин становится малиновым.',
      note: 'Фенолфталеин изменяет окраску только в щелочной среде.',
    },
    'water-methyl': {
      id: 'water-methyl',
      title: 'Нейтральная среда (H₂O + метилоранж)',
      body: 'В чистой воде среда нейтральная. Метилоранж сохраняет оранжевую окраску.',
      note: 'В кислой среде метилоранж розово-красный, в щелочной — жёлтый.',
    },
  }
  
  const groups = [
    { label: 'кислота', objectIds: ['acid-litmus'] },
    { label: 'щёлочь', objectIds: ['alkali-phenol'] },
    { label: 'вода', objectIds: ['water-methyl'] },
  ]
  
  const indicatorsMission: MissionDefinition = {
    id: 'chem-indicators-8',
    title: 'Среда растворов и индикаторы',
    intro: 'Проведи три опыта с кислотой, щёлочью и водой.',
    stages: [
      {
        id: 'tests',
        objective: 'Нажми на кнопку над каждой пробиркой, чтобы добавить индикатор.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Индикаторы изучены',
    summary: ['Индикаторы меняют цвет в зависимости от среды раствора.'],
    nextMissionTitle: 'Качественные реакции',
    nextMissionText: 'Следующая тема — распознавание солей по цвету осадка.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: indicatorsMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Все три раствора исследованы!'
            : 'Нажми на кнопку над каждой пробиркой, чтобы добавить индикатор.',
        chips: groups.map((g) => ({
          label: g.label,
          done: g.objectIds.some((id) => studied.includes(id)),
        })),
        markerIds: stepIds.filter((id) => !studied.includes(id)),
        done: doneCount === stepIds.length,
      }
    },
    pickInteractable: () => null,
  }
  
  const zeroVec: Vec3 = [0, 0, 0]
  const emptyObjects: readonly InteractableDef[] = []
  const emptyBounds: Bounds = { min: zeroVec, max: zeroVec }
  
  export const chemIndicatorsPack: LabPack = {
    id: 'chem-indicators',
    subject: 'chemistry',
    title: 'Среда растворов и индикаторы',
    grade: 8,
    storageKey: 'himbio-lab:chemistry:indicators',
    facts: indicatorsFacts,
    objects: emptyObjects,
    rules,
    mission: indicatorsMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: ChemIndicatorsWorld,
  }
  