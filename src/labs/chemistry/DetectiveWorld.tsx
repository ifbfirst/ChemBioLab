import { useEffect, useMemo, useState } from 'react'
import { useLab } from '../../game/state'

type MysterySubstance = 'naoh' | 'hcl' | 'na2co3' | 'cuso4'
type TestReagent = 'phenolphthalein' | 'naoh_drop' | 'hcl_drop' | 'bacl2_drop'

const SUBSTANCES: { id: MysterySubstance; formula: string; name: string }[] = [
  { id: 'naoh', formula: 'NaOH', name: 'Гидроксид натрия (щёлочь)' },
  { id: 'hcl', formula: 'HCl', name: 'Соляная кислота' },
  { id: 'na2co3', formula: 'Na₂CO₃', name: 'Карбонат натрия' },
  { id: 'cuso4', formula: 'CuSO₄', name: 'Сульфат меди(II)' },
]

const REAGENTS: { id: TestReagent; label: string }[] = [
  { id: 'phenolphthalein', label: 'Фенолфталеин' },
  { id: 'naoh_drop', label: 'NaOH (щёлочь)' },
  { id: 'hcl_drop', label: 'HCl (кислота)' },
  { id: 'bacl2_drop', label: 'BaCl₂ (хлорид бария)' },
]

interface Observation {
  text: string
  liquidColor: string
  precipitateColor?: string
  hasGas?: boolean
}

function getReactionResult(sub: MysterySubstance, reagent: TestReagent): Observation {
  if (reagent === 'phenolphthalein') {
    if (sub === 'naoh' || sub === 'na2co3') {
      return {
        text: 'Малиновое окрашивание (щелочная среда)',
        liquidColor: '#ec4899',
      }
    }
    return {
      text: 'Окраска не изменилась',
      liquidColor: 'rgba(255, 255, 255, 0.16)',
    }
  }

  if (reagent === 'naoh_drop') {
    if (sub === 'cuso4') {
      return {
        text: '↓ Выпал голубой студенистый осадок Cu(OH)₂',
        liquidColor: 'rgba(56, 189, 248, 0.22)',
        precipitateColor: '#0284c7',
      }
    }
    return {
      text: 'Видимых признаков реакции нет',
      liquidColor: 'rgba(255, 255, 255, 0.16)',
    }
  }

  if (reagent === 'hcl_drop') {
    if (sub === 'na2co3') {
      return {
        text: '↑ Выделение газа без запаха (CO₂)',
        liquidColor: 'rgba(255, 255, 255, 0.16)',
        hasGas: true,
      }
    }
    return {
      text: 'Видимых признаков реакции нет',
      liquidColor: 'rgba(255, 255, 255, 0.16)',
    }
  }

  // BaCl2
  if (sub === 'cuso4' || sub === 'na2co3') {
    return {
      text: `↓ Выпал белый осадок (${sub === 'cuso4' ? 'BaSO₄' : 'BaCO₃'})`,
      liquidColor: 'rgba(255, 255, 255, 0.16)',
      precipitateColor: '#f8fafc',
    }
  }
  return {
    text: 'Осадок не выпадает',
    liquidColor: 'rgba(255, 255, 255, 0.16)',
  }
}

export function DetectiveWorld() {
  const { state, api } = useLab()
  const [activeReagent, setActiveReagent] = useState<TestReagent>('phenolphthalein')
  const [observations, setObservations] = useState<Record<number, Observation>>({})
  const [guesses, setGuesses] = useState<Record<number, MysterySubstance | ''>>({
    0: '',
    1: '',
    2: '',
    3: '',
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Перемешиваем вещества при каждом новом запуске
  const hiddenTubes = useMemo<MysterySubstance[]>(() => {
    const arr: MysterySubstance[] = ['naoh', 'hcl', 'na2co3', 'cuso4']
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resetPose])

  // Очищаем пробирки и ответы при нажатии «Начать заново»
  useEffect(() => {
    setObservations({})
    setGuesses({ 0: '', 1: '', 2: '', 3: '' })
    setErrorMsg(null)
  }, [state.resetPose])

  const handleTestTube = (index: number) => {
    const res = getReactionResult(hiddenTubes[index], activeReagent)
    setObservations((prev) => ({ ...prev, [index]: res }))
  }

  const handleCheckAnswers = () => {
    let correctCount = 0
    hiddenTubes.forEach((actual, idx) => {
      if (guesses[idx] === actual) {
        correctCount++
        api.inspect(`tube-${idx}`, actual)
      }
    })

    if (correctCount === 4) {
      setErrorMsg(null)
    } else {
      setErrorMsg(`Верно определено ${correctCount} из 4 пробирок. Продолжай исследование!`)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'radial-gradient(circle at center, #132d24 0%, #07140e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      {/* Полка с реактивами для проб */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          padding: '10px 16px',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          background: 'var(--glass)',
          marginTop: '48px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
          1. Выбери реактив для пробы:
        </span>
        {REAGENTS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={activeReagent === r.id ? 'primary' : 'ghost'}
            style={{ padding: '7px 12px', fontSize: '13px' }}
            onClick={() => setActiveReagent(r.id)}
          >
            🧪 {r.label}
          </button>
        ))}
      </div>

      {/* 4 одинаковые на вид неизвестные пробирки */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '28px' }}>
        {hiddenTubes.map((_, idx) => {
          const obs = observations[idx]
          const isSolved = state.studied.includes(`tube-${idx}`)

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                width: '185px',
                padding: '14px',
                borderRadius: '18px',
                border: isSolved ? '1px solid #4ade80' : '1px solid var(--line)',
                background: 'rgba(7, 22, 15, 0.6)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>
                Пробирка №{idx + 1}
              </div>

              <button
                type="button"
                className="ghost"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleTestTube(idx)}
              >
                Капнуть реактив
              </button>

              {/* Стеклянная пробирка */}
              <div
                onClick={() => handleTestTube(idx)}
                style={{
                  width: '64px',
                  height: '150px',
                  border: '2.5px solid rgba(198, 255, 214, 0.45)',
                  borderTop: 'none',
                  borderRadius: '0 0 32px 32px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '65%',
                    backgroundColor: obs ? obs.liquidColor : 'rgba(255, 255, 255, 0.16)',
                    transition: 'background-color 0.5s',
                  }}
                />
                {obs?.precipitateColor && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '25%',
                      backgroundColor: obs.precipitateColor,
                      borderRadius: '0 0 30px 30px',
                    }}
                  />
                )}
                {obs?.hasGas && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '35% 12px 10px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#fff',
                    }}
                  >
                    ○ ◦ ○<br />◦ ○ ◦
                  </div>
                )}
              </div>

              {/* Наблюдение */}
              <div
                style={{
                  minHeight: '34px',
                  fontSize: '12px',
                  textAlign: 'center',
                  color: obs ? '#e0f2fe' : 'var(--muted)',
                }}
              >
                {obs ? obs.text : 'Нажми на пробирку, чтобы провести пробу'}
              </div>

              {/* Выбор ответа учеником (заблокирован до первой пробы) */}
              <select
                value={guesses[idx]}
                disabled={isSolved || !obs}
                onChange={(e) =>
                  setGuesses((prev) => ({ ...prev, [idx]: e.target.value as MysterySubstance }))
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: '#0c2419',
                  color: !obs ? 'var(--muted)' : '#fff',
                  fontSize: '13px',
                  opacity: !obs ? 0.6 : 1,
                }}
              >
                <option value="">
                <option value="">
                  {!obs ? 'Сначала капни реактив ↑' : '🏷️ Этикетка: Что внутри?'}
                </option>

                </option>
                {SUBSTANCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.formula} ({s.name})
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {/* Кнопка проверки всех 4 пробирок */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {errorMsg && <div style={{ color: '#fca5a5', fontSize: '14px', fontWeight: 600 }}>{errorMsg}</div>}
        {state.studied.length < 4 && (
          <button type="button" className="primary" onClick={handleCheckAnswers}>
            Проверить все 4 этикетки
          </button>
        )}
      </div>
    </div>
  )
}
