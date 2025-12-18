<template>
  <div class="p-6">
    <PageHeader
      title="Data Guru"
      subtitle="Kelola data guru dengan kompetensi dan jadwal ketersediaan"
    >
      <template #actions>
        <BaseButton
          icon="fas fa-plus"
          size="lg"
          label="Tambah Guru"
          @click="openCreateModal"
        />
      </template>
    </PageHeader>

    <div class="mb-6 max-w-xl">
      <SearchBar
        v-model="searchQuery"
        id="guru-search"
        placeholder="Cari nama / kode"
        label="Cari Guru"
      />
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table -->
    <MyTable
      :data="rows"
      :columns="columns"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      :current-page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :page-size="pageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="handleSort"
      @edit="openEditModal"
      @delete="handleDelete"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="setPage"
      @update:pageSize="setPageSize"
    >
      <template #cell-kompetensi="{ row }">
        <div class="flex flex-wrap gap-1">
          <Badge v-for="(val, mapelId) in row.kompetensi" :key="mapelId" :label="mapelId" variant="primary" />
        </div>
      </template>
      <template #cell-hari_tidak_masuk="{ row }">
        <span v-if="row.hari_tidak_masuk && row.hari_tidak_masuk.length > 0">
          {{ row.hari_tidak_masuk.join(', ') }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </MyTable>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Guru" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Guru" placeholder="Contoh: Budi Santoso" required />
          <Input v-model="form.kode" label="Kode Guru" placeholder="Contoh: GR-001" required />
          <Input
            v-model.number="form.max_jp_per_minggu"
            type="number"
            min="1"
            label="Max JP per Minggu"
            placeholder="Mis. 24"
            helper-text="Batas jumlah jam pelajaran guru dalam seminggu"
            required
          />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kompetensi (Mapel)</label>
            <p class="text-xs text-gray-500 mb-3">Pilih mapel dengan pencarian cepat kemudian klik untuk menambah atau menghapus.</p>
            <div class="space-y-3">
              <div class="relative" ref="kompetensiDropdownRef">
                <button
                  type="button"
                  class="inline-flex items-center justify-between gap-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  @click.stop.prevent="toggleKompetensiDropdown"
                >
                  <span>
                    {{ selectedKompetensiDetails.length ? `${selectedKompetensiDetails.length} mapel dipilih` : 'Pilih kompetensi mapel' }}
                  </span>
                  <i :class="['fa-solid', 'fa-chevron-' + (kompetensiDropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
                </button>
                <transition name="fade">
                  <div
                    v-if="kompetensiDropdownOpen"
                    class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
                  >
                    <div class="p-3 border-b border-gray-100">
                      <input
                        v-model="kompetensiSearch"
                        type="text"
                        placeholder="Cari mapel..."
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                    <div class="max-h-60 overflow-y-auto">
                      <button
                        v-for="mapel in filteredMapels"
                        :key="mapel.id"
                        type="button"
                        class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                        @click.stop.prevent="toggleMapelSelection(mapel.id)"
                      >
                        <div>
                          <p class="font-medium text-gray-900">{{ mapel.nama }}</p>
                          <p class="text-xs text-gray-500">{{ mapel.kode }}</p>
                        </div>
                        <i
                          v-if="selectedKompetensi.includes(mapel.id)"
                          class="fa-solid fa-check text-cyan-600"
                        ></i>
                      </button>
                      <p v-if="!filteredMapels.length" class="p-4 text-sm text-gray-500">Mapel tidak ditemukan.</p>
                    </div>
                  </div>
                </transition>
              </div>

              <div v-if="selectedKompetensiDetails.length" class="flex flex-wrap gap-2">
                <span
                  v-for="mapel in selectedKompetensiDetails"
                  :key="mapel.id"
                  class="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-sm text-cyan-800"
                >
                  {{ mapel.nama }} ({{ mapel.kode }})
                  <button type="button" class="text-cyan-600 hover:text-cyan-800" @click="removeKompetensi(mapel.id)">
                    <i class="fa-solid fa-xmark text-xs"></i>
                  </button>
                </span>
              </div>
              <p v-else class="text-sm text-gray-400">Belum ada mapel dipilih.</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hari Tidak Masuk</label>
            <div class="space-y-2">
              <div v-for="hari in hariOptions" :key="hari" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'hari-' + hari"
                  :value="hari"
                  v-model="form.hari_tidak_masuk"
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label :for="'hari-' + hari" class="ml-2 block text-sm text-gray-900">{{ hari }}</label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { Alert, Badge, Input, Modal, SearchBar } from '@/components/ui'
import { PageHeader } from '@/components'
import BaseButton from '@/components/ui/BaseButton.vue'
import MyTable from '@/components/ui/MyTable.vue'
import { useRemoteTable } from '@/composables/useRemoteTable.js'
import guruRepository from '@/repositories/guruRepository'
import mapelRepository from '@/repositories/mapelRepository'

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'max_jp_per_minggu', label: 'Max JP/Mgg', sortable: false },
  { key: 'kompetensi', label: 'Kompetensi', sortable: false },
  { key: 'hari_tidak_masuk', label: 'Hari Tidak Masuk', sortable: false },
]

const searchQuery = ref('')
const searchDebounce = ref(null)
const {
  rows,
  loading,
  page,
  pageSize,
  totalPages,
  totalItems,
  sortBy,
  sortOrder,
  setPage,
  nextPage,
  previousPage,
  setPageSize,
  setSearchValue,
  toggleSort,
  refresh
} = useRemoteTable((params) => guruRepository.getAll(params), )
const availableMapels = ref([])
const kompetensiDropdownOpen = ref(false)
const kompetensiDropdownRef = ref(null)
const kompetensiSearch = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  max_jp_per_minggu: 24,
  hari_tidak_masuk: []
})

const selectedKompetensi = ref([])
const filteredMapels = computed(() => {
  if (!kompetensiSearch.value) {
    return availableMapels.value
  }

  const keyword = kompetensiSearch.value.toLowerCase()
  return availableMapels.value.filter((mapel) => {
    const nama = mapel.nama?.toLowerCase() || ''
    const kode = mapel.kode?.toLowerCase() || ''
    return nama.includes(keyword) || kode.includes(keyword)
  })
})

const selectedKompetensiDetails = computed(() => {
  return selectedKompetensi.value
    .map((id) => availableMapels.value.find((mapel) => mapel.id === id))
    .filter(Boolean)
})

const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

watch(searchQuery, (value) => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
  searchDebounce.value = setTimeout(() => {
    setSearchValue(value)
  }, 600)
})

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const handleSort = ({ key }) => {
  toggleSort(key)
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getReference()
    availableMapels.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error('Gagal memuat mapel:', error)
  }
}

const toggleKompetensiDropdown = () => {
  kompetensiDropdownOpen.value = !kompetensiDropdownOpen.value
  if (kompetensiDropdownOpen.value) {
    kompetensiSearch.value = ''
  }
}

const closeKompetensiDropdown = () => {
  kompetensiDropdownOpen.value = false
}

const toggleMapelSelection = (mapelId) => {
  if (!mapelId) return
  if (selectedKompetensi.value.includes(mapelId)) {
    selectedKompetensi.value = selectedKompetensi.value.filter((id) => id !== mapelId)
  } else {
    selectedKompetensi.value = [...selectedKompetensi.value, mapelId]
  }
}

const removeKompetensi = (mapelId) => {
  selectedKompetensi.value = selectedKompetensi.value.filter((id) => id !== mapelId)
}

const handleKompetensiClickOutside = (event) => {
  if (!kompetensiDropdownRef.value) return
  if (!kompetensiDropdownRef.value.contains(event.target)) {
    closeKompetensiDropdown()
  }
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    nama: '',
    kode: '',
    max_jp_per_minggu: 24,
    hari_tidak_masuk: []
  }
  selectedKompetensi.value = []
  showModal.value = true
}

const openEditModal = (guru) => {
  isEdit.value = true
  currentId.value = guru.id
  form.value = {
    nama: guru.nama,
    kode: guru.kode,
    max_jp_per_minggu: guru.max_jp_per_minggu ?? 24,
    hari_tidak_masuk: guru.hari_tidak_masuk || []
  }
  // Convert kompetensi object to array
  selectedKompetensi.value = guru.kompetensi ? Object.keys(guru.kompetensi) : []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    // Convert array to object
    const kompetensiObj = {}
    selectedKompetensi.value.forEach(mapelId => {
      kompetensiObj[mapelId] = true
    })

    const payload = {
      ...form.value,
      max_jp_per_minggu: form.value.max_jp_per_minggu ? Number(form.value.max_jp_per_minggu) : null,
      kompetensi: kompetensiObj
    }

    if (isEdit.value) {
      await guruRepository.update(currentId.value, payload)
      showAlert('success', 'Guru berhasil diupdate')
    } else {
      await guruRepository.create(payload)
      showAlert('success', 'Guru berhasil ditambahkan')
    }

    closeModal()
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data guru')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus guru ini?')) return

  try {
    await guruRepository.delete(id)
    showAlert('success', 'Guru berhasil dihapus')
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menghapus guru')
    console.error(error)
  }
}

onMounted(() => {
  refresh()
  fetchMapels()
  document.addEventListener('click', handleKompetensiClickOutside)
})

onBeforeUnmount(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
  document.removeEventListener('click', handleKompetensiClickOutside)
})
</script>
