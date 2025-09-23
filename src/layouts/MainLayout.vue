<template>
  <div class="min-h-screen" :class="bodyClass">
    <!-- Navbar -->
    <Navbar 
      :sidebar-open="sidebarOpen"
      :brand-name="brandName"
      :logo-url="logoUrl"
      :right-text="rightText"
      :github-url="githubUrl"
      :show-mobile-search="showMobileSearch"
      :show-user-menu="showUserMenu"
      :user-name="userName"
      :user-avatar="userAvatar"
      :user-menu-items="userMenuItems"
      @toggle-sidebar="toggleSidebar"
      @search="handleSearch"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- Dashboard Layout -->
    <DashboardLayout 
      :show-footer="showFooter"
      :brand-name="brandName"
      :show-mobile-search="showMobileSearch"
      @search="handleSearch"
    >
      <slot></slot>
    </DashboardLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import DashboardLayout from './DashboardLayout.vue'

// Props
const props = defineProps({
  bodyClass: {
    type: String,
    default: 'bg-gray-50'
  },
  brandName: {
    type: String,
    default: 'Windster'
  },
  logoUrl: {
    type: String,
    default: '/images/logo.svg'
  },
  rightText: {
    type: String,
    default: 'Open source ❤️'
  },
  githubUrl: {
    type: String,
    default: 'https://github.com/themesberg/windster-tailwind-css-dashboard'
  },
  showMobileSearch: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showUserMenu: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: 'User'
  },
  userAvatar: {
    type: String,
    default: '/images/users/bonnie-green.png'
  },
  userMenuItems: {
    type: Array,
    default: () => [
      { name: 'Your Profile', href: '/profile' },
      { name: 'Settings', href: '/settings' },
      { name: 'Sign out', href: '/logout' }
    ]
  }
})

// Emits
const emit = defineEmits(['search', 'user-menu-click'])

// Reactive data
const sidebarOpen = ref(false)

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSearch = (query) => {
  emit('search', query)
}

const handleUserMenuClick = (item) => {
  emit('user-menu-click', item)
}

// Expose methods for parent components
defineExpose({
  openSidebar: () => { sidebarOpen.value = true },
  closeSidebar: () => { sidebarOpen.value = false },
  toggleSidebar
})
</script>

