import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

const useAuthEmulator = (import.meta.env.VITE_FIREBASE_USE_AUTH_EMULATOR || '').toString().toLowerCase()
const shouldUseEmulator = ['1', 'true', 'yes'].includes(useAuthEmulator)

const rawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const missingKeys = Object.entries(rawConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  const hint = shouldUseEmulator
    ? 'Even in emulator mode you must copy the Firebase web config from the console.'
    : 'Grab the Firebase web config from the console and paste it into .env.'
  throw new Error(`[firebase] Missing configuration for: ${missingKeys.join(', ')}. ${hint}`)
}

const firebaseApp = initializeApp(rawConfig)
const firebaseAuth = getAuth(firebaseApp)
firebaseAuth.useDeviceLanguage()

if (shouldUseEmulator) {
  const emulatorUrl = (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099').replace(/\/$/, '')
  try {
    connectAuthEmulator(firebaseAuth, emulatorUrl, { disableWarnings: true })
    console.info(`[firebase] Auth emulator connected at ${emulatorUrl}`)
  } catch (err) {
    console.error('[firebase] Failed to connect Auth emulator', err)
  }
}

export { firebaseApp, firebaseAuth }
