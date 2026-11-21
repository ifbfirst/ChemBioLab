import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react'
import { fetchLabQuiz, type QuizQuestion } from '../../platform/quizzes'
import { useLab } from '../state'
import { saveQuizPassed } from '../../platform/progress'

export function LeafQuizModal({ onClose }: { onClose: () => void }) {
  const { pack } = useLab()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchLabQuiz(pack.id)
      .then((qs) => {
        if (active) {
          setQuestions(qs)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [pack.id])

  if (loading) {
    return createPortal(
      <div
        style={{ pointerEvents: 'auto' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
          <p className="font-mono text-sm text-sky-400">Загрузка вопросов теста...</p>
        </div>
      </div>,
      document.body,
    )
  }

  if (questions.length === 0) {
    return createPortal(
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        style={{ pointerEvents: 'auto' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-2 text-lg font-extrabold text-white">Тест скоро появится</h2>
          <p className="mb-5 text-sm text-slate-400">
            Для этой лаборатории вопросы ещё не добавлены в базу.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Закрыть
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  const current = questions[step]
  const total = questions.length
  const passed = score >= Math.ceil(total * 0.7)

  const handleSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    if (selected) return
    setSelected(key)
    if (key === current.correct) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (step + 1 < total) {
      setStep((s) => s + 1)
      setSelected(null)
    } else {
      const finalPassed = score >= Math.ceil(total * 0.7)
      if (finalPassed) {
        saveQuizPassed(pack.storageKey)
      }
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setStep(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{ pointerEvents: 'auto' }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
    >
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-3xl">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Итоговый контроль • ЦТ / ЦЭ
              </div>
              <div className="text-xs font-bold text-slate-300">
                {finished ? 'Результат тестирования' : `Вопрос ${step + 1} из ${total}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть тест"
            className="rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-slate-400 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Шкала прогресса */}
        {!finished && (
          <div className="flex gap-1.5 bg-slate-950/50 px-5 py-2.5">
            {questions.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx < step
                    ? 'bg-emerald-400'
                    : idx === step
                    ? 'bg-sky-400'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        )}
        {/* Тело теста */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {finished ? (
            <div className="py-4 text-center">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${
                  passed
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-400'
                    : 'border-amber-400/40 bg-amber-500/15 text-amber-400'
                }`}
              >
                <Award className="h-8 w-8" />
              </div>

              <h2 className="mb-1 text-xl font-extrabold text-white sm:text-2xl">
                {passed ? 'Зачёт получен!' : 'Попробуйте ещё раз'}
              </h2>
              <p className="mb-5 font-mono text-sm text-slate-300">
                Правильных ответов:{' '}
                <strong className={passed ? 'text-emerald-400' : 'text-amber-400'}>
                  {score} из {total}
                </strong>
              </p>

              <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
                {passed
                  ? 'Отличный результат! Отметка о зачёте сохранена в вашем профиле и видна преподавателю.'
                  : 'Для получения зачёта нужно ответить правильно минимум на 70% вопросов.'}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="mb-4 text-base font-extrabold leading-snug text-white sm:text-lg">
                {current.question}
              </h3>

              <div className="flex flex-col gap-2.5">
                {current.options.map((opt) => {
                  const isCorrect = opt.key === current.correct
                  const isChosen = opt.key === selected

                  let btnStyle =
                    'border-slate-800 bg-slate-800/40 text-slate-200 hover:border-sky-400/50 hover:bg-slate-800/80'
                  let badgeStyle = 'border-slate-700 bg-slate-900 text-slate-400'

                  if (selected) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100'
                      badgeStyle = 'border-emerald-400 bg-emerald-400 text-slate-950'
                    } else if (isChosen) {
                      btnStyle = 'border-rose-400/70 bg-rose-500/15 text-rose-100'
                      badgeStyle = 'border-rose-400 bg-rose-400 text-slate-950'
                    } else {
                      btnStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-500 opacity-70'
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={Boolean(selected)}
                      onClick={() => handleSelect(opt.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-semibold transition sm:text-sm ${btnStyle}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-extrabold ${badgeStyle}`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {selected && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      )}
                      {selected && isChosen && !isCorrect && (
                        <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                      )}
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div
                  className={`mt-4 rounded-2xl border p-3.5 text-xs leading-relaxed sm:text-sm ${
                    selected === current.correct
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                  }`}
                >
                  <strong className="font-bold">Пояснение: </strong>
                  {current.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Нижняя панель кнопок */}
        <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/60 px-5 py-3.5 sm:flex-row sm:justify-end">
          {finished ? (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 sm:w-auto sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Пройти заново</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition hover:opacity-95 sm:w-auto sm:text-sm"
              >
                Вернуться в лабораторию
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!selected}
              onClick={handleNext}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto sm:text-sm"
            >
              <span>{step + 1 < total ? 'Следующий вопрос' : 'Завершить тест'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
