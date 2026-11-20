import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export function loadProgress(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function saveProgress(storageKey: string, studied: readonly string[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(studied))
    syncLabToCloud(storageKey, { steps: [...studied] })
  } catch {
    // ignore storage errors
  }
}

export function saveQuizPassed(storageKey: string): void {
  try {
    localStorage.setItem(`${storageKey}:quiz`, 'passed')
    syncLabToCloud(storageKey, { quizPassed: true })
  } catch {
    // ignore storage errors
  }
}

export function isQuizPassed(storageKey: string): boolean {
  try {
    return localStorage.getItem(`${storageKey}:quiz`) === 'passed'
  } catch {
    return false
  }
}

export function clearProgress(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}:quiz`)
    syncLabToCloud(storageKey, { steps: [], quizPassed: false })
  } catch {
    // ignore storage errors
  }
}

/** Фоновая запись прогресса по конкретной теме в документ пользователя Firestore */
async function syncLabToCloud(
  storageKey: string,
  patch: { steps?: string[]; quizPassed?: boolean },
): Promise<void> {
  const user = auth.currentUser
  if (!user) return

  try {
    const userRef = doc(db, 'users', user.uid)
    await setDoc(
      userRef,
      {
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        progress: {
          [storageKey]: {
            ...patch,
            updatedAt: Date.now(),
          },
        },
      },
      { merge: true },
    )
  } catch (err) {
    console.error('Ошибка синхронизации с Firestore:', err)
  }
}

/** Загрузка облачного прогресса при входе в аккаунт */
export async function pullCloudProgress(): Promise<void> {
  const user = auth.currentUser
  if (!user) return

  try {
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) return

    const data = snap.data()
    const cloudProgress = data?.progress as
      | Record<string, { steps?: string[]; quizPassed?: boolean }>
      | undefined
    if (!cloudProgress) return

    Object.entries(cloudProgress).forEach(([key, entry]) => {
      if (Array.isArray(entry.steps)) {
        const localSteps = loadProgress(key)
        const merged = Array.from(new Set([...localSteps, ...entry.steps]))
        localStorage.setItem(key, JSON.stringify(merged))
      }
      if (entry.quizPassed) {
        localStorage.setItem(`${key}:quiz`, 'passed')
      }
    })
  } catch (err) {
    console.error('Ошибка загрузки из Firestore:', err)
  }
}
