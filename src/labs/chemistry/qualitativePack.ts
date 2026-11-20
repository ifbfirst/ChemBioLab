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
  import { QualitativeWorld } from './QualitativeWorld'
  
  const stepIds = ['cu-precipitate', 'fe-precipitate', 'cl-precipitate', 'co3-gas'] as const
  
  const qualFacts: Record<string, Fact> = {
    'cu-precipitate': {
      id: 'cu-precipitate',
      title: 'Качественная реакция на ион Cu²⁺',
      body: 'При добавлении раствора щёлочи (NaOH) к солям меди(II) выпадает характерный ярко-голубой студенистый осадок гидроксида меди(II) Cu(OH)₂.',
      note: 'Уравнение: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (голубой осадок).',
    },
    'fe-precipitate': {
      id: 'fe-precipitate',
      title: 'Качественная реакция на ион Fe³⁺',
      body: 'При взаимодействии солей железа(III) со щелочами выпадает бурый (ржаво-коричневый) осадок гидроксида железа(III) Fe(OH)₃.',
      note: 'Уравнение: Fe³⁺ + 3OH⁻ → Fe(OH)₃↓ (бурый осадок).',
    },
    'cl-precipitate': {
      id: 'cl-precipitate',
      title: 'Качественная реакция на хлорид-ион Cl⁻',
      body: 'Реактивом на галогенид-ионы (Cl⁻, Br⁻, I⁻) служит нитрат серебра AgNO₃. С хлорид-ионами образуется белый творожистый осадок AgCl, нерастворимый в азотной кислоте.',
      note: 'Уравнение: Ag⁺ + Cl⁻ → AgCl↓ (белый творожистый осадок).',
    },
    'co3-gas': {
      id: 'co3-gas',
      title: 'Качественная реакция на карбонат-ион CO₃²⁻',
      body: 'При действии сильных кислот (например, HCl) на карбонаты образуется неустойчивая угольная кислота H₂CO₃, которая мгновенно распадается на воду и углекислый газ CO₂ (наблюдается «вскипание» раствора).',
      note: 'Уравнение: CO₃²⁻ + 2H⁺ → H₂O + CO₂↑ (газ без цвета и запаха).',
    },
  }
  
  const groups = [
    { label: 'Cu²⁺', objectIds: ['cu-precipitate'] },
    { label: 'Fe³⁺', objectIds: ['fe-precipitate'] },
    { label: 'Cl⁻', objectIds: ['cl-precipitate'] },
    { label: 'CO₃²⁻', objectIds: ['co3-gas'] },
  ]
  
  const qualMission: MissionDefinition = {
    id: 'chem-qualitative-9',
    title: 'Качественные реакции на ионы',
    intro: 'Подбери правильный реактив для каждой из четырёх пробирок.',
    stages: [
      {
        id: 'ions',
        objective: 'Выбери реактив на полке сверху и прилей его в нужную пробирку.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Качественные реакции освоены',
    summary: ['Ты научился распознавать катионы металлов и анионы по цвету осадка и выделению газа.'],
    nextMissionTitle: 'Органическая химия',
    nextMissionText: 'В следующем разделе — распознавание альдегидов и многоатомных спиртов.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: qualMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Все 4 иона успешно распознаны!'
            : 'Выбери реактив на полке сверху и прилей его в подходящую пробирку.',
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
  
  const zeroVec: Vec3 =  [0, 0, 0];
  const emptyObjects: readonly InteractableDef[] = []
  const emptyBounds: Bounds = { min: zeroVec, max: zeroVec }
  
  export const chemQualitativePack: LabPack = {
    id: 'chem-qualitative',
    subject: 'chemistry',
    title: 'Качественные реакции на ионы',
    grade: 9,
    storageKey: 'himbio-lab:chemistry:qualitative',
    facts: qualFacts,
    objects: emptyObjects,
    rules,
    mission: qualMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: QualitativeWorld,
  }
  