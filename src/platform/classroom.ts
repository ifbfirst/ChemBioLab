import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
  } from 'firebase/firestore'
  import { auth, db } from './firebase'
  
  /** Получить или создать 6-значный код приглашения для текущего учителя */
  export async function getOrCreateTeacherCode(): Promise<string> {
    const user = auth.currentUser
    if (!user) throw new Error('Необходима авторизация')
  
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)
    const existingCode = snap.data()?.myTeacherCode as string | undefined
    if (existingCode) return existingCode
  
    const randomCode = 'LAB-' + Math.floor(1000 + Math.random() * 9000)
  
    await setDoc(doc(db, 'teacherCodes', randomCode), {
      teacherUid: user.uid,
      teacherName: user.displayName || user.email || 'Преподаватель',
      createdAt: Date.now(),
    })
  
    await setDoc(userRef, { role: 'teacher', myTeacherCode: randomCode }, { merge: true })
    return randomCode
  }
  
  /** Привязать текущего ученика к учителю по его коду */
  export async function joinTeacherByCode(rawCode: string): Promise<string> {
    const user = auth.currentUser
    if (!user) throw new Error('Сначала войдите через Google')
  
    const code = rawCode.trim().toUpperCase()
    const codeSnap = await getDoc(doc(db, 'teacherCodes', code))
    if (!codeSnap.exists()) {
      throw new Error('Код класса не найден. Проверьте правильность ввода.')
    }
  
    const { teacherUid, teacherName } = codeSnap.data() as {
      teacherUid: string
      teacherName: string
    }
  
    if (teacherUid === user.uid) {
      throw new Error('Нельзя присоединиться к самому себе')
    }
  
    await setDoc(
      doc(db, 'users', user.uid),
      {
        teacherId: teacherUid,
        teacherName,
        joinedAt: Date.now(),
      },
      { merge: true },
    )
  
    return teacherName
  }
  
  /** Загрузить ТОЛЬКО учеников текущего учителя */
  export async function fetchMyStudents() {
    const user = auth.currentUser
    if (!user) return []
  
    const q = query(collection(db, 'users'), where('teacherId', '==', user.uid))
    const snap = await getDocs(q)
  
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        uid: d.id,
        email: (data.email as string) ?? 'Без email',
        displayName: (data.displayName as string) || (data.email as string) || 'Ученик',
        lastLoginAt: data.lastLoginAt as number | undefined,
        progress: (data.progress as Record<string, { steps?: string[]; quizPassed?: boolean }>) ?? {},
      }
    })
  }
  