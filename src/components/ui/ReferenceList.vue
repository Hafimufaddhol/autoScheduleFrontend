<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="helperText" class="text-xs text-gray-500 mb-2">{{ helperText }}</p>

    <!-- Dropdown Container -->
    <div class="space-y-3">
      <div class="relative" ref="dropdownRef">
        <!-- Trigger Button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="disabled"
            class="inline-flex items-center justify-between gap-3 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            @click.stop.prevent="toggleDropdown"
          >
            <span :class="{ 'text-gray-400': !hasSelection }">
              {{ displayText }}
            </span>
            <i :class="['fa-solid', 'fa-chevron-' + (dropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
          </button>
          <button
            v-if="clearable && hasSelection && !disabled"
            type="button"
            class="text-gray-400 hover:text-gray-600 px-1"
            @click.stop="clearSelection"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Dropdown Panel -->
        <transition name="fade">
          <div
            v-if="dropdownOpen"
            class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <!-- Search Input -->
            <div class="p-3 border-b border-gray-100">
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
                @click.stop
              />
            </div>

            <!-- Options List -->
            <div class="max-h-60 overflow-y-auto">
              <button
                v-for="item in filteredItems"
                :key="item.id"
                type="button"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                @click.stop.prevent="handleItemClick(item)"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ item.nama || item.name || item.kode || item.id }}</p>
                  <p v-if="item.kode && (item.nama || item.name)" class="text-xs text-gray-500">{{ item.kode }}</p>
                </div>
                <i
                  v-if="isSelected(item)"
                  class="fa-solid fa-check text-cyan-600"
                ></i>
              </button>
              <p v-if="!filteredItems.length" class="p-4 text-sm text-gray-500">
                {{ emptyText }}
              </p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Selected Badges (for multiple mode) -->
      <div v-if="multiple && showBadges && selectedDetails.length" class="flex flex-wrap gap-2">
        <span
          v-for="item in selectedDetails"
          :key="item.id"
          class="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-sm text-cyan-800"
        >
          {{ item.nama || item.name || item.kode }} {{ item.kode && (item.nama || item.name) ? `(${item.kode})` : '' }}
          <button type="button" class="text-cyan-600 hover:text-cyan-800" @click="removeItem(item.id)">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </span>
      </div>
      <p v-else-if="multiple && showBadges && !selectedDetails.length" class="text-sm text-gray-400">
        {{ noSelectionText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import guruRepository from '@/repositories/guruRepository'
import kelasRepository from '@/repositories/kelasRepository'
import mapelRepository from '@/repositories/mapelRepository'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['guru', 'kelas', 'mapel'].includes(value)
  },
  multiple: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  showBadges: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'Tidak ditemukan.'
  },
  noSelectionText: {
    type: String,
    default: 'Belum ada yang dipilih.'
  },
  excludeIds: {
    type: Array,
    default: () => []
  },
  clearable: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: 'id',
    validator: (value) => ['id', 'kode'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

// State
const items = ref([])
const loading = ref(false)
const dropdownOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)
const searchInputRef = ref(null)

// Computed
const typeLabels = {
  guru: 'guru',
  kelas: 'kelas',
  mapel: 'mapel'
}

const searchPlaceholder = computed(() => `Cari ${typeLabels[props.type]}...`)

// Helper to get item value based on valueKey
const getItemValue = (item) => item[props.valueKey] || item.id

const selectedValues = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }
  return props.modelValue ? [props.modelValue] : []
})

const hasSelection = computed(() => selectedValues.value.length > 0)

const displayText = computed(() => {
  if (!hasSelection.value) {
    return props.placeholder || `Pilih ${typeLabels[props.type]}`
  }

  if (props.multiple) {
    return `${selectedValues.value.length} ${typeLabels[props.type]} dipilih`
  }

  const selectedItem = items.value.find((item) => getItemValue(item) === props.modelValue)
  return selectedItem ? (selectedItem.nama || selectedItem.name || selectedItem.kode || selectedItem.id) : props.modelValue
})

const filteredItems = computed(() => {
  let result = items.value

  // Exclude specified IDs (always by id for excludeIds prop)
  if (props.excludeIds.length > 0) {
    result = result.filter((item) => !props.excludeIds.includes(item.id))
  }

  // Filter by search query
  if (!searchQuery.value) {
    return result
  }

  const keyword = searchQuery.value.toLowerCase()
  return result.filter((item) => {
    const nama = (item.nama || item.name || '').toLowerCase()
    const kode = (item.kode || '').toLowerCase()
    return nama.includes(keyword) || kode.includes(keyword)
  })
})

const selectedDetails = computed(() => {
  return selectedValues.value
    .map((val) => items.value.find((item) => getItemValue(item) === val))
    .filter(Boolean)
})

// Methods
const isSelected = (item) => selectedValues.value.includes(getItemValue(item))

const toggleDropdown = () => {
  if (props.disabled) return
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleItemClick = (item) => {
  if (props.multiple) {
    toggleItem(item)
  } else {
    selectItem(item)
  }
}

const selectItem = (item) => {
  const value = getItemValue(item)
  emit('update:modelValue', value)
  emit('select', item)
  closeDropdown()
}

const toggleItem = (item) => {
  const value = getItemValue(item)
  const current = [...selectedValues.value]
  const index = current.indexOf(value)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  emit('update:modelValue', current)
  emit('select', item)
}

const removeItem = (id) => {
  if (props.multiple) {
    const current = selectedValues.value.filter((val) => val !== id)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', '')
  }
}

const clearSelection = () => {
  if (props.multiple) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', '')
  }
  emit('select', null)
}

const handleClickOutside = (event) => {
  if (!dropdownRef.value) return
  if (!dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const fetchItems = async () => {
  loading.value = true
  try {
    let response
    switch (props.type) {
      case 'guru':
        response = await guruRepository.getReference()
        break
      case 'kelas':
        response = await kelasRepository.getReference()
        break
      case 'mapel':
        response = await mapelRepository.getReference()
        break
    }
    items.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(`Gagal memuat data ${props.type}:`, error)
    items.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchItems()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for type changes to refetch data
watch(() => props.type, () => {
  fetchItems()
})

// Expose refresh method
defineExpose({
  refresh: fetchItems
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
