import { useEffect, useRef, useState } from 'react'
import { zoomIn, zoomOut } from '../camera/zoom'
import { useLab } from '../state'
import { LeafQuizModal } from './LeafQuizModal'

export function Hud() {
  const { pack, state, view, facts, api } = useLab()
  const [quizOpen, setQuizOpen] = useState(false)
  const stateRef = useRef(state)
  const apiRef = useRef(api)
  stateRef.current = state
  apiRef.current = api

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'Escape') return
      if (quizOpen) {
        setQuizOpen(false)
        return
      }
      if (stateRef.current.panelFactId) apiRef.current.closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [quizOpen])

  const fact = state.panelFactId ? facts[state.panelFactId] : undefined

  return (
    <div className="hud">
      <section className="mission-card" aria-label="Текущая миссия">
        <p className="eyebrow">Миссия</p>
        <h1>{view.missionTitle}</h1>
        <p className="objective">{view.objective}</p>
        {view.chips ? (
          <ul className="chips">
            {view.chips.map((chip) => (
              <li key={chip.label} className={chip.done ? 'done' : undefined}>
                {chip.label}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="progress" aria-label={`Изучено ${view.step} из ${view.steps}`}>
          {Array.from({ length: view.steps }, (_, index) => (
            <span key={index} className={index < view.step ? 'done' : undefined} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginTop: '10px',
          }}
        >
          <p className="step" style={{ margin: 0 }}>
            Изучено {view.step} из {view.steps}
          </p>
          {view.step > 0 || state.synthesis ? (
            <button
              type="button"
              onClick={() => api.restart()}
              style={{
                padding: '4px 10px',
                border: '1px solid var(--line)',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--muted)',
                fontSize: '12px',
                pointerEvents: 'auto',
              }}
            >
              ↻ Начать заново
            </button>
          ) : null}
        </div>

        {pack.subject === 'biology' && state.synthesis ? (
          <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', display: 'grid', gap: '4px' }}>
            <div><span style={{ color: '#60a5fa' }}>●</span> H₂O — вода по ксилеме</div>
            <div><span style={{ color: '#ffffff' }}>●</span> CO₂ — газ через устьице</div>
            <div><span style={{ color: '#fb923c' }}>●</span> Глюкоза — отток по флоэме</div>
            <div><span style={{ color: '#dff56a' }}>●</span> O₂ — выход кислорода</div>
          </div>
        ) : pack.subject === 'biology' ? (
          <p className="hint">Мышь — вращать, колёсико — уменьшить и увеличить</p>
        ) : null}
      </section>

      {pack.subject === 'biology' ? (
        <div className="zoom-controls" aria-label="Масштаб">
          <button type="button" aria-label="Увеличить" onClick={zoomIn}>
            +
          </button>
          <button type="button" aria-label="Уменьшить" onClick={zoomOut}>
            −
          </button>
        </div>
      ) : null}

      {fact ? (
        <aside className="info-card" role="dialog" aria-labelledby="fact-title">
          <p className="eyebrow">Наблюдение</p>
          <h2 id="fact-title">{fact.title}</h2>
          <p>{fact.body}</p>
          {fact.note ? <p className="note">{fact.note}</p> : null}
          <button type="button" className="ghost" onClick={() => api.closePanel()}>
            Закрыть
          </button>
        </aside>
      ) : null}

      {pack.subject === 'biology' && view.done && !state.synthesis ? (
        <button type="button" className="launch" onClick={() => api.launch()}>
          Запустить фотосинтез
        </button>
      ) : null}

      {(pack.subject === 'biology' && state.synthesis) || (pack.subject === 'chemistry' && view.done) ? (
        <button type="button" className="launch" onClick={() => setQuizOpen(true)}>
          Пройти тест по теме (A/B/C/D)
        </button>
      ) : null}

      {quizOpen ? <LeafQuizModal subject={pack.subject} onClose={() => setQuizOpen(false)} /> : null}
    </div>
  )
}