import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Experience } from './game/Experience'
import { GameProvider } from './game/state'
import { AuthBar } from './game/ui/AuthBar'
import { DEFAULT_CATALOG, fetchCatalog, type CatalogItem } from './platform/catalog'
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

export function App() {
  const [labId, setLabId] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>(DEFAULT_CATALOG)
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [, setSyncTick] = useState(0)

  useEffect(() => {
    fetchCatalog().then(setCatalog)
  }, [])

  if (labId) {
    const pack = getLab(labId)
    if (!pack) return <p className="fail">Лаборатория не найдена.</p>

    return (
      <WebGLGuard>
        <GameProvider pack={pack}>
          <button
            type="button"
            className="pause"
            style={{ zIndex: 50 }}
            onClick={() => setLabId(null)}
          >
            ← В меню
          </button>
          <Suspense
            fallback={
              <div
                style={{
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                Загрузка лаборатории...
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

  const query = search.trim().toLowerCase()

  const visibleLabs = allPacks.filter((pack) => {
    if (subjectFilter !== 'all' && pack.subject !== subjectFilter) return false

    const meta = catalog[pack.id]
    if (gradeFilter === 'exam' && !meta?.isExam) return false
    if (gradeFilter !== 'all' && gradeFilter !== 'exam') {
      if (!meta?.grades.includes(gradeFilter)) return false
    }

    if (query) {
      const hay = `${meta?.title ?? pack.title} ${meta?.desc ?? ''} ${meta?.badge ?? ''}`.toLowerCase()
      if (!hay.includes(query)) return false
    }

    return true
  })

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 0%, #112c20 0%, #06100b 100%)',
        padding: '36px 24px',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="eyebrow" style={{ margin: 0 }}>
                  ХимБиоЛаб
                </span>
                <span style={{ color: 'var(--line)' }}>•</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Пройдено тем:{' '}
                  <strong style={{ color: 'var(--accent)' }}>
                    {completedLabsCount} из {allPacks.length}
                  </strong>
                </span>
              </div>
              <h1 style={{ fontSize: '32px', margin: 0 }}>Виртуальные лаборатории</h1>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <AuthBar onSync={() => setSyncTick((t) => t + 1)} />

              <div
                style={{
                  display: 'inline-flex',
                  gap: '4px',
                  padding: '5px',
                  borderRadius: '14px',
                  border: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                {[
                  { id: 'all', label: `Все (${allPacks.length})` },
                  { id: 'biology', label: 'Биология' },
                  { id: 'chemistry', label: 'Химия' },
                ].map((tab) => {
                  const active = subjectFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubjectFilter(tab.id as SubjectFilter)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: active ? 'var(--accent)' : 'transparent',
                        color: active ? 'var(--ink)' : 'var(--muted)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'all', label: 'Все классы' },
                { id: '6', label: '6 класс' },
                { id: '8', label: '8 класс' },
                { id: '9', label: '9 класс' },
                { id: '10-11', label: '10–11 класс' },
                { id: 'exam', label: '🎯 ЦТ / ЦЭ' },
              ].map((g) => {
                const active = gradeFilter === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGradeFilter(g.id as GradeFilter)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      border: active ? '1px solid var(--accent)' : '1px solid var(--line)',
                      background: active ? 'rgba(223, 245, 106, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                      color: active ? 'var(--accent)' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Поиск по темам..."
              style={{
                width: 'min(260px, 100%)',
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </header>

        {visibleLabs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              borderRadius: '20px',
              border: '1px dashed var(--line)',
              color: 'var(--muted)',
            }}
          >
            <p style={{ margin: '0 0 12px' }}>По выбранным фильтрам тем пока нет.</p>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setSubjectFilter('all')
                setGradeFilter('all')
                setSearch('')
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '18px',
            }}
          >
            {visibleLabs.map((pack) => {
              const meta = catalog[pack.id]
              const doneCount = loadProgress(pack.storageKey).length
              const total = meta?.totalSteps ?? 1
              const quizDone = isQuizPassed(pack.storageKey)
              const isFinished = doneCount >= total && quizDone
              const needsQuiz = doneCount >= total && !quizDone
              const progressPercent = Math.min(
                100,
                ((Math.min(doneCount, total) + (quizDone ? 1 : 0)) / (total + 1)) * 100,
              )
              const isHovered = hoveredId === pack.id
              const accentColor = pack.subject === 'chemistry' ? '#38bdf8' : 'var(--accent)'

              return (
                <div
                  key={pack.id}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredId(pack.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setLabId(pack.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setLabId(pack.id)
                  }}
                  style={{
                    padding: '22px',
                    borderRadius: '20px',
                    border: isHovered ? `1px solid ${accentColor}` : '1px solid var(--line)',
                    background: isHovered ? 'rgba(18, 44, 32, 0.92)' : 'rgba(10, 26, 18, 0.75)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '18px',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                    transition: 'all 0.22s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '11px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                          }}
                        >
                          {meta?.icon ?? '🔬'}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: accentColor,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {meta?.badge}
                        </span>
                      </div>

                      {isFinished ? (
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'rgba(223, 245, 106, 0.18)',
                            color: 'var(--accent)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ✓ Готово
                        </span>
                      ) : doneCount > 0 && doneCount < total ? (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--muted)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doneCount}/{total}
                        </span>
                      ) : null}
                    </div>

                    <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>
                      {meta?.title ?? pack.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.45 }}>
                      {meta?.desc}
                    </p>
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isHovered ? accentColor : 'var(--muted)',
                        marginBottom: '8px',
                      }}
                    >
                      <span>
                        {isFinished
                          ? 'Повторить опыт'
                          : needsQuiz
                          ? 'Сдать финальный тест'
                          : doneCount > 0
                          ? 'Продолжить'
                          : 'Начать опыт'}
                      </span>
                      <span>→</span>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        borderRadius: '99px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: accentColor,
                          borderRadius: '99px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
