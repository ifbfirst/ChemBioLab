import { Bounds, Fact, InteractableDef, LabPack, MissionDefinition, MissionRules, MissionView, Vec3 } from "../../../../platform/types"
import { CellStructureWorld } from "./CellStructureWorld"

  
  const stepIds = ['nucleus', 'chloroplast', 'vacuole', 'mitochondria', 'ribosome', 'cell-wall'] as const
  
  const cellFacts: Record<string, Fact> = {
    nucleus: {
      id: 'nucleus',
      title: 'Ядро (Эукариоты)',
      body: 'Ядро отделено от цитоплазмы двойной мембраной и содержит хромосомы с ДНК. Оно регулирует все процессы жизнедеятельности клетки.',
      note: 'У бактерий (прокариот) оформленного ядра нет — их кольцевая ДНК лежит прямо в цитоплазме (нуклеоид).',
    },
    chloroplast: {
      id: 'chloroplast',
      title: 'Хлоропласты',
      body: 'Двумембранные органоиды, содержащие зелёный пигмент хлорофилл. В них энергия солнечного света превращается в энергию химических связей (фотосинтез).',
      note: 'Хлоропласты есть только в клетках растений (и некоторых водорослей/эвглены).',
    },
    vacuole: {
      id: 'vacuole',
      title: 'Крупная центральная вакуоль',
      body: 'Одномембранный резервуар с клеточным соком. Накапливает воду, запасные вещества и пигменты, обеспечивая упругость (тургор) растительной клетки.',
      note: 'В зрелой растительной клетке вакуоль может занимать до 80% объёма.',
    },
    mitochondria: {
      id: 'mitochondria',
      title: 'Митохондрии',
      body: 'Двумембранные органоиды с внутренними складками (кристами). В них происходит кислородный этап клеточного дыхания и синтез молекул АТФ.',
      note: 'Имеют собственную кольцевую ДНК и рибосомы, способны делиться независимо от клетки.',
    },
    ribosome: {
      id: 'ribosome',
      title: 'Рибосомы',
      body: 'Немембранные органоиды, состоящие из большой и малой субъединиц. Осуществляют сборку молекул белка из аминокислот (трансляцию).',
      note: 'Рибосомы есть абсолютно во всех клетках: и у растений, и у животных, и у бактерий.',
    },
    'cell-wall': {
      id: 'cell-wall',
      title: 'Клеточная стенка',
      body: 'Жёсткая наружная оболочка поверх плазматической мембраны. Придаёт клетке постоянную форму и защищает от разрыва.',
      note: 'У растений состоит из целлюлозы, у грибов — из хитина, у бактерий — из муреина. У животных клеток стенки нет!',
    },
  }
  
  const groups = [
    { label: 'Ядро', objectIds: ['nucleus'] },
    { label: 'Хлоропласты', objectIds: ['chloroplast'] },
    { label: 'Вакуоль', objectIds: ['vacuole'] },
    { label: 'Митохондрии', objectIds: ['mitochondria'] },
    { label: 'Рибосомы', objectIds: ['ribosome'] },
    { label: 'Клет. стенка', objectIds: ['cell-wall'] },
  ]
  
  const cellMission: MissionDefinition = {
    id: 'bio-cell-structure',
    title: 'Строение клетки',
    intro: 'Сравни растительную, животную и бактериальную клетки.',
    stages: [
      {
        id: 'organelles',
        objective: 'Изучи все 6 структур, переключая типы клеток сверху.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Цитология изучена',
    summary: ['Ты разобрался в главных отличиях клеток растений, животных и бактерий.'],
    nextMissionTitle: 'Деление клетки',
    nextMissionText: 'Следующий шаг — фазы митоза и мейоза.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: cellMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Все 6 структур клетки изучены!'
            : 'Нажимай на органоиды и переключай типы клеток сверху.',
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
  
  const zeroVec: Vec3 = [0,0,0]
  const emptyObjects: readonly InteractableDef[] = []
  const emptyBounds: Bounds = { min: zeroVec, max: zeroVec }
  
  export const bioCellPack: LabPack = {
    id: 'bio-cell',
    subject: 'biology',
    title: 'Строение клетки',
    grade: 9,
    storageKey: 'himbio-lab:biology:cell-structure',
    facts: cellFacts,
    objects: emptyObjects,
    rules,
    mission: cellMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: CellStructureWorld,
  }
  