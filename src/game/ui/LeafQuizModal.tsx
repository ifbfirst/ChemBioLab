import { useEffect, useState } from 'react'
import { saveQuizPassed } from '../../platform/progress'
import { DEFAULT_QUIZZES, fetchLabQuiz, type QuizQuestion } from '../../platform/quizzes'

export function LeafQuizModal({
  labId = 'photosynthesis',
  storageKey,
  onClose,
}: {
  labId?: string
  storageKey?: string
  onClose: () => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    () => DEFAULT_QUIZZES[labId] ?? DEFAULT_QUIZZES.photosynthesis,
  )
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let active = true
    fetchLabQuiz(labId).then((loaded) => {
      if (!active) return
      setQuestions(loaded)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [labId])

  const current = questions[step] ?? questions[0]

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
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Загрузка вопросов из базы...</p>
        ) : !finished ? (
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
