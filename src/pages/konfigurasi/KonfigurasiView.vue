<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Konfigurasi Sistem</h1>
        <p class="mt-2 text-gray-600">Atur parameter global untuk penjadwalan dan kelola paket jurusan</p>
      </div>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Form -->
    <Card>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Min JP per Mapel per Minggu
            </label>
            <input
              v-model.number="form.min_jp_per_mapel_per_minggu"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Max JP per Mapel per Minggu
            </label>
            <input
              v-model.number="form.max_jp_per_mapel_per_minggu"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Guru Max JP per Hari
            </label>
            <input
              v-model.number="form.guru_max_jp_per_hari"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Paket</h3>
          <p class="text-sm text-gray-600 mb-3">Daftar paket jurusan yang dapat dipilih di Kelas dan Mapel. "Umum" bersifat khusus (kosongkan pilihan untuk artinya umum).</p>
          <div class="flex items-center gap-3 mb-3">
            <input v-model="newPaket" type="text" placeholder="Nama paket baru (mis. IPA)" class="px-3 py-2 border border-gray-300 rounded-lg" />
            <button type="button" @click="handleAddPaket" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">Tambah</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-if="paket.length === 0" class="text-gray-500">Belum ada paket</span>
            <span v-for="p in paket" :key="p" class="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              {{ p }}
              <button type="button" @click="handleDeletePaket(p)" class="text-red-600 hover:text-red-800"><i class="fa-solid fa-xmark"></i></button>
            </span>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Default Slot Harian</h3>
          <p class="text-sm text-gray-600 mb-3">Jumlah slot per hari untuk setiap kelas (default)</p>
          
          <div class="space-y-3">
            <div v-for="(slot, index) in form.default_slot_harian" :key="index" class="flex items-center gap-3">
              <select
                v-model.number="slot.hari"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="1">Senin</option>
                <option :value="2">Selasa</option>
                <option :value="3">Rabu</option>
                <option :value="4">Kamis</option>
                <option :value="5">Jumat</option>
                <option :value="6">Sabtu</option>
              </select>
              
              <input
                v-model.number="slot.total_slot"
                type="number"
                min="1"
                max="12"
                placeholder="Jumlah slot"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                type="button"
                @click="removeSlot(index)"
                class="text-red-600 hover:text-red-900"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addSlot"
            class="mt-3 text-blue-600 hover:text-blue-900 font-medium"
          >
            <i class="fa-solid fa-plus mr-1"></i> Tambah Slot Harian
          </button>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="submit"
            :disabled="submitting"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
          </button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card, Alert } from '@/components/ui'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const loading = ref(false)
const submitting = ref(false)

const form = ref({
  min_jp_per_mapel_per_minggu: 2,
  max_jp_per_mapel_per_minggu: 5,
  guru_max_jp_per_hari: 5,
  default_slot_harian: []
})

const paket = ref([])
const newPaket = ref('')

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

const fetchKonfigurasi = async () => {
  loading.value = true
  try {
    const response = await konfigurasiRepository.get()
    // Backend returns data directly
    const data = response.data || {}
    
    form.value = {
      min_jp_per_mapel_per_minggu: data.min_jp_per_mapel_per_minggu || 2,
      max_jp_per_mapel_per_minggu: data.max_jp_per_mapel_per_minggu || 5,
      guru_max_jp_per_hari: data.guru_max_jp_per_hari || 5,
      default_slot_harian: data.default_slot_harian || []
    }

    // Fetch paket
    const p = await konfigurasiRepository.getPaket()
    paket.value = Array.isArray(p.paket) ? p.paket : []
  } catch (error) {
    showAlert('error', 'Gagal memuat konfigurasi')
    console.error('Error fetching konfigurasi:', error)
  } finally {
    loading.value = false
  }
}

const addSlot = () => {
  form.value.default_slot_harian.push({
    hari: 1,
    total_slot: 8
  })
}

const removeSlot = (index) => {
  form.value.default_slot_harian.splice(index, 1)
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await konfigurasiRepository.update(form.value)
    showAlert('success', 'Konfigurasi berhasil disimpan')
  } catch (error) {
    showAlert('error', 'Gagal menyimpan konfigurasi')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchKonfigurasi()
})

const handleAddPaket = async () => {
  const name = (newPaket.value || '').trim()
  if (!name) return
  try {
    const res = await konfigurasiRepository.addPaket(name)
    paket.value = res.paket || paket.value
    newPaket.value = ''
    showAlert('success', 'Paket ditambahkan')
  } catch (e) {
    showAlert('error', 'Gagal menambah paket')
    console.error(e)
  }
}

const handleDeletePaket = async (name) => {
  if (!confirm(`Hapus paket "${name}"? Semua mapel yang memiliki paket ini akan menjadi umum.`)) return
  try {
    const res = await konfigurasiRepository.deletePaket(name)
    paket.value = res.paket || paket.value.filter(p => p !== name)
    showAlert('success', 'Paket dihapus dan mapel terkait diubah menjadi umum')
  } catch (e) {
    showAlert('error', 'Gagal menghapus paket')
    console.error(e)
  }
}
</script>
