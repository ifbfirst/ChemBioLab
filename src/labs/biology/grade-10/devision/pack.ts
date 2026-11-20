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
  import { Division3DWorld } from './Division3DWorld'
  
  const stepIds = [
    'mitosis-prophase',
    'mitosis-metaphase',
    'mitosis-anaphase',
    'mitosis-telophase',
    'meiosis1-prophase',
    'meiosis1-metaphase',
    'meiosis1-anaphase',
    'meiosis1-telophase',
  ] as const
  
  const divisionFacts: Record<string, Fact> = {
    prophase: {
      id: 'prophase',
      title: 'Профаза (2n4c)',
      body: 'Хромосомы укорачиваются и становятся видимыми в световой микроскоп. В мейозе I гомологичные хромосомы сближаются (конъюгация) и обмениваются участками (кроссинговер).',
      note: 'Ядрышко исчезает, ядерная оболочка распадается, формируются нити веретена деления.',
    },
    metaphase: {
      id: 'metaphase',
      title: 'Метафаза (2n4c)',
      body: 'Нити веретена деления прикрепляются к центромерам хромосом и выстраивают их в плоскости экватора клетки.',
      note: 'В митозе хромосомы стоят поодиночке, а в мейозе I — парами (бивалентами).',
    },
    anaphase: {
      id: 'anaphase',
      title: 'Анафаза: главное отличие митоза и мейоза!',
      body: 'В анафазе митоза делятся центромеры и к полюсам расходятся сестринские хроматиды (набор становится 4n4c). В анафазе мейоза I к полюсам расходятся целые двухроматидные хромосомы (набор остаётся 2n4c).',
      note: 'Именно в анафазе мейоза I происходит уменьшение (редукция) числа хромосом вдвое.',
    },
    telophase: {
      id: 'telophase',
      title: 'Телофаза: итог деления',
      body: 'У полюсов формируются новые ядерные оболочки и происходит деление цитоплазмы (цитокинез).',
      note: 'Итог митоза — две диплоидные клетки (2n2c). Итог мейоза I — две гаплоидные клетки (1n2c).',
    },
  }
  
  const groups = [
    { label: 'Митоз (4 фазы)', objectIds: ['mitosis-prophase', 'mitosis-metaphase', 'mitosis-anaphase', 'mitosis-telophase'] },
    { label: 'Мейоз I (4 фазы)', objectIds: ['meiosis1-prophase', 'meiosis1-metaphase', 'meiosis1-anaphase', 'meiosis1-telophase'] },
  ]
  
  const divisionMission: MissionDefinition = {
    id: 'bio-division-3d',
    title: 'Митоз и Мейоз (3D)',
    intro: 'Изучи фазы деления клетки и определи хромосомные наборы n и c.',
    stages: [
      {
        id: 'division',
        objective: 'Переключай Митоз и Мейоз I снизу, выбирай фазу и определяй набор n и c.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Деление клетки освоено!',
    summary: ['Ты разобрался в фазах митоза, мейоза I и формулах плоидности n и c.'],
    nextMissionTitle: 'Экзаменационный тест',
    nextMissionText: 'Проверь себя на задачах уровня ЦТ/ЦЭ.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: divisionMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Все 8 этапов митоза и мейоза I изучены!'
            : 'Выбери фазу снизу и определи набор хромосом (n) и ДНК (c).',
        chips: groups.map((g) => ({
          label: g.label,
          done: g.objectIds.every((id) => studied.includes(id)),
        })),
        markerIds: [],
        done: doneCount === stepIds.length,
      }
    },
    pickInteractable: () => null,
  }
  
  const zeroVec: Vec3 =[0, 0, 0]
  const emptyObjects: readonly InteractableDef[] = []
  const emptyBounds: Bounds = { min: zeroVec, max: zeroVec }
  
  export const bioDivisionPack: LabPack = {
    id: 'bio-division-3d',
    subject: 'biology',
    title: 'Митоз и Мейоз: Деление клетки (3D)',
    grade: 10,
    storageKey: 'himbio-lab:biology:division-3d',
    facts: divisionFacts,
    objects: emptyObjects,
    rules,
    mission: divisionMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: Division3DWorld,
  }
  