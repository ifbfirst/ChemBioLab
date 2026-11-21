import { useState } from 'react'
import { CheckCircle2, Droplets, FlaskConical, HelpCircle } from 'lucide-react'
import { useLab } from '../../../../game/state'

type Formula = 'NaOH' | 'HCl' | 'Na₂CO₃' | 'CuSO₄'
type Reagent = 'phenolphthalein' | 'hcl' | 'bacl2'

interface TubeConfig {
  id: string
  number: number
  formula: Formula
  initialColor: string
}

const TUBES: TubeConfig[] = [
  { id: 'det-tube-1', number: 1, formula: 'NaOH', initialColor: 'rgba(226, 232, 240, 0.14)' },
  { id: 'det-tube-2', number: 2, formula: 'HCl', initialColor: 'rgba(226, 232, 240, 0.14)' },
  { id: 'det-tube-3', number: 3, formula: 'Na₂CO₃', initialColor: 'rgba(226, 232, 240, 0.14)' },
  { id: 'det-tube-4', number: 4, formula: 'CuSO₄', initialColor: 'rgba(56, 189, 248, 0.35)' },
]

const FORMULAS: Formula[] = ['NaOH', 'HCl', 'Na₂CO₃', 'CuSO₄']

const REAGENTS: { id: Reagent; label: string; short: string }[] = [
  { id: 'phenolphthalein', label: 'Фенолфталеин', short: 'Ф/ф' },
  { id: 'hcl', label: 'Кислота HCl', short: 'HCl' },
  { id: 'bacl2', label: 'Хлорид бария BaCl₂', short: 'BaCl₂' },
]

function getReactionResult(formula: Formula, reagent: Reagent | null) {
  if (!reagent) {
    return {
      color: formula === 'CuSO₄' ? 'rgba(56, 189, 248, 0.38)' : 'rgba(226, 232, 240, 0.14)',
      effect: 'none' as const,
      note: formula === 'CuSO₄' ? 'Голубой раствор' : 'Прозрачный раствор',
    }
  }

  if (reagent === 'phenolphthalein') {
    if (formula === 'NaOH' || formula === 'Na₂CO₃') {
      return { color: 'rgba(236, 72, 153, 0.72)', effect: 'none' as const, note: 'Малиновый (OH⁻)' }
    }
    return {
      color: formula === 'CuSO₄' ? 'rgba(56, 189, 248, 0.38)' : 'rgba(226, 232, 240, 0.14)',
      effect: 'none' as const,
      note: 'Окраска не изменилась',
    }
  }

  if (reagent === 'hcl') {
    if (formula === 'Na₂CO₃') {
      return { color: 'rgba(226, 232, 240, 0.22)', effect: 'gas' as const, note: 'Газ CO₂↑ («вскипание»)' }
    }
    return {
      color: formula === 'CuSO₄' ? 'rgba(56, 189, 248, 0.38)' : 'rgba(226, 232, 240, 0.14)',
      effect: 'none' as const,
      note: 'Видимых признаков нет',
    }
  }

  // BaCl2
  if (formula === 'CuSO₄') {
    return { color: 'rgba(125, 211, 252, 0.45)', effect: 'precipitate' as const, note: 'Белый осадок BaSO₄↓' }
  }
  return {
    color: 'rgba(226, 232, 240, 0.14)',
    effect: 'none' as const,
    note: 'Осадок не выпадает',
  }
}

export function DetectiveWorld() {
  const { state, api } = useLab()
  const [selectedReagent, setSelectedReagent] = useState<Reagent>('phenolphthalein')
  const [testedWith, setTestedWith] = useState<Record<string, Reagent>>({})
  const [guesses, setGuesses] = useState<Record<string, Formula | ''>>({})

  const handleDropReagent = (tubeId: string) => {
    setTestedWith((prev) => ({ ...prev, [tubeId]: selectedReagent }))
  }

  const handleGuess = (tube: TubeConfig, value: Formula | '') => {
    setGuesses((prev) => ({ ...prev, [tube.id]: value }))
    if (value === tube.formula && !state.studied.includes(tube.id)) {
      api.inspect(tube.id, tube.id)

    }
  }

  return (
    <div
      className="h-dvh overflow-y-auto overscroll-none bg-[#070b14] px-3 pb-24 pt-40 text-slate-100 sm:px-6 sm:pt-36 lg:flex lg:flex-col lg:justify-center lg:pt-24"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(56, 189, 248, 0.12) 0%, transparent 55%),
          linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 36px 36px, 36px 36px',
      }}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* Панель выбора реактива в пипетке */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 backdrop-blur-md sm:mb-6 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Droplets className="h-4 w-4 text-sky-400" />
            <span>Реактив в пипетке:</span>
          </div>

          <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto">
            {REAGENTS.map((r) => {
              const active = selectedReagent === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReagent(r.id)}
                  className={`rounded-xl border px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                    active
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="sm:hidden">{r.short}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Адаптивная сетка 4 пробирок (2x2 на телефоне, 4 в ряд на ПК) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {TUBES.map((tube) => {
            const activeReagent = testedWith[tube.id] ?? null
            const reaction = getReactionResult(tube.formula, activeReagent)
            const currentGuess = guesses[tube.id] ?? ''
            const isSolved = state.studied.includes(tube.id) || currentGuess === tube.formula
            const isWrong = Boolean(currentGuess) && currentGuess !== tube.formula

            return (
              <div
                key={tube.id}
                className={`flex flex-col justify-between rounded-2xl border p-3 transition sm:p-4 ${
                  isSolved
                    ? 'border-emerald-400/60 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/85'
                }`}
              >
                {/* Заголовок пробирки */}
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-extrabold text-white sm:text-sm">
                    Пробирка №{tube.number}
                  </span>
                  {isSolved ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <HelpCircle className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </div>

                {/* Визуальная пробирка с раствором */}
                <div className="my-2 flex flex-col items-center">
                  <div className="relative flex h-24 w-11 flex-col justify-end overflow-hidden rounded-b-full border-2 border-slate-600/80 bg-slate-950/60 p-0.5 sm:h-32 sm:w-14">
                    {/* Жидкость */}
                    <div
                      className="relative w-full rounded-b-full transition-all duration-500"
                      style={{ height: '68%', backgroundColor: reaction.color }}
                    >
                      {/* Пузырьки газа */}
                      {reaction.effect === 'gas' && (
                        <div className="absolute inset-0 flex items-center justify-around opacity-90">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                          <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                        </div>
                      )}
                      {/* Осадок на дне */}
                      {reaction.effect === 'precipitate' && (
                        <div className="absolute bottom-0 left-0 right-0 h-3 rounded-b-full bg-white/90" />
                      )}
                    </div>
                  </div>

                  {/* Подпись признака */}
                  <div className="mt-2 min-h-[28px] text-center text-[11px] font-medium leading-tight text-slate-300 sm:text-xs">
                    {reaction.note}
                  </div>
                </div>

                {/* Кнопка добавления реактива и выбор формулы */}
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDropReagent(tube.id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-2.5 py-2 text-xs font-extrabold text-slate-950 transition hover:opacity-95"
                  >
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                    <span>+ Реактив</span>
                  </button>

                  <select
                    value={isSolved ? tube.formula : currentGuess}
                    disabled={isSolved}
                    onChange={(e) => handleGuess(tube, e.target.value as Formula | '')}
                    className={`w-full rounded-xl border px-2 py-2 font-mono text-xs font-bold outline-none transition ${
                      isSolved
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                        : isWrong
                        ? 'border-rose-500/60 bg-rose-500/10 text-rose-300'
                        : 'border-slate-700 bg-slate-950 text-slate-200 focus:border-sky-400'
                    }`}
                  >
                    <option value="">Выбери формулу...</option>
                    {FORMULAS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
