import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Dna,
  FlaskConical,
  Leaf,
  Microscope,
  Play,
  Search,
  Sparkles,
  TestTube2,
} from 'lucide-react'
import { Experience } from './game/Experience'
import { GameProvider } from './game/state'
import { AuthBar } from './game/ui/AuthBar'
import { TeacherDashboard } from './game/ui/TeacherDashboard'
import { fetchCatalog, type CatalogItem } from './platform/catalog'
import { isQuizPassed, loadProgress } from './platform/progress'
import { getLab, labPacks } from './platform/registry'

class WebGLGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="fail">
          Не удалось запустить трёхмерную сцену. Проверьте, что в браузере включён WebGL.
        </p>
      )
    }
    return this.props.children
  }
}

type SubjectFilter = 'all' | 'biology' | 'chemistry'
type GradeFilter = 'all' | '6' | '8' | '9' | '10-11' | 'exam'

function LabVectorIcon({ id, isBio }: { id: string; isBio: boolean }) {
  const cls = `h-5 w-5 ${isBio ? 'text-emerald-400' : 'text-sky-400'}`
  if (id.includes('dna') || id.includes('division')) return <Dna className={cls} />
  if (id.includes('cell')) return <Microscope className={cls} />
  if (id.includes('photo')) return <Leaf className={cls} />
  if (id.includes('detective')) return <Search className={cls} />
  if (id.includes('qualitative')) return <FlaskConical className={cls} />
  return <TestTube2 className={cls} />
}

function CardBackgroundArt({ id, isBio }: { id: string; isBio: boolean }) {
  const stroke = isBio ? '#34d399' : '#38bdf8'

  if (id.includes('photo')) {
    return (
      <svg
        viewBox="0 0 180 180"
        className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
      >
        <defs>
          <radialGradient id="leafBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="90" cy="90" r="78" fill="url(#leafBg)" />
        <path
          d="M 32 135 C 35 68, 92 32, 148 35 C 145 92, 108 145, 32 135 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
        />
        <path d="M 32 135 Q 88 88 148 35" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="84" cy="72" r="8" fill={stroke} opacity="0.45" />
        <circle cx="106" cy="96" r="10" fill={stroke} opacity="0.35" />
        <circle cx="68" cy="104" r="7" fill={stroke} opacity="0.4" />
      </svg>
    )
  }

  if (id.includes('dna')) {
    return (
      <svg
        viewBox="0 0 180 180"
        className="pointer-events-none absolute -bottom-4 -right-4 h-44 w-44 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
      >
        <path
          d="M 55 20 C 125 45, 55 95, 125 120 C 155 132, 95 160, 65 170"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
        />
        <path
          d="M 125 20 C 55 45, 125 95, 55 120 C 25 132, 85 160, 115 170"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <line x1="68" y1="36" x2="112" y2="36" stroke={stroke} strokeWidth="2" />
        <line x1="72" y1="68" x2="108" y2="68" stroke="#38bdf8" strokeWidth="2" />
        <line x1="68" y1="102" x2="112" y2="102" stroke={stroke} strokeWidth="2" />
        <line x1="64" y1="136" x2="116" y2="136" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    )
  }

  if (id.includes('cell')) {
    return (
      <svg
        viewBox="0 0 180 180"
        className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
      >
        <polygon
          points="90,16 154,52 154,128 90,164 26,128 26,52"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
        />
        <circle cx="68" cy="84" r="22" fill={stroke} opacity="0.35" stroke={stroke} strokeWidth="2" />
        <ellipse cx="114" cy="106" rx="26" ry="18" fill="#38bdf8" opacity="0.28" />
        <ellipse cx="112" cy="58" rx="14" ry="7" fill={stroke} opacity="0.5" />
      </svg>
    )
  }

  if (id.includes('division')) {
    return (
      <svg
        viewBox="0 0 180 180"
        className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
      >
        <circle cx="90" cy="90" r="68" fill="none" stroke={stroke} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d="M 65 62 L 85 90 L 65 118 M 85 62 L 65 90 L 85 118" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 102 62 L 122 90 L 102 118 M 122 62 L 102 90 L 122 118" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 180 180"
      className="pointer-events-none absolute -bottom-5 -right-5 h-44 w-44 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30"
    >
      <rect x="52" y="34" width="22" height="96" rx="11" fill="none" stroke={stroke} strokeWidth="2.5" />
      <path d="M 54 88 H 72 V 119 A 9 9 0 0 1 54 119 Z" fill={stroke} opacity="0.45" />
      <rect x="92" y="48" width="22" height="96" rx="11" fill="none" stroke="#ec4899" strokeWidth="2.5" />
      <path d="M 94 98 H 112 V 133 A 9 9 0 0 1 94 133 Z" fill="#ec4899" opacity="0.45" />
      <circle cx="63" cy="76" r="3" fill={stroke} />
      <circle cx="103" cy="84" r="3.5" fill="#ec4899" />
    </svg>
  )
}

export function App() {
  const [labId, setLabId] = useState<string | null>(null)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>({})
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const [search, setSearch] = useState('')
  const [, setSyncTick] = useState(0)

  useEffect(() => {
    fetchCatalog().then(setCatalog)
  }, [])

  if (teacherOpen) {
    return <TeacherDashboard catalog={catalog} onClose={() => setTeacherOpen(false)} />
  }

  if (labId) {
    const pack = getLab(labId)
    if (!pack) return <p className="fail">Лаборатория не найдена.</p>

    return (
      <WebGLGuard>
        <GameProvider pack={pack}>
          <button
            type="button"
            className="pause inline-flex items-center gap-1.5"
            style={{ zIndex: 50 }}
            onClick={() => setLabId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>В каталог</span>
          </button>
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center font-mono text-sm text-sky-400">
                Инициализация 3D/2D среды...
              </div>
            }
          >
            <Experience />
          </Suspense>
        </GameProvider>
      </WebGLGuard>
    )
  }

  const allPacks = Object.values(labPacks)
    .filter((p) => !catalog[p.id]?.hidden)
    .sort((a, b) => (catalog[a.id]?.order ?? 99) - (catalog[b.id]?.order ?? 99))

  const completedLabsCount = allPacks.filter((p) => {
    const total = catalog[p.id]?.totalSteps ?? 1
    return loadProgress(p.storageKey).length >= total && isQuizPassed(p.storageKey)
  }).length

  const activePack = allPacks.find((p) => {
    const done = loadProgress(p.storageKey).length
    const total = catalog[p.id]?.totalSteps ?? 1
    const quizDone = isQuizPassed(p.storageKey)
    return done > 0 && !(done >= total && quizDone)
  })

  const query = search.trim().toLowerCase()

  const visibleLabs = allPacks.filter((pack) => {
    if (subjectFilter !== 'all' && pack.subject !== subjectFilter) return false

    const meta = catalog[pack.id]
    if (gradeFilter === 'exam' && !meta?.isExam) return false
    if (gradeFilter !== 'all' && gradeFilter !== 'exam') {
      if (!meta?.grades?.includes(gradeFilter)) return false
    }

    if (query) {
      const hay = `${meta?.title ?? pack.title} ${meta?.desc ?? ''} ${meta?.badge ?? ''}`.toLowerCase()
      if (!hay.includes(query)) return false
    }

    return true
  })
  return (
    <div
      className="h-screen overflow-y-auto bg-[#070b14] text-slate-100"
      style={{
        backgroundImage: `
          radial-gradient(circle at 18% 0%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 82% 0%, rgba(56, 189, 248, 0.14) 0%, transparent 45%),
          linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      {/* Адаптивная верхняя навигация */}
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 font-mono text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 sm:h-10 sm:w-10 sm:text-sm">
              HB
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                ХимБиоЛаб
              </div>
              <div className="hidden font-mono text-[10px] tracking-wider text-slate-400 sm:block">
                ИНТЕРАКТИВНЫЙ ПРАКТИКУМ
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 font-mono text-xs text-slate-300">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ЗАЧЁТ:</span>
              <strong className="text-emerald-400">
                {completedLabsCount}/{allPacks.length}
              </strong>
            </div>

            <AuthBar
              onSync={() => setSyncTick((t) => t + 1)}
              onOpenTeacher={() => setTeacherOpen(true)}
            />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-9">
        {/* Hero-баннер продолжения обучения
        {activePack && (
          <section
            onClick={() => setLabId(activePack.id)}
            className="mb-7 flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900/90 to-sky-500/10 p-4 transition hover:border-sky-400/60 sm:flex-row sm:items-center sm:p-6"
          >
            <div className="min-w-0">
              <div className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Продолжить исследование</span>
              </div>
              <h2 className="truncate text-lg font-extrabold text-white sm:text-xl">
                {catalog[activePack.id]?.title ?? activePack.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Выполнено шагов: {loadProgress(activePack.storageKey).length} из{' '}
                {catalog[activePack.id]?.totalSteps ?? 1}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:opacity-95 sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Продолжить</span>
            </button>
          </section>
        )} */}

        {/* Фильтры и поиск */}
        <section className="mb-6 flex flex-col gap-3 sm:mb-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Все предметы' },
                { id: 'biology', label: 'Биология' },
                { id: 'chemistry', label: 'Химия' },
              ].map((tab) => {
                const active = subjectFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubjectFilter(tab.id as SubjectFilter)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
                      active
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по теме..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-400/60 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Все классы' },
              { id: '6', label: '6 кл.' },
              { id: '8', label: '8 кл.' },
              { id: '9', label: '9 кл.' },
              { id: '10-11', label: '10–11 кл.' },
              { id: 'exam', label: 'ЦТ / ЦЭ' },
            ].map((g) => {
              const active = gradeFilter === g.id
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGradeFilter(g.id as GradeFilter)}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition ${
                    active
                      ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Сетка карточек ОДИНАКОВОГО РАЗМЕРА с фоновой 3D-иллюстрацией */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {visibleLabs.map((pack) => {
            const meta = catalog[pack.id]
            const title = meta?.title ?? pack.title
            const desc = meta?.desc ?? ''
            const badge = meta?.badge ?? (pack.subject === 'biology' ? 'Биология' : 'Химия')
            const totalSteps = meta?.totalSteps ?? 1
            const doneSteps = Math.min(loadProgress(pack.storageKey).length, totalSteps)
            const quizDone = isQuizPassed(pack.storageKey)
            const isFullDone = doneSteps >= totalSteps && quizDone
            const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0
            const isBio = pack.subject === 'biology'

            return (
              <article
                key={pack.id}
                onClick={() => setLabId(pack.id)}
                className={`group relative flex h-full min-h-[272px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 sm:p-6 ${
                  isBio
                    ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-slate-900/95 to-slate-900/95 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10'
                    : 'border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-slate-900/95 to-slate-900/95 hover:border-sky-400/60 hover:shadow-xl hover:shadow-sky-500/10'
                }`}
              >
                {/* Угловое сияние */}
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-90 ${
                    isBio ? 'bg-emerald-500/15 opacity-55' : 'bg-sky-500/15 opacity-55'
                  }`}
                />

                {/* Фоновая векторная 3D-иллюстрация по теме */}
                <CardBackgroundArt id={pack.id} isBio={isBio} />

                {/* Верхний блок с фиксированной структурой */}
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                          isBio
                            ? 'border-emerald-400/30 bg-emerald-500/15'
                            : 'border-sky-400/30 bg-sky-500/15'
                        }`}
                      >
                        <LabVectorIcon id={pack.id} isBio={isBio} />
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isBio ? 'text-emerald-400' : 'text-sky-400'
                        }`}
                      >
                        {badge}
                        </span>
                    </div>

                    {isFullDone && (
                      <span
                        title="Зачёт получен"
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Зачёт</span>
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-white transition-colors group-hover:text-emerald-300">
                    {title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {desc}
                  </p>
                </div>

                {/* Нижний блок (прижат к низу карточки) */}
                <div className="relative z-10 mt-5 border-t border-slate-800/80 pt-3.5">
                  <div className="mb-2 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">
                      Шаги: <strong className="text-slate-200">{doneSteps}/{totalSteps}</strong>
                      {quizDone ? ' • Тест ✓' : ''}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold transition-transform group-hover:translate-x-0.5 ${
                        isBio ? 'text-emerald-400' : 'text-sky-400'
                      }`}
                    >
                      <span>Открыть</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBio
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                          : 'bg-gradient-to-r from-sky-400 to-cyan-300'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
