import { useState } from 'react'
import { useLab } from '../../../../game/state'

interface ReactionTube {
  id: string
  solutionName: string
  ionTarget: string
  correctReagent: string
  liquidColor: string
  precipitateColor?: string
  hasGas?: boolean
  resultLabel: string
}

const REAGENTS = [
  { id: 'naoh', label: 'NaOH (щёлочь)' },
  { id: 'agno3', label: 'AgNO₃ (нитрат серебра)' },
  { id: 'hcl', label: 'HCl (соляная кислота)' },
] as const

const TUBES: ReactionTube[] = [
  {
    id: 'cu-precipitate',
    solutionName: 'Пробирка №1: CuSO₄',
    ionTarget: 'Катион меди Cu²⁺',
    correctReagent: 'naoh',
    liquidColor: 'rgba(56, 189, 248, 0.28)',
    precipitateColor: '#0284c7', // Голубой студенистый осадок Cu(OH)2
    resultLabel: '↓ Голубой студенистый осадок Cu(OH)₂',
  },
  {
    id: 'fe-precipitate',
    solutionName: 'Пробирка №2: FeCl₃',
    ionTarget: 'Катион железа Fe³⁺',
    correctReagent: 'naoh',
    liquidColor: 'rgba(250, 204, 21, 0.25)',
    precipitateColor: '#9a3412', // Бурый осадок Fe(OH)3
    resultLabel: '↓ Бурый осадок Fe(OH)₃',
  },
  {
    id: 'cl-precipitate',
    solutionName: 'Пробирка №3: NaCl',
    ionTarget: 'Хлорид-ион Cl⁻',
    correctReagent: 'agno3',
    liquidColor: 'rgba(255, 255, 255, 0.14)',
    precipitateColor: '#f8fafc', // Белый творожистый осадок AgCl
    resultLabel: '↓ Белый творожистый осадок AgCl',
  },
  {
    id: 'co3-gas',
    solutionName: 'Пробирка №4: Na₂CO₃',
    ionTarget: 'Карбонат-ион CO₃²⁻',
    correctReagent: 'hcl',
    liquidColor: 'rgba(255, 255, 255, 0.14)',
    hasGas: true, // Выделение углекислого газа CO2
    resultLabel: '↑ Выделение газа без запаха (CO₂)',
  },
]

export function QualitativeWorld() {
  const { state, api } = useLab()
  const [selectedReagent, setSelectedReagent] = useState<string>('naoh')
  const [wrongTubeId, setWrongTubeId] = useState<string | null>(null)

  const handlePour = (tube: ReactionTube) => {
    if (selectedReagent === tube.correctReagent) {
      setWrongTubeId(null)
      api.inspect(tube.id, tube.id)
    } else {
      setWrongTubeId(tube.id)
      setTimeout(() => setWrongTubeId(null), 1600)
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
        gap: '32px',
        padding: '24px',
      }}
    >
      {/* Полка с реактивами */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          padding: '12px 18px',
          borderRadius: '18px',
          border: '1px solid var(--line)',
          background: 'var(--glass)',
          marginTop: '40px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--muted)', marginRight: '6px', fontWeight: 600 }}>
          1. Выбери реактив:
        </span>
        {REAGENTS.map((r) => {
          const active = selectedReagent === r.id
          return (
            <button
              key={r.id}
              type="button"
              className={active ? 'primary' : 'ghost'}
              style={{ padding: '8px 14px', fontSize: '14px' }}
              onClick={() => setSelectedReagent(r.id)}
            >
              🧪 {r.label}
            </button>
          )
        })}
      </div>

      {/* Штатив с 4 пробирками */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '36px' }}>
        {TUBES.map((tube) => {
          const done = state.studied.includes(tube.id)
          const isWrong = wrongTubeId === tube.id

          return (
            <div key={tube.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '165px' }}>
              <button
                type="button"
                className={done ? 'ghost' : 'primary'}
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  borderColor: isWrong ? '#f87171' : undefined,
                  color: isWrong ? '#fca5a5' : undefined,
                }}
                onClick={() => handlePour(tube)}
              >
                {isWrong ? 'Нет признаков реакции!' : done ? '✓ Реакция проведена' : '2. Добавить в пробирку'}
              </button>

              {/* Пробирка */}
              <div
                onClick={() => handlePour(tube)}
                style={{
                  width: '74px',
                  height: '210px',
                  border: `3px solid ${isWrong ? '#f87171' : 'rgba(198, 255, 214, 0.45)'}`,
                  borderTop: 'none',
                  borderRadius: '0 0 37px 37px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.04)',
                  transition: 'border-color 0.3s',
                }}
              >
                {/* Основной раствор */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '66%',
                    backgroundColor: tube.liquidColor,
                  }}
                />

                {/* Слой осадка на дне */}
                {done && tube.precipitateColor && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '26%',
                      backgroundColor: tube.precipitateColor,
                      borderRadius: '0 0 34px 34px',
                      boxShadow: '0 -4px 12px rgba(0,0,0,0.25)',
                    }}
                  />
                )}

                {/* Пузырьки газа при реакции с карбонатом */}
                {done && tube.hasGas && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '35% 16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#e0f2fe',
                      letterSpacing: '4px',
                    }}
                  >
                    <span>○ ◦ ○</span>
                    <span>◦ ○ ◦</span>
                    <span>○ ◦ ○</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{tube.solutionName}</div>
                <div style={{ fontSize: '12px', color: done ? 'var(--accent)' : 'var(--muted)', marginTop: '4px', lineHeight: 1.35 }}>
                  {done ? tube.resultLabel : `Определить: ${tube.ionTarget}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
