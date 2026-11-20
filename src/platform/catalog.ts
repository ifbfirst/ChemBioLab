import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
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

export const DEFAULT_CATALOG: Record<string, CatalogItem> = {
  photosynthesis: {
    id: 'photosynthesis',
    order: 1,
    icon: '🌿',
    badge: '6 класс • 3D',
    title: 'Секрет зелёного листа',
    desc: 'Ткани листа, потоки веществ и запуск фотосинтеза',
    totalSteps: 4,
    grades: ['6'],
  },
  'bio-cell': {
    id: 'bio-cell',
    order: 2,
    icon: '🔬',
    badge: '9–10 класс • 2D',
    title: 'Строение клетки',
    desc: 'Сравнение растительной, животной и бактериальной клеток',
    totalSteps: 6,
    grades: ['9', '10-11'],
  },
  'bio-dna-3d': {
    id: 'bio-dna-3d',
    order: 3,
    icon: '🧬',
    badge: '10 класс • 3D',
    title: 'Двойная спираль ДНК',
    desc: 'Комплементарность А–Т / Г–Ц и сборка нити иРНК',
    totalSteps: 3,
    grades: ['10-11'],
    isExam: true,
  },
  'bio-division-3d': {
    id: 'bio-division-3d',
    order: 4,
    icon: '🧫',
    badge: '10–11 класс • 3D • ЦТ/ЦЭ',
    title: 'Митоз и Мейоз',
    desc: 'Сравни деление клетки в 3D: кроссинговер, расхождение хромосом и расчёт наборов n и c',
    totalSteps: 8,
    grades: ['10-11'],
    isExam: true,
  },
  'chem-indicators': {
    id: 'chem-indicators',
    order: 5,
    icon: '🧪',
    badge: '8 класс • 2D',
    title: 'Среда и индикаторы',
    desc: 'Реакции лакмуса, фенолфталеина и метилоранжа',
    totalSteps: 3,
    grades: ['8'],
  },
  'chem-qualitative': {
    id: 'chem-qualitative',
    order: 6,
    icon: '⚗️',
    badge: '9–11 класс • 2D',
    title: 'Качественные реакции',
    desc: 'Распознавание ионов по цвету осадка и выделению газа',
    totalSteps: 4,
    grades: ['9', '10-11'],
    isExam: true,
  },
  'chem-detective': {
    id: 'chem-detective',
    order: 7,
    icon: '🕵️',
    badge: 'Практикум • ЦТ/ЦЭ',
    title: 'Химический детектив',
    desc: 'Определи 4 неизвестных раствора без этикеток',
    totalSteps: 4,
    grades: ['9', '10-11'],
    isExam: true,
  },
}

let catalogCache: Record<string, CatalogItem> | null = null

/** Загружает каталог карточек из Firestore */
export async function fetchCatalog(): Promise<Record<string, CatalogItem>> {
  if (catalogCache) return catalogCache

  try {
    const snap = await getDocs(collection(db, 'catalog'))
    if (!snap.empty) {
      const next: Record<string, CatalogItem> = { ...DEFAULT_CATALOG }
      snap.forEach((d) => {
        next[d.id] = { ...next[d.id], ...(d.data() as CatalogItem), id: d.id }
      })
      catalogCache = next
      return next
    }
  } catch (err) {
    console.warn('Используем встроенный каталог:', err)
  }

  return DEFAULT_CATALOG
}

/** Разовая заливка каталога в Firestore */
export async function seedCatalogToFirestore(): Promise<void> {
  for (const item of Object.values(DEFAULT_CATALOG)) {
    await setDoc(doc(db, 'catalog', item.id), item)
  }
  catalogCache = { ...DEFAULT_CATALOG }
}
