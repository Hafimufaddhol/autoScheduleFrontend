<template>
  <Card class="max-w-md mx-auto" variant="elevated">
    <template #headerActions>
      <img src="/images/logo.svg" class="h-8" alt="Logo">
    </template>
    
    <div class="space-y-6">
      <!-- Title -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <Input
            v-model="form.firstName"
            type="text"
            label="First name"
            placeholder="John"
            :error="errors.firstName"
            :disabled="loading"
            required
            autocomplete="given-name"
          />

          <Input
            v-model="form.lastName"
            type="text"
            label="Last name"
            placeholder="Doe"
            :error="errors.lastName"
            :disabled="loading"
            required
            autocomplete="family-name"
          />
        </div>

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
          :show-char-count="true"
          :maxlength="50"
          required
          autocomplete="new-password"
        />

        <!-- Confirm Password Field -->
        <Input
          v-model="form.confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          :error="errors.confirmPassword"
          :disabled="loading"
          :show-password-toggle="true"
          required
          autocomplete="new-password"
        />

        <!-- Terms and Conditions -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              v-model="form.acceptTerms"
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="accept-terms" class="text-gray-900">
              I agree to the
              <a href="#" class="text-blue-600 hover:text-blue-500">Terms and Conditions</a>
              and
              <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </label>
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
          Create account
        </Button>
      </form>

      <!-- Social Registration -->
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
    </div>
  </Card>
</template>

<script setup>
import { reactive } from 'vue'
import Card from '../ui/Card.vue'
import Input from '../ui/Input.vue'
import Button from '../ui/Button.vue'

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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Methods
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
  let isValid = true
  
  // First name validation
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }
  
  // Last name validation
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    isValid = false
  }
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      acceptTerms: form.acceptTerms
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

