import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Dna, HelpCircle } from 'lucide-react'
import { useLab } from '../../../../game/state'

export type DivisionMode = 'mitosis' | 'meiosis1' | 'meiosis2'
export type DivisionPhase = 'prophase' | 'metaphase' | 'anaphase' | 'telophase'

const MODES: { id: DivisionMode; label: string; short: string }[] = [
  { id: 'mitosis', label: 'Митоз (4 фазы)', short: 'Митоз' },
  { id: 'meiosis1', label: 'Мейоз I (4 фазы)', short: 'Мейоз I' },
]

const PHASES: { id: DivisionPhase; label: string; short: string; indexOffset: number }[] = [
  { id: 'prophase', label: '1. Профаза', short: 'Профаза', indexOffset: 0 },
  { id: 'metaphase', label: '2. Метафаза', short: 'Метафаза', indexOffset: 1 },
  { id: 'anaphase', label: '3. Анафаза', short: 'Анафаза', indexOffset: 2 },
  { id: 'telophase', label: '4. Телофаза', short: 'Телофаза', indexOffset: 3 },
]

const CORRECT_SET: Record<string, { answer: string; options: string[] }> = {
  'mitosis-prophase': { answer: '2n4c', options: ['2n2c', '2n4c', '4n4c', '1n2c'] },
  'mitosis-metaphase': { answer: '2n4c', options: ['2n2c', '2n4c', '4n4c', '1n1c'] },
  'mitosis-anaphase': { answer: '4n4c', options: ['2n4c', '4n4c', '2n2c', '1n2c'] },
  'mitosis-telophase': { answer: '2n2c', options: ['2n4c', '4n4c', '2n2c', '1n1c'] },
  'meiosis1-prophase': { answer: '2n4c', options: ['1n2c', '2n2c', '2n4c', '1n1c'] },
  'meiosis1-metaphase': { answer: '2n4c', options: ['1n2c', '2n4c', '4n4c', '1n1c'] },
  'meiosis1-anaphase': { answer: '2n4c', options: ['4n4c', '2n4c', '1n2c', '1n1c'] },
  'meiosis1-telophase': { answer: '1n2c', options: ['2n4c', '2n2c', '1n2c', '1n1c'] },
}

export function DivisionControls({
  mode,
  setMode,
  phase,
  setPhase,
}: {
  mode: DivisionMode
  setMode: (m: DivisionMode) => void
  phase: DivisionPhase
  setPhase: (p: DivisionPhase) => void
}) {
  const { state, view, facts, api } = useLab()
  const [wrongOpt, setWrongOpt] = useState<string | null>(null)
  const factKeys = Object.keys(facts)

  if (view.done) return null

  const currentMissionId = `${mode}-${phase}`
  const currentPhaseObj = PHASES.find((p) => p.id === phase) ?? PHASES.at(0)!
  const currentFactId =
    factKeys.find(
      (k) =>
        k.toLowerCase().includes(mode) && k.toLowerCase().includes(phase),
    ) ??
    factKeys.find((k) => k.toLowerCase().includes(phase)) ??
    factKeys.at(currentPhaseObj.indexOffset) ??
    currentMissionId

  const task = CORRECT_SET[currentMissionId] ?? {
    answer: '2n4c',
    options: ['2n2c', '2n4c', '4n4c', '1n2c'],
  }
  const isCurrentSolved = state.studied.includes(currentMissionId)

  const handleAnswer = (opt: string) => {
    if (opt === task.answer) {
      setWrongOpt(null)
      api.inspect(currentMissionId, currentFactId)
    } else {
      setWrongOpt(opt)
    }
  }

  return createPortal(
    <div
      data-bottom-dock
      style={{ pointerEvents: 'none', zIndex: 9000 }}
      className="fixed inset-x-0 bottom-3 mx-auto flex max-w-2xl flex-col gap-2 px-3 sm:bottom-4"
    >
      {/* 1. Тренажёр выбора набора хромосом (n) и ДНК (c) для текущей фазы */}
      <div
        style={{ pointerEvents: 'auto' }}
        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-400/40 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>Набор в этой фазе:</span>
        </div>

        <div className="grid w-full grid-cols-4 gap-1.5 sm:flex sm:w-auto">
          {task.options.map((opt) => {
            const isCorrectBtn = isCurrentSolved && opt === task.answer
            const isWrongBtn = wrongOpt === opt

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                style={{ pointerEvents: 'auto' }}
                className={`cursor-pointer rounded-xl border px-3 py-1 font-mono text-xs font-extrabold transition ${
                  isCorrectBtn
                    ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300'
                    : isWrongBtn
                    ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                    : 'border-slate-700 bg-slate-800/80 text-slate-100 hover:border-amber-400/60'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Выбор режима и фазы деления */}
      <div
        style={{ pointerEvents: 'auto' }}
        className="flex flex-col gap-1.5 rounded-2xl border border-slate-800/90 bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="grid grid-cols-2 gap-1 sm:flex">
          {MODES.map((m) => {
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id)
                  setWrongOpt(null)
                }}
                style={{ pointerEvents: 'auto' }}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-sky-500/25 text-sky-300 ring-1 ring-sky-400/60'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Dna className="h-3.5 w-3.5" />
                <span className="sm:hidden">{m.short}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-4 gap-1 sm:flex">
          {PHASES.map((p) => {
            const active = phase === p.id
            const mId = `${mode}-${p.id}`
            const isStudied = state.studied.includes(mId)

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPhase(p.id)
                  setWrongOpt(null)
                }}
                style={{ pointerEvents: 'auto' }}
                className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-extrabold transition sm:px-2.5 sm:text-xs ${
                  active
                    ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/60'
                    : isStudied
                    ? 'bg-emerald-500/10 text-emerald-400/90 hover:bg-slate-800/80'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="sm:hidden">{p.short}</span>
                <span className="hidden sm:inline">{p.label}</span>
                {isStudied && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
