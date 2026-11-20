/** Заготовка сохранения прогресса. Ключ свой у каждой миссии, чтобы лаборатории не затирали друг друга. */

export function loadProgress(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function saveProgress(key: string, ids: readonly string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // Приватный режим и переполненное хранилище не должны останавливать игру.
  }
}
