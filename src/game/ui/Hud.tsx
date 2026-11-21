import { useEffect, useRef, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { zoomIn, zoomOut } from '../camera/zoom'
import { useLab } from '../state'
import { ChemReferenceDrawer } from './ChemReferenceDrawer'
import { LeafQuizModal } from './LeafQuizModal'

export function Hud() {
  const { pack, state, view, facts, api } = useLab()
  const [quizOpen, setQuizOpen] = useState(false)
  const [refOpen, setRefOpen] = useState(false)
  const stateRef = useRef(state)
  const apiRef = useRef(api)
  stateRef.current = state
  apiRef.current = api

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'Escape') return
      if (refOpen) {
        setRefOpen(false)
        return
      }
      if (quizOpen) {
        setQuizOpen(false)
        return
      }
      if (stateRef.current.panelFactId) apiRef.current.closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [quizOpen, refOpen])

  const fact = state.panelFactId ? facts[state.panelFactId] : undefined

  const packMeta = pack as typeof pack & {
    is3D?: boolean
    launchLabel?: string
    synthesisLegend?: { color: string; text: string }[]
  }
  const is3D =
    Boolean(packMeta.is3D) ||
    pack.id === 'photosynthesis' ||
    pack.id === 'bio-dna-3d' ||
    pack.id === 'bio-division-3d' ||
    pack.id.includes('cell')

  const hasLaunchStep =
    Boolean(packMeta.launchLabel) ||
    pack.id === 'photosynthesis' ||
    pack.id === 'bio-dna-3d'

  const launchText =
    packMeta.launchLabel ??
    (pack.id === 'bio-dna-3d' ? 'Запустить транскрипцию (иРНК)' : 'Запустить фотосинтез')

  const canTakeQuiz = hasLaunchStep
    ? state.synthesis
    : view.steps > 0 && view.step >= view.steps
    return (
      <div className="hud">
        <section className="mission-card" aria-label="Текущая миссия" style={{ pointerEvents: 'auto' }}>
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
  
          {state.synthesis && packMeta.synthesisLegend ? (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', display: 'grid', gap: '4px' }}>
              {packMeta.synthesisLegend.map((item) => (
                <div key={item.text}>
                  <span style={{ color: item.color }}>●</span> {item.text}
                </div>
              ))}
            </div>
          ) : state.synthesis && pack.id === 'photosynthesis' ? (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', display: 'grid', gap: '4px' }}>
              <div><span style={{ color: '#60a5fa' }}>●</span> H₂O — вода по ксилеме</div>
              <div><span style={{ color: '#ffffff' }}>●</span> CO₂ — газ через устьице</div>
              <div><span style={{ color: '#fb923c' }}>●</span> Глюкоза — отток по флоэме</div>
              <div><span style={{ color: '#dff56a' }}>●</span> O₂ — выход кислорода</div>
            </div>
          ) : state.synthesis && pack.id === 'bio-dna-3d' ? (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)', display: 'grid', gap: '4px' }}>
              <div><span style={{ color: '#94a3b8' }}>●</span> Разрыв водородных связей ДНК</div>
              <div><span style={{ color: '#fb7185' }}>●</span> Сборка одноцепочечной нити иРНК</div>
            </div>
          ) : is3D ? (
            <p className="hint">Мышь — вращать, колёсико — уменьшить и увеличить</p>
          ) : null}
        </section>
  
        {pack.subject === 'chemistry' ? (
          <button
            type="button"
            onClick={() => setRefOpen(true)}
            style={{ pointerEvents: 'auto' }}
            className="fixed right-[140px] top-3 z-40 inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-sky-300 shadow-lg backdrop-blur-md transition hover:border-sky-400 hover:bg-slate-800 sm:right-[156px] sm:top-[18px] sm:text-sm"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Справочник</span>
          </button>
        ) : null}
  
        {is3D ? (
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
  
        {hasLaunchStep && view.done && !state.synthesis ? (
          <button type="button" className="launch" onClick={() => api.launch()}>
            {launchText}
          </button>
        ) : null}
  
        {canTakeQuiz ? (
          <button type="button" className="launch" onClick={() => setQuizOpen(true)}>
            Пройти тест по теме (A/B/C/D)
          </button>
        ) : null}
  
        {quizOpen ? <LeafQuizModal onClose={() => setQuizOpen(false)} /> : null}
        {refOpen ? <ChemReferenceDrawer onClose={() => setRefOpen(false)} /> : null}
      </div>
    )
  }
  