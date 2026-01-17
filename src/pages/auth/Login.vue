<template>
  <div class="min-h-screen flex">
    <!-- Left Section - Login Form -->
    <div class="flex-1 lg:flex-none lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Header Text Slot -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-cyan-600 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4c0 .55-.45 1-1 1s-1-.45-1-1v-4H7c-.55 0-1-.45-1-1s.45-1 1-1h4V7c0-.55.45-1 1-1s1 .45 1 1v4h4c.55 0 1 .45 1 1s-.45 1-1 1z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Masuk ke Sistem</h1>
          <p class="text-gray-600">Silakan masukkan kredensial Anda</p>
        </div>

        <!-- Alert Message -->
        <div v-if="activeError" class="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
          role="alert">
          <div class="flex items-center">
            <svg class="flex-shrink-0 inline w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd" />
            </svg>
            <span>{{ activeError }}</span>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="email" type="text" id="email"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
              placeholder="Masukkan email Anda" required>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Kata Sandi</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password"
                class="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                placeholder="Masukkan kata sandi" required>
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input v-model="rememberMe" id="remember" type="checkbox"
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded">
              <label for="remember" class="ml-2 block text-sm text-gray-700">Ingat saya</label>
            </div>
            <a href="#" class="text-sm text-cyan-600 hover:text-cyan-800 hover:underline transition-colors">
              Lupa kata sandi?
            </a>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="authLoading"
            class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!authLoading">Masuk</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </span>
          </button>
        </form>

        <!-- Additional Text Slot -->
        <div class="mt-8 text-center text-sm text-gray-500">
          <p>Butuh bantuan? Hubungi administrator sistem</p>
          <p class="mt-1">© 2025 Dinas Kesehatan</p>
        </div>
      </div>
    </div>

      <!-- Right Section - Image with Diagonal Transition -->
      <div class="hidden lg:flex flex-1 relative">
        <!-- Background Image -->
        <div class="absolute inset-0 bg-cover bg-center" style="
            background-image: linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(8, 145, 178, 0.9)), 
                            url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 800%22><defs><pattern id=%22medical%22 x=%220%22 y=%220%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22><circle cx=%2250%22 cy=%2250%22 r=%221%22 fill=%22%23ffffff%22 opacity=%220.1%22/></pattern></defs><rect width=%221200%22 height=%22800%22 fill=%22url(%23medical)%22/></svg>');
            clip-path: polygon(8rem 0, 100% 0, 100% 100%, 0 100%);
          ">
          <!-- Medical Icons Decoration -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-white/20 text-center">
              <svg class="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19.5 3.09L15 7.59V4a1 1 0 0 0-2 0v3.59l-1.5-1.5a1 1 0 0 0-1.41 1.41L12 9.41l1.91-1.91A1 1 0 0 0 15 6.09L19.5 1.59a1 1 0 0 1 1.41 1.41z" />
                <path
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5 11h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2z" />
              </svg>
              <div class="space-y-2 text-xl font-light">
                <div>Sistem Informasi</div>
                <div class="font-semibold">Dinas Kesehatan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>

</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { loading, error, isAuthenticated } = storeToRefs(auth)
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const localError = ref('')

const authLoading = computed(() => loading.value)
const activeError = computed(() => localError.value || error.value)

const redirectAfterLogin = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect) {
    router.push(redirect)
  } else {
    router.push({ name: 'Dashboard' })
  }
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    localError.value = 'Email dan kata sandi harus diisi!'
    return
  }

  localError.value = ''

  try {
    await auth.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    })
    redirectAfterLogin()
  } catch (err) {
    console.error('Login error:', err)
  }
}

watchEffect(() => {
  if (isAuthenticated.value) {
    redirectAfterLogin()
  }
})
</script>

<style scoped>
/* Additional responsive styles */
@media (max-width: 1023px) {
  .min-h-screen {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
}
</style>