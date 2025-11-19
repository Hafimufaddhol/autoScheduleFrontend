<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Data Guru</h1>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Tambah Guru
      </button>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
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
                  <Badge v-for="(val, mapelId) in guru.kompetensi" :key="mapelId" :text="mapelId" color="blue" />
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
import { ref, onMounted, computed } from 'vue'
import { Card, Alert, Badge, Input, Modal } from '@/components/ui'
import guruRepository from '@/repositories/guruRepository'
import mapelRepository from '@/repositories/mapelRepository'

const gurus = ref([])
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

const fetchGurus = async () => {
  loading.value = true
  try {
    const response = await guruRepository.getAll()
    gurus.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    showAlert('error', 'Gagal memuat data guru')
    console.error('Error fetching gurus:', error)
  } finally {
    loading.value = false
  }
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getAll()
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
