// src/api/apiClient.js
import axios from 'axios'
import { useCurrentUserStore } from '@/store/current-user.store'

// bikin instance axios
const apiClient = axios.create({
  baseURL: '/api', // bisa disesuaikan dari .env
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Interceptor request → tambah token
apiClient.interceptors.request.use(
  (config) => {
    const store = useCurrentUserStore()
    if (store.token) {
      config.headers.Authorization = `Bearer ${store.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor response → refresh token kalau 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      const store = useCurrentUserStore()

      // refresh token
      const res = await axios.post('/api/users/refresh', {
        refreshToken: store.refreshToken,
        role: store.userProfile?.currentRole
      })

      const newToken = res.data.data.token
      store.setAccessToken(newToken)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      return apiClient(originalRequest)
    }
    return Promise.reject(error)
  }
)

export default apiClient
