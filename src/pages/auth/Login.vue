<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6">Login</h1>

      <!-- form harus punya @submit -->
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block mb-1">Username</label>
          <input
            v-model="email"
            type="text"
            class="w-full border rounded p-2"
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const credentials = {
    email: email.value,
    password: password.value,
  }
  const success = await auth.login(credentials )
  console.log(credentials);
  
  if (success) {
    router.push({ name: "Dashboard" })
  } else {
    alert("Email atau password salah!")
  }
}

</script>
