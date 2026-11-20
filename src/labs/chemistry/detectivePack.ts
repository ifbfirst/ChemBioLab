import type {
    Bounds,
    Fact,
    InteractableDef,
    LabPack,
    MissionDefinition,
    MissionRules,
    MissionView,
    Vec3,
  } from '../../platform/types'
  import { DetectiveWorld } from './DetectiveWorld'
  
  const stepIds = ['tube-0', 'tube-1', 'tube-2', 'tube-3'] as const
  
  const detectiveFacts: Record<string, Fact> = {
    naoh: {
      id: 'naoh',
      title: 'Распознан NaOH!',
      body: 'Бесцветный раствор щёлочи окрашивает фенолфталеин в малиновый цвет и не вскипает при добавлении кислоты (в отличие от карбоната).',
    },
    hcl: {
      id: 'hcl',
      title: 'Распознана HCl!',
      body: 'Соляная кислота не меняет цвет фенолфталеина и не даёт осадка с хлоридом бария BaCl₂.',
    },
    na2co3: {
      id: 'na2co3',
      title: 'Распознан Na₂CO₃!',
      body: 'Карбонат натрия подвергается гидролизу (даёт щелочную среду с фенолфталеином) и бурно выделяет газ CO₂ при действии кислоты HCl.',
    },
    cuso4: {
      id: 'cuso4',
      title: 'Распознан CuSO₄!',
      body: 'Раствор сульфата меди(II) имеет голубоватый оттенок, даёт голубой студенистый осадок с NaOH и белый осадок BaSO₄ с хлоридом бария.',
    },
  }
  
  const groups = [
    { label: 'Пробирка 1', objectIds: ['tube-0'] },
    { label: 'Пробирка 2', objectIds: ['tube-1'] },
    { label: 'Пробирка 3', objectIds: ['tube-2'] },
    { label: 'Пробирка 4', objectIds: ['tube-3'] },
  ]
  
  const detectiveMission: MissionDefinition = {
    id: 'chem-detective-10',
    title: 'Химический детектив',
    intro: 'Определи 4 неизвестных раствора без этикеток.',
    stages: [
      {
        id: 'solve',
        objective: 'Проведи пробы реактивами и подпиши все 4 пробирки.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Все вещества распознаны!',
    summary: ['Отличная аналитическая работа!'],
    nextMissionTitle: 'Органический синтез',
    nextMissionText: 'Следующий уровень.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: detectiveMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Задача решена! Все 4 пробирки определены верно.'
            : 'Капай реактивы в пробирки, анализируй признаки и выбери формулу под каждой.',
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
  
  export const chemDetectivePack: LabPack = {
    id: 'chem-detective',
    subject: 'chemistry',
    title: 'Химический детектив: 4 неизвестных раствора',
    grade: 10,
    storageKey: 'himbio-lab:chemistry:detective',
    facts: detectiveFacts,
    objects: emptyObjects,
    rules,
    mission: detectiveMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: DetectiveWorld,
  }
  