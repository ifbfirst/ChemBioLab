import { useState } from 'react'
import { AlertCircle, CheckCircle2, Droplets, Eye, FlaskConical } from 'lucide-react'
import { useLab } from '../../../../game/state'

type ReagentId = 'naoh' | 'agno3' | 'hcl'

interface ReactionCase {
  id: string
  ionLabel: string
  saltFormula: string
  expectedReagent: ReagentId
  baseColor: string
  resultColor: string
  effect: 'blue-precipitate' | 'white-precipitate' | 'gas' | 'brown-precipitate'
  signTitle: string
  equation: string
}

const REAGENTS: { id: ReagentId; label: string; desc: string }[] = [
  { id: 'naoh', label: 'NaOH', desc: 'Гидроксид натрия (щёлочь)' },
  { id: 'agno3', label: 'AgNO₃', desc: 'Нитрат серебра' },
  { id: 'hcl', label: 'HCl', desc: 'Соляная кислота' },
]

const REACTIONS: ReactionCase[] = [
  {
    id: 'cu',
    ionLabel: 'Ион Cu²⁺',
    saltFormula: 'CuSO₄',
    expectedReagent: 'naoh',
    baseColor: 'rgba(56, 189, 248, 0.22)',
    resultColor: 'rgba(14, 165, 233, 0.45)',
    effect: 'blue-precipitate',
    signTitle: 'Голубой осадок Cu(OH)₂↓',
    equation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓',
  },
  {
    id: 'fe',
    ionLabel: 'Ион Fe³⁺',
    saltFormula: 'FeCl₃',
    expectedReagent: 'naoh',
    baseColor: 'rgba(251, 191, 36, 0.2)',
    resultColor: 'rgba(180, 83, 9, 0.42)',
    effect: 'brown-precipitate',
    signTitle: 'Бурый осадок Fe(OH)₃↓',
    equation: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓',
  },
  {
    id: 'cl',
    ionLabel: 'Ион Cl⁻',
    saltFormula: 'NaCl',
    expectedReagent: 'agno3',
    baseColor: 'rgba(226, 232, 240, 0.12)',
    resultColor: 'rgba(226, 232, 240, 0.24)',
    effect: 'white-precipitate',
    signTitle: 'Белый творожистый AgCl↓',
    equation: 'Ag⁺ + Cl⁻ → AgCl↓',
  },
  {
    id: 'co3',
    ionLabel: 'Ион CO₃²⁻',
    saltFormula: 'Na₂CO₃',
    expectedReagent: 'hcl',
    baseColor: 'rgba(226, 232, 240, 0.12)',
    resultColor: 'rgba(226, 232, 240, 0.2)',
    effect: 'gas',
    signTitle: 'Газ CO₂↑ («вскипание»)',
    equation: 'CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O',
  },
]

export function QualitativeWorld() {
  const { state, facts, api } = useLab()
  const [selectedReagent, setSelectedReagent] = useState<ReagentId>('naoh')
  const [wrongTubeId, setWrongTubeId] = useState<string | null>(null)

  const factKeys = Object.keys(facts)
  const resolveFactId = (shortKey: string, fallbackIndex: number) =>
    factKeys.find((k) => k.toLowerCase().includes(shortKey)) ?? factKeys[fallbackIndex] ?? shortKey

  const handlePour = (item: ReactionCase, idx: number) => {
    const targetId = resolveFactId(item.id, idx)

    if (selectedReagent !== item.expectedReagent) {
      setWrongTubeId(item.id)
      setTimeout(() => setWrongTubeId(null), 1600)
      return
    }

    setWrongTubeId(null)
    api.inspect(targetId, targetId)
  }

  return (
    <div
      className="h-dvh overflow-y-auto overscroll-none bg-[#070b14] px-3 pb-24 pt-48 text-slate-100 sm:px-6 sm:pt-44 lg:flex lg:flex-col lg:justify-center lg:pl-[360px] lg:pr-8 lg:pt-24"
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
        {/* Полка с реактивами сверху */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md sm:mb-6 sm:px-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Droplets className="h-4 w-4 shrink-0 text-sky-400" />
            <span>Полка реактивов:</span>
          </div>

          <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto">
            {REAGENTS.map((r) => {
              const active = selectedReagent === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  title={r.desc}
                  onClick={() => {
                    setSelectedReagent(r.id)
                    setWrongTubeId(null)
                  }}
                  className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-extrabold transition ${
                    active
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300 shadow-sm shadow-sky-500/20'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Адаптивная сетка 4 пробирок */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
          {REACTIONS.map((item, idx) => {
            const targetId = resolveFactId(item.id, idx)
            const isDone = state.studied.includes(targetId)
            const isWrong = wrongTubeId === item.id

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border p-3 transition sm:p-4 ${
                  isDone
                    ? 'border-emerald-400/60 bg-emerald-950/20'
                    : isWrong
                    ? 'border-amber-400/70 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-900/85'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span className="rounded-lg bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-extrabold text-sky-300 sm:text-xs">
                    {item.ionLabel}
                  </span>
                  {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                </div>

                <div className="my-2 flex flex-col items-center">
                  <div className="mb-1.5 font-mono text-xs font-bold text-slate-300">
                    {item.saltFormula}
                  </div>

                  <div className="relative flex h-24 w-11 flex-col justify-end overflow-hidden rounded-b-full border-2 border-slate-600/80 bg-slate-950/60 p-0.5 sm:h-32 sm:w-14">
                    <div
                      className="relative w-full rounded-b-full transition-all duration-500"
                      style={{
                        height: '68%',
                        backgroundColor: isDone ? item.resultColor : item.baseColor,
                      }}
                    >
                      {isDone && item.effect === 'gas' && (
                        <div className="absolute inset-0 flex items-center justify-around opacity-90">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                          <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                        </div>
                      )}
                      {isDone && item.effect === 'blue-precipitate' && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-full bg-sky-400" />
                      )}
                      {isDone && item.effect === 'white-precipitate' && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-full bg-slate-100" />
                      )}
                      {isDone && item.effect === 'brown-precipitate' && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-full bg-amber-700" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 min-h-[32px] text-center text-[11px] font-semibold leading-tight text-slate-300 sm:text-xs">
                    {isWrong ? (
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Видимых признаков нет
                      </span>
                    ) : isDone ? (
                      item.signTitle
                    ) : (
                      'Исходный раствор'
                    )}
                  </div>

                  {isDone && (
                    <div className="mt-1 rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                      {item.equation}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePour(item, idx)}
                  className={`mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 font-mono text-xs font-extrabold transition ${
                    isDone
                      ? 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                      : 'bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-950 hover:opacity-95'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      <span>Наблюдение</span>
                    </>
                  ) : (
                    <>
                      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                      <span>Прилить {REAGENTS.find((r) => r.id === selectedReagent)?.label}</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
