import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export interface CatalogItem {
  id: string
  order: number
  icon: string
  badge: string
  title: string
  desc: string
  totalSteps: number
  grades: string[]
  isExam?: boolean
  hidden?: boolean
}

let catalogCache: Record<string, CatalogItem> | null = null

export async function fetchCatalog(): Promise<Record<string, CatalogItem>> {
  if (catalogCache) return catalogCache

  try {
    const snap = await getDocs(collection(db, 'catalog'))
    const next: Record<string, CatalogItem> = {}
    snap.forEach((d) => {
      next[d.id] = { ...(d.data() as CatalogItem), id: d.id }
    })
    catalogCache = next
    return next
  } catch (err) {
    console.error('Ошибка загрузки каталога из Firestore:', err)
    return {}
  }
}
