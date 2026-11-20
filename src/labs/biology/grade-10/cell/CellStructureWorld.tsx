import { useState } from 'react'
import { useLab } from '../../../../game/state'

type CellType = 'plant' | 'animal' | 'bacteria'

export function CellStructureWorld() {
  const { state, api } = useLab()
  const [cellType, setCellType] = useState<CellType>('plant')
  const [hovered, setHovered] = useState<string | null>(null)

  const isDone = (id: string) => state.studied.includes(id)

  const LABELS: Record<string, string> = {
    'cell-wall': 'Клеточная стенка (целлюлоза / муреин)',
    nucleus: 'Ядро с ядрышком и хроматином',
    vacuole: 'Крупная центральная вакуоль с клеточным соком',
    chloroplast: 'Хлоропласт (фотосинтез)',
    mitochondria: 'Митохондрия с кристами (синтез АТФ)',
    ribosome: 'Рибосомы (синтез белка)',
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
        gap: '18px',
        padding: '24px',
      }}
    >
      {/* Переключатель типа клетки */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          background: 'var(--glass)',
          marginTop: '36px',
        }}
      >
        <button
          type="button"
          className={cellType === 'plant' ? 'primary' : 'ghost'}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          onClick={() => setCellType('plant')}
        >
          🌱 Растительная
        </button>
        <button
          type="button"
          className={cellType === 'animal' ? 'primary' : 'ghost'}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          onClick={() => setCellType('animal')}
        >
          🐾 Животная
        </button>
        <button
          type="button"
          className={cellType === 'bacteria' ? 'primary' : 'ghost'}
          style={{ padding: '8px 16px', fontSize: '14px' }}
          onClick={() => setCellType('bacteria')}
        >
          🦠 Бактериальная
        </button>
      </div>

      {/* Подсказка при наведении на любой органоид */}
      <div
        style={{
          height: '28px',
          fontSize: '15px',
          fontWeight: 600,
          color: hovered ? 'var(--accent)' : 'var(--muted)',
        }}
      >
        {hovered ? `🔍 ${LABELS[hovered]} — нажми, чтобы изучить` : 'Наведи курсор и нажми на любую часть клетки'}
      </div>

      {/* Векторная SVG-иллюстрация клетки */}
      <svg
        viewBox="0 0 520 340"
        style={{
          width: 'min(540px, 92vw)',
          height: 'auto',
          filter: 'drop-shadow(0 20px 45px rgba(0, 0, 0, 0.5))',
        }}
      >
        {/* 1. ОБОЛОЧКА КЛЕТКИ */}
        {cellType === 'plant' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('cell-wall')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('cell-wall', 'cell-wall')}
          >
            {/* Жёсткая целлюлозная стенка */}
            <rect
              x="40"
              y="30"
              width="440"
              height="280"
              rx="42"
              fill="#173d2c"
              stroke={hovered === 'cell-wall' || isDone('cell-wall') ? '#dff56a' : '#84cc16'}
              strokeWidth="12"
            />
            {/* Внутренняя плазматическая мембрана */}
            <rect x="52" y="42" width="416" height="256" rx="32" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="6 4" />
          </g>
        )}

        {cellType === 'animal' && (
          <ellipse
            cx="260"
            cy="170"
            rx="195"
            ry="140"
            fill="#281b2e"
            stroke="#f472b6"
            strokeWidth="4"
            strokeDasharray="8 4"
          />
        )}

        {cellType === 'bacteria' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('cell-wall')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('cell-wall', 'cell-wall')}
          >
            {/* Капсула и муреиновая стенка бактерии */}
            <rect
              x="50"
              y="85"
              width="420"
              height="170"
              rx="85"
              fill="#132e3d"
              stroke={hovered === 'cell-wall' || isDone('cell-wall') ? '#dff56a' : '#38bdf8'}
              strokeWidth="10"
            />
            {/* Жгутик бактерии */}
            <path d="M 470 170 Q 495 145, 515 170" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* 2. ЦЕНТРАЛЬНАЯ ВАКУОЛЬ (только у растений) */}
        {cellType === 'plant' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('vacuole')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('vacuole', 'vacuole')}
          >
            <path
              d="M 240 90 C 310 75, 420 95, 425 175 C 430 245, 330 265, 245 250 C 210 242, 205 105, 240 90 Z"
              fill="rgba(56, 189, 248, 0.28)"
              stroke={hovered === 'vacuole' || isDone('vacuole') ? '#fff' : '#38bdf8'}
              strokeWidth="3"
            />
            <text x="320" y="175" textAnchor="middle" fill="#bae6fd" fontSize="14" fontWeight="600">
              Вакуоль
            </text>
          </g>
        )}

        {/* 3. ЯДРО С ЯДРЫШКОМ (растения и животные) */}
        {cellType !== 'bacteria' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('nucleus')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('nucleus', 'nucleus')}
          >
            <circle
              cx={cellType === 'plant' ? 140 : 210}
              cy={cellType === 'plant' ? 145 : 155}
              r="46"
              fill="#6b21a8"
              stroke={hovered === 'nucleus' || isDone('nucleus') ? '#fff' : '#d8b4fe'}
              strokeWidth="3"
            />
            {/* Ядрышко внутри */}
            <circle cx={cellType === 'plant' ? 148 : 218} cy={cellType === 'plant' ? 140 : 150} r="15" fill="#c084fc" />
            <text
              x={cellType === 'plant' ? 140 : 210}
              y={cellType === 'plant' ? 206 : 216}
              textAnchor="middle"
              fill="#e9d5ff"
              fontSize="13"
              fontWeight="600"
            >
              Ядро
            </text>
          </g>
        )}

        {/* Кольцевая ДНК бактерии (нуклеоид) */}
        {cellType === 'bacteria' && (
          <g>
            <path
              d="M 180 165 C 195 135, 245 140, 255 168 C 265 195, 210 205, 195 180 C 185 162, 225 150, 235 172"
              fill="none"
              stroke="#c084fc"
              strokeWidth="3"
            />
            <text x="220" y="215" textAnchor="middle" fill="#e9d5ff" fontSize="12">
              Нуклеоид (ДНК без ядра)
            </text>
          </g>
        )}

        {/* 4. ХЛОРОПЛАСТЫ (только у растений, с гранами внутри) */}
        {cellType === 'plant' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('chloroplast')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('chloroplast', 'chloroplast')}
          >
            <ellipse
              cx="155"
              cy="72"
              rx="34"
              ry="16"
              fill="#15803d"
              stroke={hovered === 'chloroplast' || isDone('chloroplast') ? '#fff' : '#4ade80'}
              strokeWidth="2.5"
            />
            {/* Стопки тилакоидов (граны) */}
            <line x1="140" y1="68" x2="140" y2="76" stroke="#86efac" strokeWidth="4" />
            <line x1="155" y1="66" x2="155" y2="78" stroke="#86efac" strokeWidth="4" />
            <line x1="170" y1="68" x2="170" y2="76" stroke="#86efac" strokeWidth="4" />
          </g>
        )}

        {/* 5. МИТОХОНДРИЯ (с волнистой внутренней мембраной — кристами) */}
        {cellType !== 'bacteria' && (
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('mitochondria')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => api.inspect('mitochondria', 'mitochondria')}
          >
            <ellipse
              cx={cellType === 'plant' ? 145 : 335}
              cy={cellType === 'plant' ? 255 : 185}
              rx="36"
              ry="17"
              fill="#c2410c"
              stroke={hovered === 'mitochondria' || isDone('mitochondria') ? '#fff' : '#fdba74'}
              strokeWidth="2.5"
            />
            {/* Кристы (складки внутри митохондрии) */}
            <path
              d={
                cellType === 'plant'
                  ? 'M 120 255 L 130 247 L 138 263 L 146 247 L 154 263 L 164 255'
                  : 'M 310 185 L 320 177 L 328 193 L 336 177 L 344 193 L 354 185'
              }
              fill="none"
              stroke="#fed7aa"
              strokeWidth="2"
            />
          </g>
        )}

        {/* 6. РИБОСОМЫ (мелкие жёлтые гранулы, есть во всех 3 типах клеток) */}
        <g
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHovered('ribosome')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => api.inspect('ribosome', 'ribosome')}
        >
          {/* Невидимая зона для удобного клика мышкой */}
          <circle cx={cellType === 'bacteria' ? 350 : 285} cy={cellType === 'bacteria' ? 155 : 70} r="28" fill="transparent" />
          <circle cx={cellType === 'bacteria' ? 340 : 275} cy={cellType === 'bacteria' ? 148 : 66} r="5" fill="#facc15" />
          <circle cx={cellType === 'bacteria' ? 358 : 292} cy={cellType === 'bacteria' ? 152 : 72} r="5" fill="#facc15" />
          <circle cx={cellType === 'bacteria' ? 348 : 282} cy={cellType === 'bacteria' ? 166 : 80} r="5" fill="#facc15" />
          <text
            x={cellType === 'bacteria' ? 350 : 335}
            y={cellType === 'bacteria' ? 192 : 74}
            textAnchor="middle"
            fill="#fef08a"
            fontSize="12"
          >
            Рибосомы
          </text>
        </g>
      </svg>
    </div>
  )
}
