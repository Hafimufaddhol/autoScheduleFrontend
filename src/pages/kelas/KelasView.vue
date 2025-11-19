<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Data Kelas</h1>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Tambah Kelas
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurusan</th>
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
                <Badge :text="kelas.jurusan" color="green" />
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
    </Card>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Kelas" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Kelas" placeholder="Contoh: XI IPA 1" required />
          <Input v-model="form.kode" label="Kode Kelas" placeholder="Contoh: XI-IPA-1" required />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
            <select
              v-model="form.jurusan"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Jurusan</option>
              <option value="IPA">IPA</option>
              <option value="IPS">IPS</option>
              <option value="Bahasa">Bahasa</option>
              <option value="Umum">Umum</option>
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

const kelasList = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  jurusan: '',
  tingkat: ''
})

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

const fetchKelas = async () => {
  loading.value = true
  try {
    const response = await kelasRepository.getAll()
    kelasList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    showAlert('error', 'Gagal memuat data kelas')
    console.error('Error fetching kelas:', error)
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
    jurusan: '',
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
    jurusan: kelas.jurusan,
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
})
</script>
