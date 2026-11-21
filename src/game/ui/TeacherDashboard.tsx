import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react'
import { fetchMyStudents, getOrCreateTeacherCode } from '../../platform/classroom'
import { labPacks } from '../../platform/registry'
import type { CatalogItem } from '../../platform/catalog'

interface StudentRecord {
  uid: string
  email: string
  displayName: string
  lastLoginAt?: number
  progress?: Record<string, { steps?: string[]; quizPassed?: boolean }>
}

export function TeacherDashboard({
  catalog,
  onClose,
}: {
  catalog: Record<string, CatalogItem>
  onClose: () => void
}) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [code, list] = await Promise.all([getOrCreateTeacherCode(), fetchMyStudents()])
      setTeacherCode(code)
      list.sort((a, b) => (b.lastLoginAt ?? 0) - (a.lastLoginAt ?? 0))
      setStudents(list)
    } catch (err) {
      console.error('Ошибка загрузки журнала:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const packs = Object.values(labPacks)
    .filter((p) => !catalog[p.id]?.hidden)
    .sort((a, b) => (catalog[a.id]?.order ?? 99) - (catalog[b.id]?.order ?? 99))

  const copyCode = () => {
    navigator.clipboard.writeText(teacherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const query = search.trim().toLowerCase()
  const filteredStudents = students.filter(
    (s) =>
      !query ||
      s.displayName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query),
  )

  return (
    <div
      className="h-dvh overflow-y-auto overscroll-none bg-[#070b14] text-slate-100"
      style={{
        backgroundImage: `
          radial-gradient(circle at 18% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 82% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 45%),
          linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      {/* Шапка журнала */}
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Кабинет преподавателя
              </div>
              <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                Мой класс ({students.length})
              </h1>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            {teacherCode && (
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 sm:flex-initial"
              >
                <span>Код: {teacherCode}</span>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={loadData}
              title="Обновить данные"
              className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-sky-500/15 transition hover:opacity-95 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>В каталог</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Поиск по ученикам */}
        {students.length > 0 && (
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск ученика по имени или email..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-400/60 sm:text-sm"
              />
            </div>

            <div className="font-mono text-xs text-slate-400">
              Всего тем в программе: <strong className="text-slate-200">{packs.length}</strong>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 font-mono text-sm text-slate-400">
            Загрузка журнала учеников...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mb-1.5 text-lg font-extrabold text-white">
              {students.length === 0 ? 'В вашем классе пока нет учеников' : 'Никого не найдено'}
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-slate-400 sm:text-sm">
              Отправьте ученикам код класса{' '}
              <strong className="font-mono text-emerald-400">{teacherCode}</strong> — они смогут
              ввести его в меню профиля после входа через Google.
            </p>
          </div>
        ) : (
          <>
            {/* Мобильный вид (карточки учеников для экранов < 768px) */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredStudents.map((st) => {
                const passedCount = packs.filter((p) => {
                  const entry = st.progress?.[p.storageKey]
                  const total = catalog[p.id]?.totalSteps ?? 1
                  return (entry?.steps?.length ?? 0) >= total && Boolean(entry?.quizPassed)
                }).length

                return (
                  <div
                    key={st.uid}
                    className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-4 backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-white">
                          {st.displayName}
                        </div>
                        <div className="truncate text-xs text-slate-400">{st.email}</div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                        {passedCount}/{packs.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {packs.map((p) => {
                        const entry = st.progress?.[p.storageKey]
                        const stepsDone = entry?.steps?.length ?? 0
                        const total = catalog[p.id]?.totalSteps ?? 1
                        const quizPassed = Boolean(entry?.quizPassed)
                        const fullDone = stepsDone >= total && quizPassed

                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="truncate text-slate-300">
                              {catalog[p.id]?.title ?? p.title}
                            </span>
                            {fullDone ? (
                              <span className="inline-flex shrink-0 items-center gap-1 font-mono font-bold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Сдано
                              </span>
                            ) : stepsDone > 0 ? (
                              <span className="shrink-0 font-mono font-semibold text-amber-300">
                                {stepsDone}/{total} {quizPassed ? '• тест ✓' : ''}
                              </span>
                            ) : (
                              <span className="shrink-0 font-mono text-slate-600">—</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Десктопный и планшетный вид (таблица для экранов >= 768px) */}
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-md md:block">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 font-mono text-xs text-slate-400">
                    <th className="px-4 py-3.5 font-bold">Ученик</th>
                    <th className="px-3 py-3.5 font-bold">Зачёт</th>
                    {packs.map((p) => (
                      <th key={p.id} className="whitespace-nowrap px-3 py-3.5 font-semibold">
                        {catalog[p.id]?.title ?? p.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((st) => {
                    const passedCount = packs.filter((p) => {
                      const entry = st.progress?.[p.storageKey]
                      const total = catalog[p.id]?.totalSteps ?? 1
                      return (entry?.steps?.length ?? 0) >= total && Boolean(entry?.quizPassed)
                    }).length

                    return (
                      <tr key={st.uid} className="transition hover:bg-slate-800/30">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{st.displayName}</div>
                          <div className="text-xs text-slate-400">{st.email}</div>
                        </td>

                        <td className="px-3 py-3.5 font-mono font-bold text-emerald-400">
                          {passedCount} / {packs.length}
                        </td>

                        {packs.map((p) => {
                          const entry = st.progress?.[p.storageKey]
                          const stepsDone = entry?.steps?.length ?? 0
                          const total = catalog[p.id]?.totalSteps ?? 1
                          const quizPassed = Boolean(entry?.quizPassed)
                          const fullDone = stepsDone >= total && quizPassed

                          return (
                            <td key={p.id} className="whitespace-nowrap px-3 py-3.5">
                              {fullDone ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Сдано
                                </span>
                              ) : stepsDone > 0 ? (
                                <span className="font-mono text-xs font-semibold text-amber-300">
                                  {stepsDone}/{total} {quizPassed ? '• тест ✓' : ''}
                                </span>
                              ) : (
                                <span className="font-mono text-slate-600">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
