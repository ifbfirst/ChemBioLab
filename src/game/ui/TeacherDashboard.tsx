import { useEffect, useState } from 'react'
import { fetchMyStudents, getOrCreateTeacherCode } from '../../platform/classroom'
import { labPacks } from '../../platform/registry'
import type { CatalogItem } from '../../platform/catalog'

interface StudentRecord {
  uid: string
  email: string
  displayName: string
  lastLoginAt?: number
  progress?: Record<string, { steps?: string[]; quizPassed?: boolean }>
}

export function TeacherDashboard({
  catalog,
  onClose,
}: {
  catalog: Record<string, CatalogItem>
  onClose: () => void
}) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [code, list] = await Promise.all([getOrCreateTeacherCode(), fetchMyStudents()])
      setTeacherCode(code)
      list.sort((a, b) => (b.lastLoginAt ?? 0) - (a.lastLoginAt ?? 0))
      setStudents(list)
    } catch (err) {
      console.error('Ошибка загрузки журнала:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const packs = Object.values(labPacks).sort(
    (a, b) => (catalog[a.id]?.order ?? 99) - (catalog[b.id]?.order ?? 99),
  )

  const copyCode = () => {
    navigator.clipboard.writeText(teacherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #112c20 0%, #06100b 100%)',
        padding: '36px 24px',
      }}
    >
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            paddingBottom: '22px',
            borderBottom: '1px solid var(--line)',
            marginBottom: '24px',
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: '4px' }}>
              Мой класс
            </p>
            <h1 style={{ fontSize: '30px', margin: 0 }}>
              Мои ученики ({students.length})
            </h1>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {teacherCode && (
              <button
                type="button"
                onClick={copyCode}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--accent)',
                  background: 'rgba(223, 245, 106, 0.12)',
                  color: 'var(--accent)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {copied ? '✓ Скопировано!' : `Код для учеников: ${teacherCode} 📋`}
              </button>
            )}
            <button type="button" className="ghost" onClick={loadData}>
              ↻ Обновить
            </button>
            <button type="button" className="primary" onClick={onClose}>
              ← К лабораториям
            </button>
          </div>
        </header>

        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>
            Загрузка списка ваших учеников...
          </p>
        ) : students.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              borderRadius: '20px',
              border: '1px dashed var(--line)',
              color: 'var(--muted)',
            }}
          >
            <p style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text)' }}>
              В вашем классе пока нет учеников
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Отправьте ученикам код <strong style={{ color: 'var(--accent)' }}>{teacherCode}</strong> — они смогут ввести его в шапке сайта после входа через Google.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              borderRadius: '18px',
              border: '1px solid var(--line)',
              background: 'rgba(10, 26, 18, 0.8)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--muted)' }}>Ученик</th>
                  <th style={{ padding: '14px 12px', color: 'var(--muted)' }}>Сдано тем</th>
                  {packs.map((p) => (
                    <th
                      key={p.id}
                      style={{ padding: '14px 10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}
                    >
                      {catalog[p.id]?.icon ?? '🔬'} {catalog[p.id]?.title ?? p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const passedCount = packs.filter((p) => {
                    const entry = st.progress?.[p.storageKey]
                    const total = catalog[p.id]?.totalSteps ?? 1
                    return (entry?.steps?.length ?? 0) >= total && Boolean(entry?.quizPassed)
                  }).length

                  return (
                    <tr
                      key={st.uid}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{st.displayName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{st.email}</div>
                      </td>

                      <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--accent)' }}>
                        {passedCount} / {packs.length}
                      </td>

                      {packs.map((p) => {
                        const entry = st.progress?.[p.storageKey]
                        const stepsDone = entry?.steps?.length ?? 0
                        const total = catalog[p.id]?.totalSteps ?? 1
                        const quizPassed = Boolean(entry?.quizPassed)
                        const fullDone = stepsDone >= total && quizPassed

                        return (
                          <td key={p.id} style={{ padding: '14px 10px', whiteSpace: 'nowrap' }}>
                            {fullDone ? (
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background: 'rgba(223, 245, 106, 0.18)',
                                  color: 'var(--accent)',
                                  fontWeight: 700,
                                }}
                              >
                                ✓ Сдано
                              </span>
                            ) : stepsDone > 0 ? (
                              <span style={{ color: '#fde047', fontWeight: 600 }}>
                                {stepsDone}/{total} {quizPassed ? '• тест ✓' : ''}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
