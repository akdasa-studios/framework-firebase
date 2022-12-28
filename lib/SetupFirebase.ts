import { initializeApp } from 'firebase/app'
import { getFirestore , enableIndexedDbPersistence } from 'firebase/firestore'
// import { initializeAuth } from 'firebase/auth'



export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export function setupFirebase(
  firebaseConfig: FirebaseConfig,
  persistance = false
) {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  // const auth = initializeAuth(app)

  if (persistance) {
    enableIndexedDbPersistence(db, { forceOwnership: true })
      .catch((err) => {
        console.log(err)
      })
  }
}