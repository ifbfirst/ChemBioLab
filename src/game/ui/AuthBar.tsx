import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ChevronDown, GraduationCap, KeyRound, LogIn, LogOut } from 'lucide-react'
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-100 transition hover:border-emerald-400/60 hover:bg-slate-800 sm:text-sm"
      >
        <LogIn className="h-4 w-4 text-emerald-400" />
        <span>Войти</span>
      </button>
    )
  }

  const rawName = user.displayName?.trim() || user.email?.split('@')[0] || 'Профиль'
  const firstName = rawName.split(' ')[0]

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-bold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 sm:px-3 sm:text-sm"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full ring-1 ring-slate-700"
          />
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 text-xs font-extrabold text-slate-950">
            {firstName[0]?.toUpperCase() ?? 'U'}
          </span>
        )}
        <span className="max-w-[90px] truncate sm:max-w-[140px]">{firstName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
            menuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-[min(256px,calc(100vw-24px))] flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl">
          <div className="mb-1 border-b border-slate-800/80 px-3 py-2.5">
            <div className="truncate text-xs font-extrabold text-white">
              {user.displayName || 'Пользователь'}
            </div>
            <div className="truncate text-[11px] text-slate-400">{user.email}</div>
            {teacherName && (
              <div className="mt-1.5 inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
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
              className="flex items-center gap-2.5 rounded-xl bg-sky-500/10 px-3 py-2.5 text-left text-xs font-bold text-sky-400 transition hover:bg-sky-500/20"
            >
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>Журнал моего класса</span>
            </button>
          )}

          {!teacherName && (
            <button
              type="button"
              onClick={handleJoinClass}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Ввести код учителя</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              signOut(auth)
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      )}
    </div>
  )
}
