import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCzbAfiaO40_kH_oMfcuegdcW-88q9eCkg",
    authDomain: "chembiolab-48f31.firebaseapp.com",
    projectId: "chembiolab-48f31",
    storageBucket: "chembiolab-48f31.firebasestorage.app",
    messagingSenderId: "460207026691",
    appId: "1:460207026691:web:f95b1ad96e7f1f1d73d436",
    measurementId: "G-6GRW1ETP42"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
