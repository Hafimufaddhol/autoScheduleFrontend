<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Kelas</h1>
        <p class="mt-2 text-gray-600">Kelola data kelas dengan paket dan tingkat</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 mb-4 gap-4">
      <!-- Search -->
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="kelas-search" class="sr-only">Search</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input v-model="searchQuery" @input="handleSearch" type="text" id="kelas-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari nama / kode" />
        </div>
      </form>

      <!-- Buttons -->
      <div class="flex items-center space-x-2 sm:space-x-3 ml-auto mt-3 sm:mt-0">
        <BaseButton 
          icon="fas fa-plus"
          size="lg"
          label="Tambah Kelas"
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
      <template #cell-paket="{ row }">
        <Badge :label="row.paket || row.jurusan" />
      </template>
    </MyTable>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Kelas" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Kelas" placeholder="Contoh: XI IPA 1" required />
          <Input v-model="form.kode" label="Kode Kelas" placeholder="Contoh: XI-IPA-1" required />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Paket</label>
            <select
              v-model="form.paket"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Paket</option>
              <option v-for="p in paketOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
            <select
              v-model.number="form.tingkat"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Tingkat</option>
              <option :value="10">10</option>
              <option :value="11">11</option>
              <option :value="12">12</option>
            </select>
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
import kelasRepository from '@/repositories/kelasRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'paket', label: 'Paket', sortable: false },
  { key: 'tingkat', label: 'Tingkat', sortable: true },
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
  paket: '',
  tingkat: ''
})

const paketOptions = ref([])

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

const fetchKelas = async () => {
  loading.value = true
  try {
    const response = await kelasRepository.getAll({ pageSize: 1000 })
    if (Array.isArray(response.data)) {
      setData(response.data)
    } else if (Array.isArray(response)) {
      setData(response)
    } else {
      setData([])
    }
  } catch (error) {
    showAlert('error', 'Gagal memuat data kelas')
    console.error('Error fetching kelas:', error)
  } finally {
    loading.value = false
  }
}

const fetchPaket = async () => {
  try {
    const res = await konfigurasiRepository.getPaket()
    // Add special 'Umum' as an option for kelas
    const arr = Array.isArray(res.paket) ? res.paket.slice() : []
    if (!arr.includes('Umum')) arr.push('Umum')
    paketOptions.value = arr
  } catch (e) {
    paketOptions.value = ['Umum']
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
    paket: '',
    tingkat: ''
  }
  showModal.value = true
}

const openEditModal = (kelas) => {
  isEdit.value = true
  currentId.value = kelas.id
  form.value = {
    nama: kelas.nama,
    kode: kelas.kode,
    paket: kelas.paket || kelas.jurusan,
    tingkat: kelas.tingkat
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await kelasRepository.update(currentId.value, form.value)
      showAlert('success', 'Kelas berhasil diupdate')
    } else {
      await kelasRepository.create(form.value)
      showAlert('success', 'Kelas berhasil ditambahkan')
    }

    closeModal()
    fetchKelas()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data kelas')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus kelas ini?')) return

  try {
    await kelasRepository.delete(id)
    showAlert('success', 'Kelas berhasil dihapus')
    fetchKelas()
  } catch (error) {
    showAlert('error', 'Gagal menghapus kelas')
    console.error(error)
  }
}

onMounted(() => {
  fetchKelas()
  fetchPaket()
})
</script>
