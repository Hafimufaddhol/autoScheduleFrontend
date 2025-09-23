import { ref, computed, reactive } from 'vue'

// Global auth state
const user = ref(null)
const token = ref(localStorage.getItem('auth_token'))
const loading = ref(false)
const error = ref(null)

// Auth methods
const login = async (credentials) => {
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      throw new Error('Invalid credentials')
    }
    
    const data = await response.json()
    
    // Store token and user data
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

const register = async (userData) => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      throw new Error('Registration failed')
    }
    
    const data = await response.json()
    
    // Store token and user data
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

const logout = () => {
  user.value = null
  token.value = null
  error.value = null
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}

const refreshUser = async () => {
  if (!token.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to refresh user data')
    }
    
    const data = await response.json()
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  } catch (err) {
    error.value = err.message
    // If token is invalid, logout
    if (err.message.includes('401') || err.message.includes('403')) {
      logout()
    }
    throw err
  } finally {
    loading.value = false
  }
}

const updateProfile = async (profileData) => {
  if (!token.value) throw new Error('Not authenticated')
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    
    const data = await response.json()
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

const changePassword = async (passwordData) => {
  if (!token.value) throw new Error('Not authenticated')
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(passwordData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to change password')
    }
    
    return response.json()
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

// Initialize user from localStorage
const initializeAuth = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser && token.value) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (err) {
      console.error('Failed to parse stored user data:', err)
      logout()
    }
  }
}

export function useAuth() {
  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderator' || isAdmin.value)
  
  // Form validation helpers
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email)
  }
  
  const validatePassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }
  
  const getPasswordStrength = (password) => {
    const validation = validatePassword(password)
    const score = Object.values(validation).filter(Boolean).length
    
    if (score < 3) return 'weak'
    if (score < 5) return 'medium'
    return 'strong'
  }
  
  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    isAuthenticated,
    isAdmin,
    isModerator,
    
    // Methods
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    initializeAuth,
    
    // Validation helpers
    validateEmail,
    validatePassword,
    getPasswordStrength
  }
}

