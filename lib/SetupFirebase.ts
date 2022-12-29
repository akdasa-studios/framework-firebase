import { initializeApp } from 'firebase/app'
import { getFirestore , enableIndexedDbPersistence, enableNetwork, disableNetwork } from 'firebase/firestore'
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

export function firebaseSetup(
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

export async function firebaseEnableNetwork() {
  await enableNetwork(getFirestore())
}

export async function firebaseDisableNetwork() {
  await disableNetwork(getFirestore())
}
