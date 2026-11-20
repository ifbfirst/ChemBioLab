import { useState } from 'react'

export interface QuizQuestion {
  question: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

const BIOLOGY_QUESTIONS: QuizQuestion[] = [
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
  {
    question: 'Какие вещества образуются в хлоропластах в результате фотосинтеза?',
    options: [
      { key: 'A', text: 'Вода и углекислый газ' },
      { key: 'B', text: 'Углекислый газ и азот' },
      { key: 'C', text: 'Глюкоза (органическое вещество) и кислород (O₂)' },
      { key: 'D', text: 'Только минеральные соли' },
    ],
    correct: 'C',
    explanation: 'На свету из CO₂ и H₂O в хлоропластах образуются органические вещества, а кислород выходит через устьице.',
  },
]

const CHEMISTRY_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Какой цвет приобретает бесцветный фенолфталеин в растворе гидроксида натрия (NaOH)?',
    options: [
      { key: 'A', text: 'Красный' },
      { key: 'B', text: 'Малиновый' },
      { key: 'C', text: 'Жёлтый' },
      { key: 'D', text: 'Остаётся бесцветным' },
    ],
    correct: 'B',
    explanation: 'Фенолфталеин — специфический индикатор на щелочную среду (ионы OH⁻), в которой он становится малиновым.',
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
    explanation: 'Кислоты в водном растворе диссоциируют с образованием катионов водорода H⁺, на которые реагируют индикаторы.',
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
    explanation: 'В нейтральной среде (pH = 7) метилоранж сохраняет свой исходный оранжевый цвет.',
  },
]

export function LeafQuizModal({
  subject = 'biology',
  onClose,
}: {
  subject?: 'biology' | 'chemistry'
  onClose: () => void
}) {
  const questions = subject === 'chemistry' ? CHEMISTRY_QUESTIONS : BIOLOGY_QUESTIONS
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
              {score === questions.length
                ? 'Отлично! Тема усвоена на 100%.'
                : score >= 2
                ? 'Хороший результат! Закрепите теорию ещё раз при необходимости.'
                : 'Попробуйте ещё раз — повторите опыты в лаборатории и вернитесь к тесту.'}
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
