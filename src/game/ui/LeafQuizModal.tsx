import { useState } from 'react'
import { saveQuizPassed } from '../../platform/progress'

export interface QuizQuestion {
  question: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

const QUESTIONS_BY_LAB: Record<string, QuizQuestion[]> = {
  photosynthesis: [
    {
      question: 'Через какие структуры нижней кожицы листа внутрь поступает углекислый газ (CO₂)?',
      options: [
        { key: 'A', text: 'Через сосуды жилки (ксилему)' },
        { key: 'B', text: 'Через устьица между замыкающими клетками' },
        { key: 'C', text: 'Через плотный слой верхней кожицы' },
        { key: 'D', text: 'Через ситовидные трубки (флоэму)' },
      ],
      correct: 'B',
      explanation: 'Устьица состоят из двух замыкающих клеток, которые регулируют газообмен и испарение воды.',
    },
    {
      question: 'В каких клетках мякоти листа содержится больше всего хлоропластов?',
      options: [
        { key: 'A', text: 'В клетках столбчатой мякоти' },
        { key: 'B', text: 'В прозрачных клетках верхней кожицы' },
        { key: 'C', text: 'В мёртвых сосудах жилки' },
        { key: 'D', text: 'В клетках корневого чехлика' },
      ],
      correct: 'A',
      explanation: 'Столбчатая мякоть расположена сразу под верхней кожицей и плотно заполнена хлоропластами.',
    },
    {
      question: 'По какой части жилки листа вода (H₂O) поднимается от корней к клеткам мякоти?',
      options: [
        { key: 'A', text: 'По флоэме (ситовидным трубкам)' },
        { key: 'B', text: 'По межклетникам губчатой ткани' },
        { key: 'C', text: 'По ксилеме (сосудам)' },
        { key: 'D', text: 'По устьичной щели' },
      ],
      correct: 'C',
      explanation: 'Вода поступает по ксилеме, а органические вещества (глюкоза) отводятся по флоэме.',
    },
  ],

  'bio-cell': [
    {
      question: 'Какие органоиды присутствуют абсолютно во всех живых клетках (включая бактерии)?',
      options: [
        { key: 'A', text: 'Митохондрии' },
        { key: 'B', text: 'Рибосомы' },
        { key: 'C', text: 'Хлоропласты' },
        { key: 'D', text: 'Оформленное ядро' },
      ],
      correct: 'B',
      explanation: 'Рибосомы отвечают за синтез белка и есть как у эукариот, так и у прокариот (бактерий).',
    },
    {
      question: 'Какая структура есть у растительной и бактериальной клеток, но полностью отсутствует у животной?',
      options: [
        { key: 'A', text: 'Плазматическая мембрана' },
        { key: 'B', text: 'Цитоплазма' },
        { key: 'C', text: 'Жёсткая клеточная стенка' },
        { key: 'D', text: 'Молекулы ДНК' },
      ],
      correct: 'C',
      explanation: 'У растений клеточная стенка состоит из целлюлозы, у бактерий — из муреина, а у животных клеток её нет.',
    },
    {
      question: 'Где расположена наследственная информация (ДНК) в клетке бактерии?',
      options: [
        { key: 'A', text: 'Внутри ядра с двойной мембраной' },
        { key: 'B', text: 'В центральной вакуоли' },
        { key: 'C', text: 'В хлоропластах' },
        { key: 'D', text: 'В цитоплазме в виде кольцевой молекулы (нуклеоида)' },
      ],
      correct: 'D',
      explanation: 'Бактерии — прокариоты, у них нет оформленного ядра, поэтому кольцевая ДНК лежит прямо в цитоплазме.',
    },
  ],

  'bio-dna-3d': [
    {
      question: 'По правилу комплементарности в молекуле ДНК аденин (А) всегда соединяется с:',
      options: [
        { key: 'A', text: 'Гуанином (Г)' },
        { key: 'B', text: 'Цитозином (Ц)' },
        { key: 'C', text: 'Тимином (Т)' },
        { key: 'D', text: 'Урацилом (У)' },
      ],
      correct: 'C',
      explanation: 'В ДНК Аденин (А) соединяется с Тимином (Т), а Гуанин (Г) — с Цитозином (Ц). Урацил (У) есть только в РНК.',
    },
    {
      question: 'Если в фрагменте двуцепочечной ДНК на долю гуанина (Г) приходится 20%, то сколько процентов составляет аденин (А)?',
      options: [
        { key: 'A', text: '20%' },
        { key: 'B', text: '30%' },
        { key: 'C', text: '40%' },
        { key: 'D', text: '60%' },
      ],
      correct: 'B',
      explanation: 'По правилу Чаргаффа Г = Ц = 20% (вместе 40%). На пару А + Т остаётся 60%, значит А = 30%.',
    },
    {
      question: 'Какой нуклеотид встраивается в цепь иРНК при транскрипции напротив аденина (А) матричной цепи ДНК?',
      options: [
        { key: 'A', text: 'Тимин (Т)' },
        { key: 'B', text: 'Урацил (У)' },
        { key: 'C', text: 'Цитозин (Ц)' },
        { key: 'D', text: 'Гуанин (Г)' },
      ],
      correct: 'B',
      explanation: 'В молекуле РНК тимин заменён на урацил, поэтому напротив А в ДНК ставится У в иРНК.',
    },
  ],

  'bio-division-3d': [
    {
      question: 'В какой фазе деления клетки происходит конъюгация гомологичных хромосом и кроссинговер?',
      options: [
        { key: 'A', text: 'В метафазе митоза' },
        { key: 'B', text: 'В профазе I мейоза' },
        { key: 'C', text: 'В анафазе I мейоза' },
        { key: 'D', text: 'В телофазе митоза' },
      ],
      correct: 'B',
      explanation: 'Сближение гомологичных хромосом (конъюгация) и обмен участками (кроссинговер) происходят в профазе I мейоза.',
    },
    {
      question: 'Какой хромосомный набор (n) и число молекул ДНК (c) имеет клетка в анафазе митоза?',
      options: [
        { key: 'A', text: '2n2c' },
        { key: 'B', text: '2n4c' },
        { key: 'C', text: '4n4c' },
        { key: 'D', text: '1n2c' },
      ],
      correct: 'C',
      explanation: 'В анафазе митоза сестринские хроматиды расходятся и становятся самостоятельными хромосомами — набор удваивается до 4n4c.',
    },
    {
      question: 'Что расходится к полюсам клетки в анафазе I мейоза?',
      options: [
        { key: 'A', text: 'Однохроматидные сестринские хроматиды' },
        { key: 'B', text: 'Целые двухроматидные гомологичные хромосомы' },
        { key: 'C', text: 'Только центриоли' },
        { key: 'D', text: 'Молекулы иРНК' },
      ],
      correct: 'B',
      explanation: 'В анафазе I мейоза к полюсам отходят целые двухроматидные хромосомы (набор 2n4c), благодаря чему в телофазе образуются гаплоидные клетки 1n2c.',
    },
  ],

  'chem-indicators': [
    {
      question: 'Какой цвет приобретает бесцветный фенолфталеин в растворе гидроксида натрия (NaOH)?',
      options: [
        { key: 'A', text: 'Красный' },
        { key: 'B', text: 'Малиновый' },
        { key: 'C', text: 'Жёлтый' },
        { key: 'D', text: 'Остаётся бесцветным' },
      ],
      correct: 'B',
      explanation: 'Фенолфталеин в щелочной среде (ионы OH⁻) становится ярко-малиновым.',
    },
    {
      question: 'Какие ионы обусловливают кислую среду в водном растворе соляной кислоты (HCl)?',
      options: [
        { key: 'A', text: 'Гидроксид-ионы OH⁻' },
        { key: 'B', text: 'Хлорид-ионы Cl⁻' },
        { key: 'C', text: 'Катионы водорода H⁺' },
        { key: 'D', text: 'Катионы натрия Na⁺' },
      ],
      correct: 'C',
      explanation: 'Кислоты в водном растворе диссоциируют с образованием катионов водорода H⁺.',
    },
    {
      question: 'Какую окраску имеет метилоранж в чистой дистиллированной воде (нейтральная среда)?',
      options: [
        { key: 'A', text: 'Оранжевую' },
        { key: 'B', text: 'Малиновую' },
        { key: 'C', text: 'Синюю' },
        { key: 'D', text: 'Зелёную' },
      ],
      correct: 'A',
      explanation: 'В нейтральной среде метилоранж сохраняет свой исходный оранжевый цвет.',
    },
  ],

  'chem-qualitative': [
    {
      question: 'Какой признак реакции наблюдается при добавлении раствора щёлочи (NaOH) к сульфату меди(II) CuSO₄?',
      options: [
        { key: 'A', text: 'Выпадение бурого осадка' },
        { key: 'B', text: 'Выделение газа без запаха' },
        { key: 'C', text: 'Выпадение голубого студенистого осадка Cu(OH)₂' },
        { key: 'D', text: 'Выпадение белого творожистого осадка' },
      ],
      correct: 'C',
      explanation: 'Ионы Cu²⁺ с гидроксид-ионами OH⁻ образуют нерастворимый гидроксид меди(II) голубого цвета.',
    },
    {
      question: 'С помощью какого реактива можно обнаружить хлорид-ионы (Cl⁻) в растворе?',
      options: [
        { key: 'A', text: 'Нитрата серебра AgNO₃ (белый творожистый осадок AgCl)' },
        { key: 'B', text: 'Гидроксида натрия NaOH' },
        { key: 'C', text: 'Фенолфталеина' },
        { key: 'D', text: 'Соляной кислоты HCl' },
      ],
      correct: 'A',
      explanation: 'Ag⁺ + Cl⁻ → AgCl↓ — образуется характерный белый творожистый осадок, нерастворимый в кислотах.',
    },
    {
      question: 'Что происходит при действии соляной кислоты (HCl) на карбонат натрия (Na₂CO₃)?',
      options: [
        { key: 'A', text: 'Выпадает бурый осадок' },
        { key: 'B', text: 'Раствор становится малиновым' },
        { key: 'C', text: 'Выделяется углекислый газ CO₂ («вскипание» раствора)' },
        { key: 'D', text: 'Видимых признаков реакции нет' },
      ],
      correct: 'C',
      explanation: 'Угольная кислота H₂CO₃ сразу распадается на H₂O и углекислый газ CO₂↑.',
    },
  ],

  'chem-detective': [
    {
      question: 'Какие два вещества из набора (NaOH, HCl, Na₂CO₃, CuSO₄) окрашивают фенолфталеин в малиновый цвет?',
      options: [
        { key: 'A', text: 'HCl и CuSO₄' },
        { key: 'B', text: 'NaOH и Na₂CO₃' },
        { key: 'C', text: 'Только NaOH' },
        { key: 'D', text: 'Na₂CO₃ и CuSO₄' },
      ],
      correct: 'B',
      explanation: 'Щёлочь NaOH даёт щелочную среду напрямую, а карбонат натрия Na₂CO₃ — за счёт гидролиза по аниону.',
    },
    {
      question: 'С помощью какого реактива можно отличить раствор карбоната натрия (Na₂CO₃) от раствора гидроксида натрия (NaOH)?',
      options: [
        { key: 'A', text: 'Фенолфталеином' },
        { key: 'B', text: 'Соляной кислотой HCl (выделяется газ CO₂)' },
        { key: 'C', text: 'Дистиллированной водой' },
        { key: 'D', text: 'Лакмусом' },
      ],
      correct: 'B',
      explanation: 'При добавлении кислоты к карбонату натрия выделяется углекислый газ CO₂↑, тогда как со щёлочью видимых признаков нет.',
    },
    {
      question: 'Какой осадок выпадает при добавлении хлорида бария (BaCl₂) к раствору сульфата меди(II) CuSO₄?',
      options: [
        { key: 'A', text: 'Белый осадок BaSO₄, нерастворимый в кислотах' },
        { key: 'B', text: 'Голубой студенистый осадок' },
        { key: 'C', text: 'Бурый осадок' },
        { key: 'D', text: 'Осадок не выпадает' },
      ],
      correct: 'A',
      explanation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓ — качественная реакция на сульфат-ионы.',
    },
  ],
}

export function LeafQuizModal({
  labId = 'photosynthesis',
  storageKey,
  onClose,
}: {
  labId?: string
  storageKey?: string
  onClose: () => void
}) {
  const questions = QUESTIONS_BY_LAB[labId] ?? QUESTIONS_BY_LAB.photosynthesis
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = questions[step]

  const handleSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    if (selected) return
    setSelected(key)
    if (key === current.correct) setScore((prev) => prev + 1)
  }

  const handleNext = () => {
    if (step + 1 < questions.length) {
      setStep((prev) => prev + 1)
      setSelected(null)
    } else {
      setFinished(true)
      if (storageKey && score >= questions.length - 1) {
        saveQuizPassed(storageKey)
      }
    }
  }

  return (
    <div className="modal" style={{ zIndex: 100 }}>
      <div className="sheet" style={{ maxWidth: '640px' }}>
        {!finished ? (
          <div className="sheet-copy">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p className="eyebrow" style={{ margin: 0 }}>
                Вопрос {step + 1} из {questions.length}
              </p>
              <button type="button" className="ghost" style={{ padding: '4px 12px' }} onClick={onClose}>
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '21px', marginBottom: '18px' }}>{current.question}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {current.options.map((opt) => {
                const isCorrect = opt.key === current.correct
                const isChosen = opt.key === selected
                let borderColor = 'var(--line)'
                let bg = 'rgba(255, 255, 255, 0.04)'

                if (selected) {
                  if (isCorrect) {
                    borderColor = '#4ade80'
                    bg = 'rgba(74, 222, 128, 0.18)'
                  } else if (isChosen) {
                    borderColor = '#f87171'
                    bg = 'rgba(248, 113, 113, 0.18)'
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(opt.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      color: 'var(--text)',
                      textAlign: 'left',
                      fontSize: '15px',
                    }}
                  >
                    <kbd style={{ fontWeight: 700, color: 'var(--accent)' }}>{opt.key}</kbd>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {selected && <p className="note">{current.explanation}</p>}

            <div className="actions" style={{ justifyContent: 'flex-end' }}>
              {selected && (
                <button type="button" className="primary" onClick={handleNext}>
                  {step + 1 < questions.length ? 'Следующий вопрос →' : 'Результат'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p className="eyebrow">Тест завершён</p>
            <h2>
              Результат: {score} из {questions.length}
            </h2>
            <p>
              {score >= questions.length - 1
                ? 'Отлично! Тема зачтена как полностью пройденная.'
                : 'Для зачёта темы нужно ответить правильно минимум на 2 вопроса из 3. Попробуйте ещё раз!'}
            </p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="primary" onClick={onClose}>
                Вернуться в лабораторию
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
