import { useState } from 'react'
import { BookOpen, FlaskConical, Grid, Sparkles, X } from 'lucide-react'

type Tab = 'solubility' | 'indicators' | 'gases'

const CATIONS = ['H⁺', 'Na⁺', 'K⁺', 'NH₄⁺', 'Ba²⁺', 'Ca²⁺', 'Mg²⁺', 'Zn²⁺', 'Fe²⁺', 'Fe³⁺', 'Cu²⁺', 'Ag⁺']

const ANIONS: { ion: string; vals: Record<string, string> }[] = [
  { ion: 'OH⁻', vals: { 'H⁺': 'H₂O', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': '↑NH₃', 'Ba²⁺': 'Р', 'Ca²⁺': 'М', 'Mg²⁺': 'Н', 'Zn²⁺': 'Н', 'Fe²⁺': 'Н', 'Fe³⁺': 'Н', 'Cu²⁺': 'Н', 'Ag⁺': '—' } },
  { ion: 'Cl⁻', vals: { 'H⁺': 'Р', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': 'Р', 'Ba²⁺': 'Р', 'Ca²⁺': 'Р', 'Mg²⁺': 'Р', 'Zn²⁺': 'Р', 'Fe²⁺': 'Р', 'Fe³⁺': 'Р', 'Cu²⁺': 'Р', 'Ag⁺': 'Н↓' } },
  { ion: 'SO₄²⁻', vals: { 'H⁺': 'Р', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': 'Р', 'Ba²⁺': 'Н↓', 'Ca²⁺': 'М', 'Mg²⁺': 'Р', 'Zn²⁺': 'Р', 'Fe²⁺': 'Р', 'Fe³⁺': 'Р', 'Cu²⁺': 'Р', 'Ag⁺': 'М' } },
  { ion: 'CO₃²⁻', vals: { 'H⁺': '↑CO₂', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': 'Р', 'Ba²⁺': 'Н↓', 'Ca²⁺': 'Н↓', 'Mg²⁺': 'Н', 'Zn²⁺': 'Н', 'Fe²⁺': 'Н', 'Fe³⁺': '—', 'Cu²⁺': '—', 'Ag⁺': 'Н' } },
  { ion: 'PO₄³⁻', vals: { 'H⁺': 'Р', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': 'Р', 'Ba²⁺': 'Н↓', 'Ca²⁺': 'Н↓', 'Mg²⁺': 'Н', 'Zn²⁺': 'Н', 'Fe²⁺': 'Н', 'Fe³⁺': 'Н', 'Cu²⁺': 'Н', 'Ag⁺': 'Н↓' } },
  { ion: 'NO₃⁻', vals: { 'H⁺': 'Р', 'Na⁺': 'Р', 'K⁺': 'Р', 'NH₄⁺': 'Р', 'Ba²⁺': 'Р', 'Ca²⁺': 'Р', 'Mg²⁺': 'Р', 'Zn²⁺': 'Р', 'Fe²⁺': 'Р', 'Fe³⁺': 'Р', 'Cu²⁺': 'Р', 'Ag⁺': 'Р' } },
]

export function ChemReferenceDrawer({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('solubility')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/75 backdrop-blur-sm sm:items-stretch">
      <div className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none sm:border-l">
        {/* Шапка справочника */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Справочник химика • ЦТ / ЦЭ
              </div>
              <h2 className="text-base font-extrabold text-white sm:text-lg">
                Таблицы и качественные признаки
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть справочник"
            className="rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-slate-400 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="grid grid-cols-3 gap-1 border-b border-slate-800 bg-slate-950/50 p-2">
          {[
            { id: 'solubility', label: 'Растворимость', icon: Grid },
            { id: 'indicators', label: 'Индикаторы', icon: Sparkles },
            { id: 'gases', label: 'Осадки и газы', icon: FlaskConical },
          ].map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as Tab)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Контент вкладок */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {tab === 'solubility' && (
            <div>
              <p className="mb-3 text-xs text-slate-400">
                <strong className="text-emerald-400">Р</strong> — растворимо,{' '}
                <strong className="text-amber-400">М</strong> — малорастворимо,{' '}
                <strong className="text-rose-400">Н / Н↓</strong> — осадок,{' '}
                <strong className="text-sky-400">↑</strong> — выделяется газ.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full border-collapse text-center font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-300">
                      <th className="sticky left-0 z-10 bg-slate-950 px-2.5 py-2 text-left font-bold text-sky-400">
                        Ион
                      </th>
                      {CATIONS.map((c) => (
                        <th key={c} className="px-2 py-2 font-bold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {ANIONS.map((row) => (
                      <tr key={row.ion} className="bg-slate-900/60">
                        <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-900 px-2.5 py-2 text-left font-bold text-slate-200">
                          {row.ion}
                        </td>
                        {CATIONS.map((c) => {
                          const val = row.vals[c] ?? '—'
                          const color = val.startsWith('Н')
                            ? 'bg-rose-500/15 font-bold text-rose-300'
                            : val.startsWith('↑')
                            ? 'bg-sky-500/15 font-bold text-sky-300'
                            : val === 'М'
                            ? 'text-amber-300'
                            : val === 'Р'
                            ? 'text-emerald-400/90'
                            : 'text-slate-600'

                          return (
                            <td key={c} className={`px-2 py-2 ${color}`}>
                              {val}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'indicators' && (
            <div className="flex flex-col gap-3">
              {[
                {
                  name: 'Фенолфталеин',
                  acid: 'Бесцветный',
                  neutral: 'Бесцветный',
                  alkali: 'Малиновый',
                  alkaliCls: 'text-pink-400 font-bold',
                },
                {
                  name: 'Метилоранж',
                  acid: 'Красный',
                  neutral: 'Оранжевый',
                  alkali: 'Жёлтый',
                  alkaliCls: 'text-amber-300 font-bold',
                },
                {
                  name: 'Лакмус',
                  acid: 'Красный',
                  neutral: 'Фиолетовый',
                  alkali: 'Синий',
                  alkaliCls: 'text-sky-400 font-bold',
                },
              ].map((ind) => (
                <div
                  key={ind.name}
                  className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4"
                >
                  <div className="mb-2.5 text-sm font-extrabold text-white">{ind.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-950/60 p-2.5">
                      <div className="mb-1 text-[10px] text-slate-500">Кислая (H⁺)</div>
                      <div className="font-bold text-rose-400">{ind.acid}</div>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-2.5">
                      <div className="mb-1 text-[10px] text-slate-500">Нейтральная</div>
                      <div className="font-semibold text-slate-300">{ind.neutral}</div>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-2.5">
                      <div className="mb-1 text-[10px] text-slate-500">Щелочная (OH⁻)</div>
                      <div className={ind.alkaliCls}>{ind.alkali}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'gases' && (
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              {[
                { ion: 'Cl⁻ + Ag⁺', res: 'AgCl↓ — белый творожистый осадок (не раств. в HNO₃)' },
                { ion: 'SO₄²⁻ + Ba²⁺', res: 'BaSO₄↓ — белый плотный осадок (не раств. в кислотах)' },
                { ion: 'CO₃²⁻ + 2H⁺', res: 'CO₂↑ + H₂O — «вскипание», выделение газа без запаха' },
                { ion: 'Cu²⁺ + 2OH⁻', res: 'Cu(OH)₂↓ — ярко-голубой студенистый осадок' },
                { ion: 'Fe³⁺ + 3OH⁻', res: 'Fe(OH)₃↓ — бурый осадок («ржавчина»)' },
                { ion: 'NH₄⁺ + OH⁻', res: 'NH₃↑ + H₂O — резкий запах нашатырного спирта' },
              ].map((item) => (
                <div
                  key={item.ion}
                  className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5"
                >
                  <div className="mb-1 font-mono text-xs font-bold text-sky-400">{item.ion}</div>
                  <div className="text-slate-200">{item.res}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
