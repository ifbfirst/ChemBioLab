import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../../platform/firebase'
import { pullCloudProgress } from '../../platform/progress'
import { seedQuizzesToFirestore } from '../../platform/quizzes'

export function AuthBar({ onSync }: { onSync: () => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (current) => {
      setUser(current)
      setLoading(false)
      if (current) {
        await pullCloudProgress()
        onSync()
      }
    })
  }, [onSync])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Ошибка входа:', err)
      alert('Не удалось войти через Google. Проверьте настройки Authentication в Firebase.')
    }
  }

  if (loading) return null

  if (!user) {
    return (
      <button
        type="button"
        className="ghost"
        style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600 }}
        onClick={handleLogin}
      >
        Войти (Google)
      </button>
    )
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '5px 12px',
        borderRadius: '12px',
        border: '1px solid var(--line)',
        background: 'rgba(255, 255, 255, 0.04)',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
        👤 {user.displayName?.split(' ') || user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut(auth)}
        style={{
          padding: '3px 8px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          background: 'transparent',
          color: 'var(--muted)',
          fontSize: '12px',
        }}
      >
        Выйти
      </button>
      <button
        type="button"
        onClick={async () => {
          await seedQuizzesToFirestore()
          alert('Все 7 тестов успешно загружены в коллекцию quizzes в Firestore!')
        }}
        style={{
          padding: '3px 8px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          background: 'transparent',
          color: 'var(--accent)',
          fontSize: '11px',
        }}
      >
        ↑ Залить тесты в БД
      </button>

    </div>
  )
}
