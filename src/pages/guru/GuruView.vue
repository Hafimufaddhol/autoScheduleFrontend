<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Guru</h1>
        <p class="text-gray-600 mt-1 text-sm">Pagination, pencarian, sorting & filter server-side.</p>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="searchQuery" @input="handleSearch"
          type="text" placeholder="Cari nama / kode" class="border px-3 py-2 rounded-lg text-sm w-60" />
        <select v-model.number="pageSize" @change="reloadPage" class="border px-2 py-2 rounded-lg text-sm">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          Tambah Guru
        </button>
      </div>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th @click="toggleSort('nama')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Nama
                <span v-if="sortBy === 'nama'" class="ml-1"><i :class="sortOrder === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i></span>
              </th>
              <th @click="toggleSort('kode')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Kode
                <span v-if="sortBy === 'kode'" class="ml-1"><i :class="sortOrder === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i></span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kompetensi</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Tidak Masuk</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
            <tr v-else-if="gurus.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
            <tr v-else v-for="guru in gurus" :key="guru.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ guru.nama }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ guru.kode }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="(val, mapelId) in guru.kompetensi" :key="mapelId" :label="mapelId" variant="primary" />
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="guru.hari_tidak_masuk && guru.hari_tidak_masuk.length > 0">
                  {{ guru.hari_tidak_masuk.join(', ') }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditModal(guru)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button
                  @click="handleDelete(guru.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <i class="fa-solid fa-trash"></i> Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination footer -->
      <div class="flex items-center justify-between mt-4 px-2" v-if="meta">
        <p class="text-sm text-gray-600">Halaman {{ meta.pagination.page }} dari {{ meta.pagination.total_pages }} • Total {{ meta.pagination.total_items }} data</p>
        <div class="flex items-center gap-2">
          <button @click="prevPage" :disabled="meta.pagination.page <= 1" class="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <button @click="nextPage" :disabled="meta.pagination.page >= meta.pagination.total_pages" class="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </Card>

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
import { ref, onMounted } from 'vue'
import { Card, Alert, Badge, Input, Modal } from '@/components/ui'
import guruRepository from '@/repositories/guruRepository'
import mapelRepository from '@/repositories/mapelRepository'

const gurus = ref([])
const meta = ref(null)
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortBy = ref(null)
const sortOrder = ref(null)
const availableMapels = ref([])
const loading = ref(false)
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

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const buildOptions = () => {
  return {
    page: page.value,
    pageSize: pageSize.value,
    search: searchQuery.value || undefined,
    sort: sortBy.value ? (sortOrder.value === 'desc' ? [`-${sortBy.value}`] : [sortBy.value]) : undefined,
  }
}

const fetchGurus = async () => {
  loading.value = true
  try {
    const response = await guruRepository.getAll(buildOptions())
    // response => { data, meta, links }
    if (Array.isArray(response.data)) {
      gurus.value = response.data
    } else if (Array.isArray(response)) { // legacy safety
      gurus.value = response
    } else {
      gurus.value = []
    }
    meta.value = response.meta || null
  } catch (error) {
    showAlert('error', 'Gagal memuat data guru')
    console.error('Error fetching gurus:', error)
  } finally {
    loading.value = false
  }
}

const reloadPage = () => {
  page.value = 1
  fetchGurus()
}

const handleSearch = () => {
  page.value = 1
  fetchGurus()
}

const nextPage = () => {
  if (meta.value && page.value < meta.value.pagination.total_pages) {
    page.value += 1
    fetchGurus()
  }
}

const prevPage = () => {
  if (meta.value && page.value > 1) {
    page.value -= 1
    fetchGurus()
  }
}

const toggleSort = (field) => {
  if (sortBy.value === field) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortBy.value = null
      sortOrder.value = null
    }
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  page.value = 1
  fetchGurus()
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
