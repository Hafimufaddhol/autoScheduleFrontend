import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
export { pinia }
export { useAuthStore } from './auth'
export { useReferenceCacheStore } from './referenceCache'
