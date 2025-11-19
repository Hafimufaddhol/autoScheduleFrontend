<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Mata Pelajaran</h1>
        <p class="text-gray-600 mt-1 text-sm">Server-side pagination, pencarian & sorting.</p>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Cari nama / kode" class="border px-3 py-2 rounded-lg text-sm w-60" />
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
          Tambah Mapel
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket Tertentu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat Tertentu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
            <tr v-else-if="mapels.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
            <tr v-else v-for="mapel in mapels" :key="mapel.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ mapel.nama }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :label="mapel.kode" variant="primary" />
              </td>
              <td class="px-6 py-4">
                <span v-if="(mapel.paket_tertentu && mapel.paket_tertentu.length) || (mapel.jurusan_tertentu && mapel.jurusan_tertentu.length)">
                  <Badge
                    v-for="jur in (mapel.paket_tertentu && mapel.paket_tertentu.length ? mapel.paket_tertentu : mapel.jurusan_tertentu)"
                    :key="jur"
                    :label="jur"
                    variant="success"
                    class="mr-1"
                  />
                </span>
                <span v-else class="text-gray-400">Semua</span>
              </td>
              <td class="px-6 py-4">
                <span v-if="mapel.tingkat_tertentu && mapel.tingkat_tertentu.length > 0">
                  {{ mapel.tingkat_tertentu.join(', ') }}
                </span>
                <span v-else class="text-gray-400">Semua</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditModal(mapel)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button
                  @click="handleDelete(mapel.id)"
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
import { ref, onMounted } from 'vue'
import { Card, Alert, Badge, Input, Modal } from '@/components/ui'
import mapelRepository from '@/repositories/mapelRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const mapels = ref([])
const meta = ref(null)
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortBy = ref(null)
const sortOrder = ref(null)
const loading = ref(false)
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

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const buildOptions = () => ({
  page: page.value,
  pageSize: pageSize.value,
  search: searchQuery.value || undefined,
  sort: sortBy.value ? (sortOrder.value === 'desc' ? [`-${sortBy.value}`] : [sortBy.value]) : undefined,
})

const fetchMapels = async () => {
  loading.value = true
  try {
    const response = await mapelRepository.getAll(buildOptions())
    if (Array.isArray(response.data)) {
      mapels.value = response.data
    } else if (Array.isArray(response)) {
      mapels.value = response
    } else {
      mapels.value = []
    }
    meta.value = response.meta || null
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

const reloadPage = () => { page.value = 1; fetchMapels() }
const handleSearch = () => { page.value = 1; fetchMapels() }
const nextPage = () => { if (meta.value && page.value < meta.value.pagination.total_pages) { page.value++; fetchMapels() } }
const prevPage = () => { if (meta.value && page.value > 1) { page.value--; fetchMapels() } }
const toggleSort = (field) => {
  if (sortBy.value === field) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else if (sortOrder.value === 'desc') { sortBy.value = null; sortOrder.value = null }
  } else { sortBy.value = field; sortOrder.value = 'asc' }
  page.value = 1
  fetchMapels()
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
