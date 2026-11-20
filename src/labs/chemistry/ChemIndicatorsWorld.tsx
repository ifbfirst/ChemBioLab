import { useLab } from '../../game/state'

const TUBES = [
  {
    id: 'acid-litmus',
    label: 'Пробирка №1: HCl (кислота)',
    indicator: 'Капнуть лакмус',
    baseColor: 'rgba(255, 255, 255, 0.16)',
    reactedColor: '#ef4444',
    resultText: 'Красный (кислая среда)',
  },
  {
    id: 'alkali-phenol',
    label: 'Пробирка №2: NaOH (щёлочь)',
    indicator: 'Капнуть фенолфталеин',
    baseColor: 'rgba(255, 255, 255, 0.16)',
    reactedColor: '#ec4899',
    resultText: 'Малиновый (щелочная среда)',
  },
  {
    id: 'water-methyl',
    label: 'Пробирка №3: H₂O (вода)',
    indicator: 'Капнуть метилоранж',
    baseColor: 'rgba(186, 230, 253, 0.24)',
    reactedColor: '#f97316',
    resultText: 'Оранжевый (нейтральная среда)',
  },
] as const

export function ChemIndicatorsWorld() {
  const { state, api } = useLab()

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'radial-gradient(circle at center, #132d24 0%, #07140e 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '44px',
        padding: '24px',
      }}
    >
      {TUBES.map((tube) => {
        const done = state.studied.includes(tube.id)
        return (
          <div key={tube.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              className={done ? 'ghost' : 'primary'}
              onClick={() => api.inspect(tube.id, tube.id)}
            >
              🧪 {done ? 'Повторить опыт' : tube.indicator}
            </button>

            <div
              onClick={() => api.inspect(tube.id, tube.id)}
              style={{
                width: '76px',
                height: '220px',
                border: '3px solid rgba(198, 255, 214, 0.45)',
                borderTop: 'none',
                borderRadius: '0 0 38px 38px',
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
                  backgroundColor: done ? tube.reactedColor : tube.baseColor,
                  transition: 'background-color 0.7s ease',
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{tube.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                {done ? tube.resultText : 'Бесцветный раствор'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
