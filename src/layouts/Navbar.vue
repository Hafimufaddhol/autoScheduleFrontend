<template>
  <nav class="bg-white border-b border-gray-200 fixed z-30 w-full">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          <!-- Mobile menu button -->
          <button 
            @click="toggleSidebar"
            aria-expanded="true" 
            aria-controls="sidebar" 
            class="lg:hidden mr-2 text-gray-600 hover:text-gray-900 cursor-pointer p-2 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 rounded"
          >
            <svg 
              v-if="!sidebarOpen" 
              class="w-6 h-6" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
            <svg 
              v-else 
              class="w-6 h-6" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>

          <!-- Logo -->
          <router-link to="/" class="text-xl font-bold flex items-center lg:ml-2.5">
            <img :src="logoUrl" class="h-6 mr-2" alt="Windster Logo">
            <span class="self-center whitespace-nowrap">{{ brandName }}</span>
          </router-link>

          <!-- Desktop Search -->
          <form @submit.prevent="handleSearch" class="hidden lg:block lg:pl-32">
            <label for="topbar-search" class="sr-only">Search</label>
            <div class="mt-1 relative lg:w-64">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <input 
                v-model="searchQuery"
                type="text" 
                id="topbar-search" 
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full pl-10 p-2.5" 
                placeholder="Search"
              >
            </div>
          </form>
        </div>

        <div class="flex items-center">
          <!-- Mobile Search Button -->
          <button 
            v-if="showMobileSearch"
            @click="toggleMobileSearch"
            type="button" 
            class="lg:hidden text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg"
          >
            <span class="sr-only">Search</span>
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
            </svg>
          </button>

          <!-- Right side items -->
          <div class="hidden lg:flex items-center">
            <span class="text-base font-normal text-gray-500 mr-5">{{ rightText }}</span>
            <div class="-mb-1">
              <a 
                v-if="githubUrl"
                class="github-button" 
                :href="githubUrl" 
                data-color-scheme="no-preference: dark; light: light; dark: light;" 
                data-icon="octicon-star" 
                data-size="large" 
                data-show-count="true" 
                :aria-label="`Star ${githubUrl} on GitHub`"
              >
                Star
              </a>
            </div>
          </div>

          <!-- User Menu -->
          <div v-if="showUserMenu" class="ml-3 relative">
            <div>
              <button 
                @click="toggleUserMenu"
                type="button" 
                class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" 
                id="user-menu-button" 
                aria-expanded="false" 
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <img 
                  class="h-8 w-8 rounded-full" 
                  :src="userAvatar" 
                  :alt="userName"
                >
              </button>
            </div>

            <!-- User dropdown menu -->
            <div 
              v-if="userMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" 
              role="menu" 
              aria-orientation="vertical" 
              aria-labelledby="user-menu-button" 
              tabindex="-1"
            >
              <a 
                v-for="item in userMenuItems" 
                :key="item.name"
                :href="item.href" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                role="menuitem" 
                tabindex="-1"
                @click="handleUserMenuClick(item)"
              >
                {{ item.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  brandName: {
    type: String,
    default: 'Kesmas'
  },
  logoUrl: {
    type: String,
    default: '../assets/images/logo.svg'
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
const emit = defineEmits(['toggle-sidebar', 'search', 'user-menu-click'])

// Reactive data
const searchQuery = ref('')
const userMenuOpen = ref(false)

// Methods
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const toggleMobileSearch = () => {
  // Emit event to parent to handle mobile search
  emit('toggle-mobile-search')
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleUserMenuClick = (item) => {
  emit('user-menu-click', item)
  userMenuOpen.value = false
}

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    userMenuOpen.value = false
  }
}

// Add event listener for outside clicks
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

