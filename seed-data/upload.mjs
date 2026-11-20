import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const serviceAccount = JSON.parse(readFileSync('./seed-data/service-account.json', 'utf8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const topicsDir = './seed-data/topics'
const files = readdirSync(topicsDir, { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.json'))

async function run() {
  if (files.length === 0) {
    console.log('В папке seed-data/topics пока нет .json файлов.')
    return
  }

  for (const file of files) {
    const raw = readFileSync(join(topicsDir, file), 'utf8')
    const data = JSON.parse(raw)
    const { id, catalog, questions } = data

    if (!id) {
      console.warn(`⚠ Пропущен файл без поля id: ${file}`)
      continue
    }

    if (catalog) {
      await db.collection('catalog').doc(id).set({ ...catalog, id }, { merge: true })
    }
    if (questions) {
      await db.collection('quizzes').doc(id).set({
        labId: id,
        questions,
        updatedAt: Date.now(),
      })
    }
    console.log(`✓ Загружено: ${id} (${file})`)
  }
  console.log(`\nГотово! Синхронизировано тем: ${files.length}`)
}

run().catch(console.error)
