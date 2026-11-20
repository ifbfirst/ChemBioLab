import { useEffect, useState } from 'react'
import { useLab } from '../../game/state'

export type DivisionMode = 'mitosis' | 'meiosis1'
export type DivisionPhase = 'prophase' | 'metaphase' | 'anaphase' | 'telophase'

const PHASES: {
  id: DivisionPhase
  label: string
  mitosisNC: string
  meiosisNC: string
  hint: string
}[] = [
  {
    id: 'prophase',
    label: '1. Профаза',
    mitosisNC: '2n4c',
    meiosisNC: '2n4c',
    hint: 'ДНК уже удвоилась в интерфазе (4c), но клетка ещё одна (2n).',
  },
  {
    id: 'metaphase',
    label: '2. Метафаза',
    mitosisNC: '2n4c',
    meiosisNC: '2n4c',
    hint: 'Хромосомы на экваторе: в митозе в 1 ряд, в мейозе I попарно (биваленты).',
  },
  {
    id: 'anaphase',
    label: '3. Анафаза',
    mitosisNC: '4n4c',
    meiosisNC: '2n4c',
    hint: 'В митозе расходятся хроматиды (число хромосом удваивается до 4n!), в мейозе I — целые хромосомы (остаётся 2n).',
  },
  {
    id: 'telophase',
    label: '4. Телофаза',
    mitosisNC: '2n2c',
    meiosisNC: '1n2c',
    hint: 'В митозе образуются диплоидные ядра (2n2c), в мейозе I — гаплоидные (1n2c).',
  },
]

const OPTIONS = ['2n2c', '2n4c', '4n4c', '1n2c', '1n1c']

export function DivisionControls({
  mode,
  setMode,
  phase,
  setPhase,
}: {
  mode: DivisionMode
  setMode: (m: DivisionMode) => void
  phase: DivisionPhase
  setPhase: (p: DivisionPhase) => void
}) {
  const { state, api } = useLab()
  const [guess, setGuess] = useState('')
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const order: DivisionPhase[] = ['prophase', 'metaphase', 'anaphase', 'telophase']
    let idx = 0
    setPhase('prophase')
    setGuess('')

    const timer = setInterval(() => {
      idx += 1
      if (idx < order.length) {
        setPhase(order[idx])
        setGuess('')
      } else {
        setPlaying(false)
        clearInterval(timer)
      }
    }, 2000)

    return () => clearInterval(timer)
  }, [playing, setPhase])

  const current = PHASES.find((p) => p.id === phase)!
  const expected = mode === 'mitosis' ? current.mitosisNC : current.meiosisNC
  const stepId = `${mode}-${phase}`
  const solved = state.studied.includes(stepId)
  const allEightDone = state.studied.length >= 8
  if (allEightDone) return null


  const check = () => {
    if (guess === expected) {
      setError(false)
      api.inspect(stepId, phase)
    } else {
      setError(true)
      setTimeout(() => setError(false), 1600)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: 'min(760px, calc(100vw - 32px))',
        padding: '14px 18px',
        borderRadius: '20px',
        border: '1px solid var(--line)',
        background: 'var(--glass)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Переключатель Митоз / Мейоз I + кнопки фаз */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
      <button
          type="button"
          className="primary"
          style={{ padding: '6px 12px', fontSize: '13px', background: playing ? '#38bdf8' : undefined }}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? '⏸ Пауза' : '▶ Смотреть процесс'}
        </button>

        <button
          type="button"
          className={mode === 'mitosis' ? 'primary' : 'ghost'}
          style={{ padding: '6px 12px', fontSize: '13px' }}
          onClick={() => {
            setMode('mitosis')
            setGuess('')
          }}
        >
          Митоз
        </button>
        <button
          type="button"
          className={mode === 'meiosis1' ? 'primary' : 'ghost'}
          style={{ padding: '6px 12px', fontSize: '13px' }}
          onClick={() => {
            setMode('meiosis1')
            setGuess('')
          }}
        >
          Мейоз I (с кроссинговером)
        </button>

        <span style={{ color: 'var(--line)', alignSelf: 'center' }}>|</span>

        {PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={phase === p.id ? 'primary' : 'ghost'}
            style={{ padding: '6px 11px', fontSize: '13px' }}
            onClick={() => {
              setPhase(p.id)
              setGuess('')
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Практическое задание на определение набора n и c */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Определи набор хромосом (n) и ДНК (c) для этой фазы:
        </span>
        <select
          value={solved ? expected : guess}
          disabled={solved}
          onChange={(e) => setGuess(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            border: error ? '1px solid #f87171' : '1px solid var(--line)',
            background: '#0c2419',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          <option value="">— Выбери n / c —</option>
          {OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {!solved ? (
          <button type="button" className="primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={check}>
            Проверить набор
          </button>
        ) : (
          <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>✓ Верно ({expected})</span>
        )}
      </div>

      {error && (
        <div style={{ fontSize: '12px', color: '#fca5a5' }}>
          Неверно! Подсказка: {current.hint}
        </div>
      )}
    </div>
  )
}
