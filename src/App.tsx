import { Component, useState, type ReactNode } from 'react'
import { Experience } from './game/Experience'
import { GameProvider } from './game/state'
import { getLab } from './platform/registry'

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

export function App() {
  const [labId, setLabId] = useState<string | null>(null)

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

  return (
    <div style={{ height: '100vh', overflowY: 'auto', padding: '36px 20px' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <p className="eyebrow">ХимБиоЛаб • Школа и подготовка к ЦТ / ЦЭ</p>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Выбери лабораторию</h1>
        <p className="objective" style={{ marginBottom: '32px' }}>
          Интерактивные опыты по биологии и химии, тесты и работа в классе без телефонов.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          <div
            style={{
              padding: '24px',
              borderRadius: '22px',
              border: '1px solid var(--line)',
              background: 'var(--glass)',
            }}
          >
            <p className="eyebrow">Биология • 6 класс • 3D</p>
            <h2 style={{ fontSize: '22px' }}>Секрет зелёного листа</h2>
            <p className="objective" style={{ marginBottom: '20px' }}>
              Изучи ткани листа, запусти фотосинтез и пройди мини-тест A/B/C/D.
            </p>
            <button
              type="button"
              className="primary"
              onClick={() => setLabId('photosynthesis')}
            >
              Открыть →
            </button>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '22px',
              border: '1px solid var(--line)',
              background: 'var(--glass)',
            }}
          >
            <p className="eyebrow">Химия • 8 класс • 2D</p>
            <h2 style={{ fontSize: '22px' }}>Среда растворов и индикаторы</h2>
            <p className="objective" style={{ marginBottom: '20px' }}>
              Проведи реакции с кислотой, щёлочью и водой в виртуальных пробирках.
            </p>
            <button
              type="button"
              className="primary"
              onClick={() => setLabId('chem-indicators')}
            >
              Открыть →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
