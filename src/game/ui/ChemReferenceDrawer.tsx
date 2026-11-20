import { useState } from 'react'

type Solubility = 'Р' | 'М' | 'Н' | '—'

const CATIONS = ['H⁺', 'Na⁺', 'K⁺', 'Ag⁺', 'Ca²⁺', 'Ba²⁺', 'Mg²⁺', 'Zn²⁺', 'Fe²⁺', 'Fe³⁺', 'Cu²⁺', 'Al³⁺']
const ANIONS = ['OH⁻', 'Cl⁻', 'Br⁻', 'I⁻', 'NO₃⁻', 'SO₄²⁻', 'CO₃²⁻', 'PO₄³⁻']

const TABLE: Record<string, Solubility[]> = {
  'OH⁻':  ['Р', 'Р', 'Р', '—', 'М', 'Р', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н'],
  'Cl⁻':  ['Р', 'Р', 'Р', 'Н', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р'],
  'Br⁻':  ['Р', 'Р', 'Р', 'Н', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р'],
  'I⁻':   ['Р', 'Р', 'Р', 'Н', 'Р', 'Р', 'Р', 'Р', 'Р', '—', '—', 'Р'],
  'NO₃⁻': ['Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р'],
  'SO₄²⁻':['Р', 'Р', 'Р', 'М', 'М', 'Н', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р'],
  'CO₃²⁻':['Р', 'Р', 'Р', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', '—', '—', '—'],
  'PO₄³⁻':['Р', 'Р', 'Р', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н'],
}

const METALS = ['Li', 'K', 'Ba', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', '(H₂)', 'Cu', 'Hg', 'Ag', 'Pt', 'Au']

export function ChemReferenceDrawer() {
  const [open, setOpen] = useState(false)

  const getCellStyle = (val: Solubility) => {
    if (val === 'Н') return { background: 'rgba(248, 113, 113, 0.25)', color: '#fca5a5', fontWeight: 700 }
    if (val === 'М') return { background: 'rgba(250, 204, 21, 0.2)', color: '#fde047' }
    if (val === '—') return { background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }
    return { background: 'rgba(74, 222, 128, 0.14)', color: '#86efac' }
  }

  return (
    <>
      <button
        type="button"
        className="pause"
        style={{ right: '130px', zIndex: 45, pointerEvents: 'auto' }}
        onClick={() => setOpen(true)}
      >
        📊 Таблица растворимости
      </button>

      {open && (
        <div className="modal" style={{ zIndex: 110 }} onClick={() => setOpen(false)}>
          <div
            className="sheet"
            style={{ maxWidth: '860px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Справочник • ЦТ / ЦЭ / 8–11 класс</p>
                <h2 style={{ fontSize: '22px', margin: '4px 0 0' }}>Таблица растворимости и ряд активности</h2>
              </div>
              <button type="button" className="ghost" style={{ padding: '6px 14px' }} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div className="sheet-copy">
              {/* Ряд активности металлов */}
              <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>
                  ЭЛЕКТРОХИМИЧЕСКИЙ РЯД НАПРЯЖЕНИЙ МЕТАЛЛОВ (убывание активности →)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {METALS.map((m) => (
                    <span
                      key={m}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        background: m === '(H₂)' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                        color: m === '(H₂)' ? 'var(--ink)' : 'var(--text)',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Таблица растворимости */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', border: '1px solid var(--line)', background: 'rgba(255,255,255,0.08)' }}>
                        Ионы
                      </th>
                      {CATIONS.map((c) => (
                        <th key={c} style={{ padding: '8px', border: '1px solid var(--line)', color: 'var(--accent)' }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ANIONS.map((anion) => (
                      <tr key={anion}>
                        <td style={{ padding: '8px', border: '1px solid var(--line)', fontWeight: 700, color: '#38bdf8' }}>
                          {anion}
                        </td>
                        {TABLE[anion].map((cell, idx) => (
                          <td
                            key={idx}
                            style={{
                              padding: '7px',
                              border: '1px solid var(--line)',
                              ...getCellStyle(cell),
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                <span><strong style={{ color: '#86efac' }}>Р</strong> — растворимо</span>
                <span><strong style={{ color: '#fde047' }}>М</strong> — малорастворимо</span>
                <span><strong style={{ color: '#fca5a5' }}>Н</strong> — нерастворимо (осадок ↓)</span>
                <span><strong style={{ color: '#94a3b8' }}>—</strong> — разлагается водой или не существует</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
