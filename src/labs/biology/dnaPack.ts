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
  import { Dna3DWorld } from './Dna3DWorld'
  
  const stepIds = ['backbone', 'bases', 'transcription'] as const
  
  const dnaFacts: Record<string, Fact> = {
    backbone: {
      id: 'backbone',
      title: 'Сахарофосфатный остов ДНК',
      body: 'Внешние цепи двойной спирали образованы чередующимися остатками углевода дезоксирибозы и фосфорной кислоты, соединёнными ковалентными фосфодиэфирными связями.',
      note: 'Цепи ДНК антипараллельны: одна идёт в направлении 5′→3′, вторая — 3′→5′.',
    },
    bases: {
      id: 'bases',
      title: 'Принцип комплементарности (А–Т, Г–Ц)',
      body: 'Внутри спирали азотистые основания соединены водородными связями: Аденин (А) всегда связывается с Тимином (Т) двумя связями, а Гуанин (Г) с Цитозином (Ц) — тремя связями.',
      note: 'Правило Чаргаффа (частый вопрос ЦТ/ЦЭ): количество А = Т, а Г = Ц.',
    },
    transcription: {
      id: 'transcription',
      title: 'Транскрипция (синтез иРНК)',
      body: 'При считывании гена фермент РНК-полимераза расплетает участок ДНК и строит одноцепочечную молекулу иРНК, где вместо тимина (Т) используется урацил (У).',
      note: 'Затем иРНК выходит из ядра к рибосомам для синтеза белка (трансляции).',
    },
  }
  
  const groups = [
    { label: 'Остов ДНК', objectIds: ['backbone'] },
    { label: 'Основания (А-Т, Г-Ц)', objectIds: ['bases'] },
    { label: 'Транскрипция (иРНК)', objectIds: ['transcription'] },
  ]
  
  const dnaMission: MissionDefinition = {
    id: 'bio-dna-3d',
    title: 'Двойная спираль ДНК',
    intro: 'Вращай 3D-модель ДНК мышкой и нажимай на светящиеся точки.',
    stages: [
      {
        id: 'dna-parts',
        objective: 'Изучи три ключевых элемента строения и работы ДНК.',
        allGroups: groups,
      },
    ],
    summaryTitle: 'Молекула ДНК изучена',
    summary: ['Ты разобрался в строении двойной спирали и принципе комплементарности.'],
    nextMissionTitle: 'Биосинтез белка',
    nextMissionText: 'Закрепи знания в тесте.',
  }
  
  const rules: MissionRules = {
    applyInspect(studied, objectId) {
      if (!stepIds.includes(objectId as (typeof stepIds)[number])) return studied
      return studied.includes(objectId) ? studied : [...studied, objectId]
    },
    getView(studied): MissionView {
      const doneCount = stepIds.filter((id) => studied.includes(id)).length
      return {
        missionTitle: dnaMission.title,
        step: doneCount,
        steps: stepIds.length,
        objective:
          doneCount === stepIds.length
            ? 'Все элементы спирали ДНК изучены!'
            : 'Вращай 3D-спираль мышкой и нажимай на светящиеся точки.',
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
  
  export const bioDnaPack: LabPack = {
    id: 'bio-dna-3d',
    subject: 'biology',
    title: 'Строение ДНК и генетический код (3D)',
    grade: 10,
    storageKey: 'himbio-lab:biology:dna-3d',
    facts: dnaFacts,
    objects: emptyObjects,
    rules,
    mission: dnaMission,
    bounds: emptyBounds,
    spawn: zeroVec,
    Location: Dna3DWorld,
  }
  