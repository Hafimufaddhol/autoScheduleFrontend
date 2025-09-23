<template>
  <div class="flex overflow-hidden bg-white pt-16">
    <!-- Sidebar -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :show-mobile-search="showMobileSearch"
      @close="closeSidebar"
      @search="handleSearch"
    />
    
    <!-- Main Content -->
    <div id="main-content" class="h-full w-full bg-gray-50 relative overflow-y-auto lg:ml-64">
      <main>
        <slot></slot>
      </main>
      
      <!-- Footer (optional) -->
      <!-- <footer v-if="showFooter" class="bg-white border-t border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <p class="text-center text-sm text-gray-500">
            &copy; {{ currentYear }} {{ brandName }}. All rights reserved.
          </p>
        </div>
      </footer> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from './Sidebar.vue'

// Props
const props = defineProps({
  showFooter: {
    type: Boolean,
    default: true
  },
  brandName: {
    type: String,
    default: 'Windster'
  },
  showMobileSearch: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['search'])

// Reactive data
const sidebarOpen = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Methods
const closeSidebar = () => {
  sidebarOpen.value = false
}

const handleSearch = (query) => {
  emit('search', query)
}

// Expose methods for parent components
defineExpose({
  openSidebar: () => { sidebarOpen.value = true },
  closeSidebar,
  toggleSidebar: () => { sidebarOpen.value = !sidebarOpen.value }
})
</script>

