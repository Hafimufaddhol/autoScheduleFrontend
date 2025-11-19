<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Data Mata Pelajaran</h1>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Tambah Mapel
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan Tertentu</th>
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
                <Badge :text="mapel.kode" color="purple" />
              </td>
              <td class="px-6 py-4">
                <span v-if="mapel.jurusan_tertentu && mapel.jurusan_tertentu.length > 0">
                  <Badge
                    v-for="jur in mapel.jurusan_tertentu"
                    :key="jur"
                    :text="jur"
                    color="green"
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
    </Card>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Mata Pelajaran" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Mapel" placeholder="Contoh: Matematika" required />
          <Input v-model="form.kode" label="Kode Mapel" placeholder="Contoh: MATH" required />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jurusan Tertentu</label>
            <p class="text-xs text-gray-500 mb-2">Kosongkan jika untuk semua jurusan</p>
            <div class="space-y-2">
              <div v-for="jur in jurusanOptions" :key="jur" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'jur-' + jur"
                  :value="jur"
                  v-model="form.jurusan_tertentu"
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

const mapels = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  jurusan_tertentu: [],
  tingkat_tertentu: []
})

const jurusanOptions = ['IPA', 'IPS', 'Bahasa', 'Umum']
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

const fetchMapels = async () => {
  loading.value = true
  try {
    const response = await mapelRepository.getAll()
    mapels.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    showAlert('error', 'Gagal memuat data mapel')
    console.error('Error fetching mapels:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    nama: '',
    kode: '',
    jurusan_tertentu: [],
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
    jurusan_tertentu: mapel.jurusan_tertentu || [],
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
    if (isEdit.value) {
      await mapelRepository.update(currentId.value, form.value)
      showAlert('success', 'Mapel berhasil diupdate')
    } else {
      await mapelRepository.create(form.value)
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
})
</script>
