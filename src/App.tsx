import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
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

export function App() {
  const [labId, setLabId] = useState<string | null>(null)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>({})
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all')
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
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
            className="pause"
            style={{ zIndex: 50 }}
            onClick={() => setLabId(null)}
          >
            ← В каталог
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                }}
              >
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

  // Находим тему, которую ученик начал, но ещё не закончил (для Hero-баннера)
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
      style={{
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#070b14',
        backgroundImage: `
          radial-gradient(circle at 18% 0%, rgba(16, 185, 129, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 82% 0%, rgba(56, 189, 248, 0.14) 0%, transparent 45%),
          linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      {/* Верхняя навигационная панель */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          borderBottom: '1px solid var(--line)',
          background: 'rgba(7, 11, 20, 0.82)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#04101c',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
              }}
            >
              HB
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                ХимБиоЛаб
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                ИНТЕРАКТИВНЫЙ ПРАКТИКУМ
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'rgba(255, 255, 255, 0.03)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              ЗАЧЁТ:{' '}
              <strong style={{ color: '#10b981' }}>
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

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '36px 24px 64px' }}>
        {/* Hero-баннер «Продолжить обучение», если есть начатая тема */}
        {activePack && (
          <section
            onClick={() => setLabId(activePack.id)}
            style={{
              marginBottom: '32px',
              padding: '22px 26px',
              borderRadius: '22px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background:
                'linear-gradient(120deg, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.1) 100%)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#38bdf8',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                ● Продолжить исследование
              </div>
              <h2 style={{ fontSize: '22px', margin: '0 0 4px' }}>
                {catalog[activePack.id]?.title ?? activePack.title}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                Выполнено шагов: {loadProgress(activePack.storageKey).length} из{' '}
                {catalog[activePack.id]?.totalSteps ?? 1}
              </p>
            </div>

            <button type="button" className="primary">
              Продолжить →
            </button>
          </section>
        )}

        {/* Заголовок каталога и панель фильтров */}
        <section style={{ marginBottom: '26px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '32px', margin: '0 0 6px' }}>Лабораторный практикум</h1>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px' }}>
                3D-симуляции, эксперименты и тренажёры для подготовки к урокам и ЦТ/ЦЭ
              </p>
            </div>

            {/* Табы предметов */}
            <div
              style={{
                display: 'inline-flex',
                gap: '4px',
                padding: '4px',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                background: 'rgba(15, 23, 42, 0.8)',
              }}
            >
              {[
                { id: 'all', label: 'Все предметы', color: 'var(--text)' },
                { id: 'biology', label: 'Биология', color: '#10b981' },
                { id: 'chemistry', label: 'Химия', color: '#38bdf8' },
              ].map((tab) => {
                const active = subjectFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubjectFilter(tab.id as SubjectFilter)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      color: active ? tab.color : 'var(--muted)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
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
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: active ? '1px solid var(--accent)' : '1px solid var(--line)',
                      background: active ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                      color: active ? 'var(--accent)' : 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
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
              placeholder="Поиск темы или термина..."
              style={{
                width: 'min(270px, 100%)',
                padding: '9px 14px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gridAutoFlow: 'dense',
            gap: '20px',
          }}
        >
          {visibleLabs.map((pack, index) => {
            const meta = catalog[pack.id]
            const doneCount = loadProgress(pack.storageKey).length
            const total = meta?.totalSteps ?? 1
            const quizDone = isQuizPassed(pack.storageKey)
            const isFinished = doneCount >= total && quizDone
            const needsQuiz = doneCount >= total && !quizDone
            const isHovered = hoveredId === pack.id
            const isBio = pack.subject === 'biology'
            const is3D = meta?.badge?.includes('3D')
            const isFeatured = Boolean(is3D) && visibleLabs.length > 2
            const accentColor = isBio ? '#10b981' : '#38bdf8'
            const totalSegments = total + 1
            const filledSegments = Math.min(doneCount, total) + (quizDone ? 1 : 0)

            return (
              <article
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
                  position: 'relative',
                  overflow: 'hidden',
                  gridColumn: isFeatured ? 'span 2' : 'span 1',
                  padding: isFeatured ? '28px 30px' : '24px',
                  borderRadius: '24px',
                  border: isHovered ? `1px solid ${accentColor}` : '1px solid var(--line)',
                  background: isFeatured
                    ? isBio
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(13, 20, 36, 0.9) 55%)'
                      : 'linear-gradient(135deg, rgba(56, 189, 248, 0.14) 0%, rgba(13, 20, 36, 0.9) 55%)'
                    : isHovered
                    ? 'rgba(20, 30, 50, 0.92)'
                    : 'rgba(13, 20, 36, 0.76)',
                  boxShadow: isHovered
                    ? `0 20px 44px -12px ${isBio ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)'}`
                    : '0 8px 24px rgba(0, 0, 0, 0.22)',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '24px',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {isFeatured && (
                  <svg
                    viewBox="0 0 200 200"
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '-10px',
                      top: '50%',
                      width: '210px',
                      height: '210px',
                      opacity: isHovered ? 0.28 : 0.14,
                      transform: `translateY(-50%) rotate(${isHovered ? '8deg' : '0deg'})`,
                      transition: 'all 0.4s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    <circle cx="100" cy="100" r="78" fill="none" stroke={accentColor} strokeWidth="1.2" strokeDasharray="6 6" />
                    <circle cx="100" cy="100" r="52" fill="none" stroke={accentColor} strokeWidth="1.5" />
                    <ellipse cx="100" cy="100" rx="88" ry="30" fill="none" stroke={accentColor} strokeWidth="1.2" transform="rotate(30 100 100)" />
                    <ellipse cx="100" cy="100" rx="88" ry="30" fill="none" stroke={accentColor} strokeWidth="1.2" transform="rotate(-30 100 100)" />
                    <circle cx="100" cy="100" r="8" fill={accentColor} />
                  </svg>
                )}

                <div style={{ position: 'relative', zIndex: 1, maxWidth: isFeatured ? '72%' : '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--muted)',
                      }}
                    >
                      0{index + 1}
                    </span>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: isBio ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.14)',
                        color: accentColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {meta?.badge ?? (isBio ? 'БИОЛОГИЯ' : 'ХИМИЯ')}
                    </span>

                    {isFinished ? (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: 'rgba(16, 185, 129, 0.18)',
                          color: '#34d399',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        ✓ ЗАЧТЕНО
                      </span>
                    ) : meta?.isExam ? (
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          color: '#fbbf24',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        ЦТ/ЦЭ
                      </span>
                    ) : null}
                  </div>

                  <h2
                    style={{
                      fontSize: isFeatured ? '24px' : '19px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    {meta?.title ?? pack.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.55 }}>
                    {meta?.desc}
                  </p>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isHovered ? accentColor : 'var(--text)',
                      marginBottom: '10px',
                    }}
                  >
                    <span>
                      {isFinished
                        ? 'Повторить практикум'
                        : needsQuiz
                        ? 'Пройти итоговый тест'
                        : doneCount > 0
                        ? 'Продолжить работу'
                        : isFeatured
                        ? 'Запустить 3D-симуляцию'
                        : 'Открыть практикум'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>
                      {filledSegments}/{totalSegments} →
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: totalSegments }, (_, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '99px',
                          background:
                            idx < filledSegments ? accentColor : 'rgba(148, 163, 184, 0.16)',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
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

