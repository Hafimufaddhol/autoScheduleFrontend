<template>
  <Card class="max-w-md mx-auto" variant="elevated">
    <template #headerActions>
      <img :src="logo" class="h-8" alt="Logo">
    </template>
    
    <div class="space-y-6">
      <!-- Title -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
            start your 14-day free trial
          </a>
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email Field -->
        <Input
          v-model="form.email"
          type="email"
          label="Email address"
          placeholder="name@company.com"
          :error="errors.email"
          :disabled="loading"
          required
          autocomplete="email"
        />

        <!-- Password Field -->
        <Input
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="••••••••"
          :error="errors.password"
          :disabled="loading"
          :show-password-toggle="true"
          required
          autocomplete="current-password"
        />

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              v-model="form.remember"
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :loading="loading"
          :disabled="loading"
          variant="primary"
          size="lg"
          full-width
        >
          Sign in
        </Button>
      </form>

      <!-- Social Login -->
      <div v-if="showSocialLogin" class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline-secondary"
            size="md"
            full-width
            @click="handleSocialLogin('google')"
          >
            <GoogleIcon class="w-5 h-5 mr-2" />
            Google
          </Button>

          <Button
            variant="outline-secondary"
            size="md"
            full-width
            @click="handleSocialLogin('github')"
          >
            <GithubIcon class="w-5 h-5 mr-2" />
            GitHub
          </Button>
        </div>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Card from '../ui/Card.vue'
import Input from '../ui/Input.vue'
import Button from '../ui/BaseButton.vue'
import logo from '@/assets/images/logo.svg'

// Props
const props = defineProps({
  showSocialLogin: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'social-login'])

// Reactive data
const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: ''
})

// Methods
const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  let isValid = true
  
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', {
      email: form.email,
      password: form.password,
      remember: form.remember
    })
  }
}

const handleSocialLogin = (provider) => {
  emit('social-login', provider)
}
</script>

<script>
// Icon components
export const GoogleIcon = {
  template: `
    <svg viewBox="0 0 24 24" class="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  `
}

export const GithubIcon = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  `
}
</script>

