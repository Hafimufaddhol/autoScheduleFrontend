<template>
  <div class="min-h-screen" :class="bodyClass">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Navbar -->
    <Navbar
      @toggle-sidebar="toggleSidebar"
      @search="handleSearch"
    />

    <!-- Main Content -->
    <main class="pt-16 lg:pl-64">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSidebar } from '@/composables/useSidebar.js'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

// Props
const props = defineProps({
  bodyClass: { type: String, default: 'bg-gray-50' }
})

// Composable Sidebar
const { toggle, checkMobile } = useSidebar()

const toggleSidebar = () => toggle()
const handleSearch = (query) => {
  console.log('Search query:', query)
}

// Detect mobile resize
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
