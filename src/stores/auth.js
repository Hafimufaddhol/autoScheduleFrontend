import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  updatePassword
} from 'firebase/auth'
import { firebaseAuth } from '@/firebase'
import { STORAGE_KEYS } from '@/utils/constants'

const FALLBACK_USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null)
  const user = ref(loadPersistedUser())
  const loading = ref(false)
  const error = ref(null)
  const isReady = ref(false)
  let initPromise
  let unsubscribeAuth

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderator' || isAdmin.value)

  function loadPersistedUser() {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem(FALLBACK_USER_KEY)
    try {
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      console.warn('[auth] Failed to parse stored user', err)
      return null
    }
  }

  function persistSession() {
    if (typeof window === 'undefined') return
    if (token.value) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token.value)
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }

    if (user.value) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    }
    // cleanup legacy key
    localStorage.removeItem(FALLBACK_USER_KEY)
  }

  function mapFirebaseUser(firebaseUser) {
    if (!firebaseUser) return null
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      phoneNumber: firebaseUser.phoneNumber,
      metadata: {
        creationTime: firebaseUser.metadata?.creationTime,
        lastSignInTime: firebaseUser.metadata?.lastSignInTime
      }
    }
  }

  function setSession(firebaseUser) {
    if (!firebaseUser) {
      token.value = null
      user.value = null
      persistSession()
      return
    }

    user.value = mapFirebaseUser(firebaseUser)
    firebaseUser.getIdToken().then((idToken) => {
      token.value = idToken
      persistSession()
    }).catch((err) => {
      console.error('[auth] Failed to fetch ID token', err)
    })
  }

  function init() {
    if (initPromise) return initPromise

    initPromise = new Promise((resolve) => {
      unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        setSession(firebaseUser)
        isReady.value = true
        resolve()
      })
    })

    return initPromise
  }

  async function ensureReady() {
    if (isReady.value) return
    await init()
  }

  async function getAccessToken(forceRefresh = false) {
    await ensureReady()
    if (!firebaseAuth.currentUser) return null
    const idToken = await firebaseAuth.currentUser.getIdToken(forceRefresh)
    token.value = idToken
    persistSession()
    return idToken
  }

  async function login({ email, password, rememberMe = true }) {
    loading.value = true
    error.value = null
    try {
      await setPersistence(firebaseAuth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      await ensureReady()
      return true
    } catch (err) {
      console.error('[auth] login failed', err)
      error.value = translateFirebaseError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register({ email, password, displayName }) {
    loading.value = true
    error.value = null
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      if (displayName) {
        await firebaseUpdateProfile(cred.user, { displayName })
      }
      setSession(cred.user)
      return mapFirebaseUser(cred.user)
    } catch (err) {
      console.error('[auth] register failed', err)
      error.value = translateFirebaseError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await signOut(firebaseAuth)
    token.value = null
    user.value = null
    error.value = null
    persistSession()
  }

  async function refreshUser(forceTokenRefresh = false) {
    if (!firebaseAuth.currentUser) return null
    await firebaseAuth.currentUser.reload()
    setSession(firebaseAuth.currentUser)
    if (forceTokenRefresh) {
      await getAccessToken(true)
    }
    return user.value
  }

  async function updateProfile(profileData) {
    if (!firebaseAuth.currentUser) throw new Error('Not authenticated')
    await firebaseUpdateProfile(firebaseAuth.currentUser, profileData)
    setSession(firebaseAuth.currentUser)
    return user.value
  }

  async function changePassword(newPassword) {
    if (!firebaseAuth.currentUser) throw new Error('Not authenticated')
    await updatePassword(firebaseAuth.currentUser, newPassword)
    return { success: true }
  }

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email || '')
  const validatePassword = (password = '') => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  })

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password)
    const score = Object.values(validation).filter(Boolean).length
    if (score < 3) return 'weak'
    if (score < 5) return 'medium'
    return 'strong'
  }

  function translateFirebaseError(err) {
    const code = err?.code || ''
    if (code.includes('auth/invalid-credential')) return 'Email atau kata sandi tidak valid.'
    if (code.includes('auth/user-disabled')) return 'Akun dinonaktifkan. Hubungi admin.'
    if (code.includes('auth/user-not-found')) return 'Akun tidak ditemukan.'
    if (code.includes('auth/wrong-password')) return 'Kata sandi salah.'
    return err?.message || 'Terjadi kesalahan otentikasi.'
  }

  return {
    token,
    user,
    loading,
    error,
    isReady,
    isAuthenticated,
    isAdmin,
    isModerator,
    init,
    ensureReady,
    getAccessToken,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    validateEmail,
    validatePassword,
    getPasswordStrength
  }
})
