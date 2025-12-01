<template>
  <div class="relative inline-block text-left" ref="wrapper">
    <button
      type="button"
      class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      @click="toggle"
    >
      EDIT
      <i class="fa-solid fa-chevron-down text-xs"></i>
    </button>
    <transition name="fade">
      <div
        v-if="open"
        class="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-xl"
      >
        <button
          v-for="item in items"
          :key="item.key"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
          @click="navigate(item.route)"
        >
          <i :class="item.icon"></i>
          {{ item.label }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  kelasId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const open = ref(false)
const wrapper = ref(null)

const items = computed(() => [
  { key: 'info', label: 'Edit Info Kelas', route: 'KelasInfo', icon: 'fa-regular fa-address-card' },
  { key: 'aturan', label: 'Edit Aturan Kelas', route: 'KelasAturan', icon: 'fa-solid fa-list-check' },
  { key: 'jp', label: 'Edit JP Mapel', route: 'KelasJPMapel', icon: 'fa-solid fa-layer-group' }
])

const toggle = () => {
  if (!props.kelasId) return
  open.value = !open.value
}

const close = () => {
  open.value = false
}

const navigate = (routeName) => {
  close()
  if (!props.kelasId) return
  router.push({ name: routeName, params: { id: props.kelasId } })
}

const handleClickOutside = (event) => {
  if (!wrapper.value) return
  if (!wrapper.value.contains(event.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
