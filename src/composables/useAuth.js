import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    init: store.init,
    ensureReady: store.ensureReady,
    getAccessToken: store.getAccessToken,
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshUser: store.refreshUser,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    validateEmail: store.validateEmail,
    validatePassword: store.validatePassword,
    getPasswordStrength: store.getPasswordStrength
  }
}

