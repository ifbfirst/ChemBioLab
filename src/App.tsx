import { Component, useState, type ReactNode } from 'react'
import { Experience } from './game/Experience'
import { GameProvider } from './game/state'
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

type Filter = 'all' | 'biology' | 'chemistry'

const CARD_META: Record<
  string,
  { icon: string; badge: string; title: string; desc: string; totalSteps: number }
> = {
  photosynthesis: {
    icon: '🌿',
    badge: '6 класс • 3D',
    title: 'Секрет зелёного листа',
    desc: 'Ткани листа, потоки веществ и запуск фотосинтеза',
    totalSteps: 4,
  },
  'bio-cell': {
    icon: '🔬',
    badge: '9–10 класс • 2D',
    title: 'Строение клетки',
    desc: 'Сравнение растительной, животной и бактериальной клеток',
    totalSteps: 6,
  },
  'bio-dna-3d': {
    icon: '🧬',
    badge: '10 класс • 3D',
    title: 'Двойная спираль ДНК',
    desc: 'Комплементарность А–Т / Г–Ц и сборка нити иРНК',
    totalSteps: 3,
  },
  'bio-division-3d': {
    icon: '🧫',
    badge: '10–11 класс • 3D • ЦТ/ЦЭ',
    title: 'Митоз и Мейоз',
    desc: 'Сравни деление клетки в 3D: кроссинговер, расхождение хромосом и расчёт наборов n и c',
    totalSteps: 8,
  },
  'chem-indicators': {
    icon: '🧪',
    badge: '8 класс • 2D',
    title: 'Среда и индикаторы',
    desc: 'Реакции лакмуса, фенолфталеина и метилоранжа',
    totalSteps: 3,
  },
  'chem-qualitative': {
    icon: '⚗️',
    badge: '9–11 класс • 2D',
    title: 'Качественные реакции',
    desc: 'Распознавание ионов по цвету осадка и выделению газа',
    totalSteps: 4,
  },
  'chem-detective': {
    icon: '🕵️',
    badge: 'Практикум • ЦТ/ЦЭ',
    title: 'Химический детектив',
    desc: 'Определи 4 неизвестных раствора без этикеток',
    totalSteps: 4,
  },
}

export function App() {
  const [labId, setLabId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

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
          <Experience />
        </GameProvider>
      </WebGLGuard>
    )
  }

  const allPacks = Object.values(labPacks)
  const completedLabsCount = allPacks.filter((p) => {
    const total = CARD_META[p.id]?.totalSteps ?? 1
    return loadProgress(p.storageKey).length >= total && isQuizPassed(p.storageKey)
  }).length

  const visibleLabs = allPacks.filter((pack) =>
    filter === 'all' ? true : pack.subject === filter,
  )

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 0%, #112c20 0%, #06100b 100%)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '20px',
            paddingBottom: '28px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
            <h1 style={{ fontSize: '34px', margin: 0 }}>Виртуальные лаборатории</h1>
          </div>

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
              const active = filter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as Filter)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
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
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '18px',
          }}
        >
          {visibleLabs.map((pack) => {
            const meta = CARD_META[pack.id]
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
      </div>
    </div>
  )
}
