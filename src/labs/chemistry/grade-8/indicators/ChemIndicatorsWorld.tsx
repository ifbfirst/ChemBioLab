import { useState } from 'react'
import { CheckCircle2, Droplets, Eye, FlaskConical } from 'lucide-react'
import { useLab } from '../../../../game/state'

type IndicatorId = 'litmus' | 'methylorange' | 'phenolphthalein'
type MediumId = 'acid' | 'neutral' | 'alkali'

interface BeakerConfig {
  id: MediumId
  label: string
  formula: string
  phText: string
}

const INDICATORS: { id: IndicatorId; label: string; short: string }[] = [
  { id: 'litmus', label: 'Лакмус', short: 'Лакмус' },
  { id: 'methylorange', label: 'Метилоранж', short: 'Метилоранж' },
  { id: 'phenolphthalein', label: 'Фенолфталеин', short: 'Ф/фталеин' },
]

const BEAKERS: BeakerConfig[] = [
  { id: 'acid', label: 'Кислая среда', formula: 'HCl (pH < 7)', phText: 'Избыток H⁺' },
  { id: 'neutral', label: 'Нейтральная', formula: 'H₂O (pH = 7)', phText: 'H⁺ = OH⁻' },
  { id: 'alkali', label: 'Щелочная среда', formula: 'NaOH (pH > 7)', phText: 'Избыток OH⁻' },
]

function getIndicatorAppearance(medium: MediumId, indicator: IndicatorId | null) {
  if (!indicator) {
    return {
      color: 'rgba(226, 232, 240, 0.14)',
      caption: 'Прозрачный раствор',
    }
  }

  if (indicator === 'litmus') {
    if (medium === 'acid') return { color: 'rgba(244, 63, 94, 0.72)', caption: 'Красный (лакмус)' }
    if (medium === 'neutral') return { color: 'rgba(168, 85, 247, 0.65)', caption: 'Фиолетовый (лакмус)' }
    return { color: 'rgba(59, 130, 246, 0.75)', caption: 'Синий (лакмус)' }
  }

  if (indicator === 'methylorange') {
    if (medium === 'acid') return { color: 'rgba(244, 63, 94, 0.75)', caption: 'Красный (метилоранж)' }
    if (medium === 'neutral') return { color: 'rgba(249, 115, 22, 0.72)', caption: 'Оранжевый (метилоранж)' }
    return { color: 'rgba(250, 204, 21, 0.75)', caption: 'Жёлтый (метилоранж)' }
  }

  // phenolphthalein
  if (medium === 'alkali') {
    return { color: 'rgba(236, 72, 153, 0.78)', caption: 'Малиновый (фенолфталеин)' }
  }
  return { color: 'rgba(226, 232, 240, 0.15)', caption: 'Бесцветный (фенолфталеин)' }
}

export function ChemIndicatorsWorld() {
  const { state, facts, api } = useLab()
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorId>('litmus')
  const [applied, setApplied] = useState<Partial<Record<MediumId, IndicatorId>>>({})

  const factKeys = Object.keys(facts)
  const resolveFactId = (shortKey: string, fallbackIndex: number) =>
    factKeys.find((k) => k.toLowerCase().includes(shortKey)) ?? factKeys[fallbackIndex] ?? shortKey

  const handleDrop = (beaker: BeakerConfig, idx: number) => {
    setApplied((prev) => ({ ...prev, [beaker.id]: selectedIndicator }))
    const targetId = resolveFactId(beaker.id, idx)
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
      <div className="mx-auto w-full max-w-3xl">
        {/* Выбор индикатора */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md sm:mb-6 sm:px-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Droplets className="h-4 w-4 shrink-0 text-sky-400" />
            <span>Выбери индикатор:</span>
          </div>

          <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto">
            {INDICATORS.map((ind) => {
              const active = selectedIndicator === ind.id
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setSelectedIndicator(ind.id)}
                  className={`rounded-xl border px-2.5 py-1.5 font-mono text-xs font-extrabold transition ${
                    active
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="sm:hidden">{ind.short}</span>
                  <span className="hidden sm:inline">{ind.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Адаптивная сетка 3 стаканов */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {BEAKERS.map((beaker, idx) => {
            const targetId = resolveFactId(beaker.id, idx)
            const isDone = state.studied.includes(targetId)
            const activeInd = applied[beaker.id] ?? null
            const appearance = getIndicatorAppearance(beaker.id, activeInd)

            return (
              <div
                key={beaker.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                  isDone
                    ? 'border-emerald-400/60 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/85'
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-white">{beaker.label}</div>
                    <div className="font-mono text-xs text-slate-400">{beaker.formula}</div>
                  </div>
                  {isDone && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
                </div>

                {/* Химический стакан */}
                <div className="my-2 flex flex-col items-center">
                  <div className="relative flex h-24 w-20 flex-col justify-end overflow-hidden rounded-b-2xl border-x-2 border-b-2 border-slate-600/80 bg-slate-950/60 p-1 sm:h-28 sm:w-24">
                    <div
                      className="w-full rounded-b-xl transition-all duration-500"
                      style={{ height: '72%', backgroundColor: appearance.color }}
                    />
                  </div>

                  <div className="mt-2.5 text-center text-xs font-semibold text-slate-200">
                    {appearance.caption}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {beaker.phText}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDrop(beaker, idx)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:opacity-95"
                  >
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                    <span>Капнуть</span>
                  </button>

                  {isDone && (
                    <button
                      type="button"
                      onClick={() => api.inspect(targetId, targetId)}
                      title="Открыть наблюдение"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-200 transition hover:bg-slate-800"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
