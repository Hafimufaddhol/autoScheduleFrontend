<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Mata Pelajaran</h1>
        <p class="mt-2 text-gray-600">Kelola mata pelajaran dengan filter paket dan tingkat tertentu</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 mb-4 gap-4">
      <!-- Search -->
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="mapel-search" class="sr-only">Search</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input v-model="searchQuery" @input="handleSearch" type="text" id="mapel-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari nama / kode" />
        </div>
      </form>

      <!-- Buttons -->
      <div class="flex items-center space-x-2 sm:space-x-3 ml-auto mt-3 sm:mt-0">
        <BaseButton 
          icon="fas fa-plus"
          size="lg"
          label="Tambah Mapel"
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
      <template #cell-kode="{ row }">
        <Badge :label="row.kode" variant="primary" />
      </template>
      <template #cell-paket_tertentu="{ row }">
        <span v-if="(row.paket_tertentu && row.paket_tertentu.length) || (row.jurusan_tertentu && row.jurusan_tertentu.length)">
          <Badge
            v-for="jur in (row.paket_tertentu && row.paket_tertentu.length ? row.paket_tertentu : row.jurusan_tertentu)"
            :key="jur"
            :label="jur"
            variant="success"
            class="mr-1"
          />
        </span>
        <span v-else class="text-gray-400">Semua</span>
      </template>
      <template #cell-tingkat_tertentu="{ row }">
        <span v-if="row.tingkat_tertentu && row.tingkat_tertentu.length > 0">
          {{ row.tingkat_tertentu.join(', ') }}
        </span>
        <span v-else class="text-gray-400">Semua</span>
      </template>
    </MyTable>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Mata Pelajaran" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Mapel" placeholder="Contoh: Matematika" required />
          <Input v-model="form.kode" label="Kode Mapel" placeholder="Contoh: MATH" required />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Paket Tertentu</label>
            <p class="text-xs text-gray-500 mb-2">Kosongkan jika untuk semua paket</p>
            <div class="space-y-2">
              <div v-for="jur in paketOptions" :key="jur" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'jur-' + jur"
                  :value="jur"
                  v-model="form.paket_tertentu"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="'jur-' + jur" class="ml-2 block text-sm text-gray-900">{{ jur }}</label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tingkat Tertentu</label>
            <p class="text-xs text-gray-500 mb-2">Kosongkan jika untuk semua tingkat</p>
            <div class="space-y-2">
              <div v-for="tingkat in tingkatOptions" :key="tingkat" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'tingkat-' + tingkat"
                  :value="tingkat"
                  v-model="form.tingkat_tertentu"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="'tingkat-' + tingkat" class="ml-2 block text-sm text-gray-900">{{ tingkat }}</label>
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
import mapelRepository from '@/repositories/mapelRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'paket_tertentu', label: 'Paket Tertentu', sortable: false },
  { key: 'tingkat_tertentu', label: 'Tingkat Tertentu', sortable: false },
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
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  paket_tertentu: [],
  tingkat_tertentu: []
})

const paketOptions = ref([])
const tingkatOptions = [10, 11, 12]

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

const fetchMapels = async () => {
  loading.value = true
  try {
    const response = await mapelRepository.getAll({ pageSize: 1000 })
    if (Array.isArray(response.data)) {
      setData(response.data)
    } else if (Array.isArray(response)) {
      setData(response)
    } else {
      setData([])
    }
  } catch (error) {
    showAlert('error', 'Gagal memuat data mapel')
    console.error('Error fetching mapels:', error)
  } finally {
    loading.value = false
  }
}

const fetchPaket = async () => {
  try {
    const res = await konfigurasiRepository.getPaket()
    // Do not include 'Umum' because empty selection represents umum
    paketOptions.value = Array.isArray(res.paket) ? res.paket : []
  } catch (e) {
    paketOptions.value = []
    console.error(e)
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

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    nama: '',
    kode: '',
    paket_tertentu: [],
    tingkat_tertentu: []
  }
  showModal.value = true
}

const openEditModal = (mapel) => {
  isEdit.value = true
  currentId.value = mapel.id
  form.value = {
    nama: mapel.nama,
    kode: mapel.kode,
    paket_tertentu: (mapel.paket_tertentu && mapel.paket_tertentu.length ? mapel.paket_tertentu : (mapel.jurusan_tertentu || [])),
    tingkat_tertentu: mapel.tingkat_tertentu || []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = { ...form.value, jurusan_tertentu: form.value.paket_tertentu }
    if (isEdit.value) {
      await mapelRepository.update(currentId.value, payload)
      showAlert('success', 'Mapel berhasil diupdate')
    } else {
      await mapelRepository.create(payload)
      showAlert('success', 'Mapel berhasil ditambahkan')
    }

    closeModal()
    fetchMapels()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data mapel')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus mapel ini?')) return

  try {
    await mapelRepository.delete(id)
    showAlert('success', 'Mapel berhasil dihapus')
    fetchMapels()
  } catch (error) {
    showAlert('error', 'Gagal menghapus mapel')
    console.error(error)
  }
}

onMounted(() => {
  fetchMapels()
  fetchPaket()
})
</script>
