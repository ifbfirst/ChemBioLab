import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface QuizQuestion {
  question: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

const quizCache = new Map<string, QuizQuestion[]>()

export async function fetchLabQuiz(labId: string): Promise<QuizQuestion[]> {
  if (quizCache.has(labId)) {
    return quizCache.get(labId)!
  }

  try {
    const snap = await getDoc(doc(db, 'quizzes', labId))
    if (snap.exists()) {
      const data = snap.data()
      if (Array.isArray(data?.questions)) {
        const questions = data.questions as QuizQuestion[]
        quizCache.set(labId, questions)
        return questions
      }
    }
  } catch (err) {
    console.error('Ошибка загрузки теста из Firestore:', err)
  }

  return []
}
