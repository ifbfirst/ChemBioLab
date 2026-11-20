import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { joinTeacherByCode } from '../../platform/classroom'
import { auth, db, googleProvider } from '../../platform/firebase'
import { pullCloudProgress } from '../../platform/progress'

export function AuthBar({
  onSync,
  onOpenTeacher,
}: {
  onSync: () => void
  onOpenTeacher?: () => void
}) {
  const [user, setUser] = useState<User | null>(null)
  const [teacherName, setTeacherName] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, async (current) => {
      setUser(current)
      if (current) {
        const userRef = doc(db, 'users', current.uid)
        await setDoc(
          userRef,
          {
            email: current.email ?? '',
            displayName: current.displayName ?? '',
            lastLoginAt: Date.now(),
          },
          { merge: true },
        )
        const snap = await getDoc(userRef)
        setTeacherName((snap.data()?.teacherName as string) ?? null)
        await pullCloudProgress()
        onSync()
      } else {
        setTeacherName(null)
      }
    })
  }, [onSync])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Ошибка входа:', err)
    }
  }

  const handleJoinClass = async () => {
    setMenuOpen(false)
    const code = prompt('Введите код класса от преподавателя (например, LAB-4821):')
    if (!code) return
    try {
      const name = await joinTeacherByCode(code)
      setTeacherName(name)
      alert(`Вы прикреплены к преподавателю: ${name}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка привязки')
    }
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        style={{
          padding: '10px 18px',
          borderRadius: '14px',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1',
          background: '#ffffff',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#58cc02' }} />
        Войти через Google
      </button>
    )
  }

  const shortName = user.displayName?.split(' ') || user.email?.split('@') || 'Профиль'

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 14px',
          borderRadius: '14px',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1',
          background: '#ffffff',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 800,
        }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            style={{ width: '26px', height: '26px', borderRadius: '50%' }}
          />
        ) : (
          <span
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#58cc02',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#ffffff',
              fontWeight: 900,
            }}
          >
            {typeof shortName === 'string' ? shortName.toUpperCase() : ''}
          </span>
        )}
        <span>{shortName}</span>
        <span style={{ color: '#94a3b8', fontSize: '10px' }}>▼</span>
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '240px',
            padding: '10px',
            borderRadius: '18px',
            border: '2px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.14)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ padding: '6px 10px', borderBottom: '2px solid #f1f5f9', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
              {user.displayName || 'Пользователь'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
            {teacherName && (
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#58cc02', marginTop: '4px' }}>
                Учитель: {teacherName}
              </div>
            )}
          </div>

          {onOpenTeacher && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onOpenTeacher()
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '13px',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              🎓 Журнал моего класса
            </button>
          )}

          {!teacherName && (
            <button
              type="button"
              onClick={handleJoinClass}
              style={{
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: '#1e293b',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              🔑 Ввести код учителя
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              signOut(auth)
            }}
            style={{
              padding: '9px 12px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'left',
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  )
}
