<template>
  <aside
    id="sidebar"
    class="fixed z-20 h-full top-0 left-0 pt-16 flex flex-col w-64 transition-transform duration-300"
    :class="sidebarClasses"
    aria-label="Sidebar"
  >
    <div class="relative flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white pt-0">
      <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div class="flex-1 px-3 bg-white divide-y space-y-1">
          <ul class="space-y-2 pb-2">
            <!-- Navigation Items -->
            <li v-for="item in navigationItems" :key="item.name">
              <router-link
                :to="item.href"
                class="text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group"
                :class="{ 'bg-gray-100': isActiveRoute(item.href) }"
              >
                <component
                  :is="item.icon"
                  class="w-6 h-6 text-gray-500 group-hover:text-gray-900 transition duration-75"
                />
                <span class="ml-3">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>

          <!-- Bottom Section -->
          <div class="space-y-2 pt-2">
            <a
              v-for="item in bottomItems"
              :key="item.name"
              :href="item.href"
              :target="item.external ? '_blank' : '_self'"
              class="text-base text-gray-900 font-normal rounded-lg hover:bg-gray-100 group transition duration-75 flex items-center p-2"
            >
              <component
                :is="item.icon"
                class="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-gray-900 transition duration-75"
              />
              <span class="ml-3">{{ item.name }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Backdrop Mobile -->
  <div
    v-if="isOpen && isMobile"
    class="bg-gray-900 opacity-50 fixed inset-0 z-10 lg:hidden"
    @click="close"
  ></div>
</template>

<script setup>
import { useSidebar } from '@/composables/useSidebar.js'
import { useRoute } from 'vue-router'

const { isOpen, isMobile, close, sidebarClasses } = useSidebar()
const route = useRoute()

// Navigation
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: 'DashboardIcon' },
  { name: 'Users', href: '/users', icon: 'UsersIcon' },
  { name: 'Products', href: '/products', icon: 'ProductsIcon' },
]

const bottomItems = [] // Tambah jika perlu

const isActiveRoute = (href) => route.path === href
</script>
