<template>
  <div class="p-6">
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Kelas</h1>
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
          Tambah Kelas
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
                Nama <span v-if="sortBy === 'nama'" class="ml-1"><i :class="sortOrder === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i></span>
              </th>
              <th @click="toggleSort('kode')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                Kode <span v-if="sortBy === 'kode'" class="ml-1"><i :class="sortOrder === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i></span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading...</td>
            </tr>
            <tr v-else-if="kelasList.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
            </tr>
            <tr v-else v-for="kelas in kelasList" :key="kelas.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ kelas.nama }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ kelas.kode }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :label="kelas.paket || kelas.jurusan"  />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ kelas.tingkat }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditModal(kelas)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button
                  @click="handleDelete(kelas.id)"
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
import { ref, onMounted } from 'vue'
import { Card, Alert, Badge, Input, Modal } from '@/components/ui'
import kelasRepository from '@/repositories/kelasRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const kelasList = ref([])
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
  paket: '',
  tingkat: ''
})

const paketOptions = ref([])

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

const fetchKelas = async () => {
  loading.value = true
  try {
    const response = await kelasRepository.getAll(buildOptions())
    if (Array.isArray(response.data)) {
      kelasList.value = response.data
    } else if (Array.isArray(response)) {
      kelasList.value = response
    } else {
      kelasList.value = []
    }
    meta.value = response.meta || null
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

const reloadPage = () => { page.value = 1; fetchKelas() }
const handleSearch = () => { page.value = 1; fetchKelas() }
const nextPage = () => { if (meta.value && page.value < meta.value.pagination.total_pages) { page.value++; fetchKelas() } }
const prevPage = () => { if (meta.value && page.value > 1) { page.value--; fetchKelas() } }
const toggleSort = (field) => {
  if (sortBy.value === field) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else if (sortOrder.value === 'desc') { sortBy.value = null; sortOrder.value = null }
  } else { sortBy.value = field; sortOrder.value = 'asc' }
  page.value = 1
  fetchKelas()
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
