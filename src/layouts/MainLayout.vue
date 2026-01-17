<template>
  <div class="min-h-screen" :class="bodyClass">
    <!-- Sidebar -->
  <Sidebar />

    <!-- Navbar -->
    <Navbar
      :user-name="displayName"
      :user-menu-items="userMenuItems"
      @toggle-sidebar="toggleSidebar"
      @search="handleSearch"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- Main Content -->
    <main class="pt-16 lg:pl-64">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useSidebar } from '@/composables/useSidebar.js'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

// Props
const props = defineProps({
  bodyClass: { type: String, default: 'bg-gray-50' }
})

// Composable Sidebar
const { toggle, checkMobile } = useSidebar()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

const displayName = computed(() => user.value?.displayName || user.value?.name || user.value?.email || 'Pengguna')
const userMenuItems = [{ name: 'Keluar', action: 'logout' }]

const toggleSidebar = () => toggle()
const handleSearch = (query) => {
  console.log('Search query:', query)
}

const handleUserMenuClick = async (item) => {
  if (item?.action === 'logout') {
    await handleLogout()
  } else if (item?.href) {
    router.push(item.href)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
