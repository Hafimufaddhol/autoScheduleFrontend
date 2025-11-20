<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Guru</h1>
        <p class="mt-2 text-gray-600">Kelola data guru dengan kompetensi dan jadwal ketersediaan</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 mb-4 gap-4">
      <!-- Search -->
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="guru-search" class="sr-only">Search</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input v-model="searchQuery" @input="handleSearch" type="text" id="guru-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari nama / kode" />
        </div>
      </form>

      <!-- Buttons -->
      <div class="flex items-center space-x-2 sm:space-x-3 ml-auto mt-3 sm:mt-0">
        <BaseButton 
          icon="fas fa-plus"
          size="lg"
          label="Tambah Guru"
          @click="openCreateModal"
        />
      </div>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table -->
    <MyTable
      :data="paginatedData"
      :columns="columns"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      v-model:pageSize="localPageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="toggleSort"
      @edit="openEditModal"
      @delete="handleDelete"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="goToPageLocal"
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
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kompetensi (Mapel)</label>
            <div class="space-y-2">
              <div v-for="mapel in availableMapels" :key="mapel.id" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'mapel-' + mapel.id"
                  :value="mapel.kode"
                  v-model="selectedKompetensi"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="'mapel-' + mapel.id" class="ml-2 block text-sm text-gray-900">
                  {{ mapel.nama }} ({{ mapel.kode }})
                </label>
              </div>
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
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Alert, Badge, Input, Modal } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import MyTable from '@/components/ui/MyTable.vue'
import { useTable } from '@/composables/useTable.js'
import guruRepository from '@/repositories/guruRepository'
import mapelRepository from '@/repositories/mapelRepository'

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'kompetensi', label: 'Kompetensi', sortable: false },
  { key: 'hari_tidak_masuk', label: 'Hari Tidak Masuk', sortable: false },
]

const {
  data,
  paginatedData,
  setData,
  searchQuery,
  sortBy,
  sortOrder,
  loading,
  totalPages,
  currentPage,
  goToPage,
  nextPage: nextPageComposable,
  previousPage: previousPageComposable,
  pageSize,
  totalItems,
} = useTable([], {
  pageSize: 50,
  searchFields: ['nama', 'kode'],
})

const localPageSize = ref(pageSize.value)
const availableMapels = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  hari_tidak_masuk: []
})

const selectedKompetensi = ref([])

const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

// Watch for page size changes from MyTable
watch(localPageSize, (newSize) => {
  pageSize.value = newSize
})

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const fetchGurus = async () => {
  loading.value = true
  try {
    const response = await guruRepository.getAll({ pageSize: 1000 })
    // response => { data, meta, links }
    if (Array.isArray(response.data)) {
      setData(response.data)
    } else if (Array.isArray(response)) { // legacy safety
      setData(response)
    } else {
      setData([])
    }
  } catch (error) {
    showAlert('error', 'Gagal memuat data guru')
    console.error('Error fetching gurus:', error)
  } finally {
    loading.value = false
  }
}

const toggleSort = ({ key }) => {
  if (sortBy.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortBy.value = null
      sortOrder.value = null
    }
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
}

const goToPageLocal = (page) => {
  goToPage(page)
}

const previousPage = () => {
  previousPageComposable()
}

const nextPage = () => {
  nextPageComposable()
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getAll(({
  pageSize: 1000,
}))
    availableMapels.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Gagal memuat mapel:', error)
  }
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    nama: '',
    kode: '',
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
    fetchGurus()
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
    fetchGurus()
  } catch (error) {
    showAlert('error', 'Gagal menghapus guru')
    console.error(error)
  }
}

onMounted(() => {
  fetchGurus()
  fetchMapels()
})
</script>
