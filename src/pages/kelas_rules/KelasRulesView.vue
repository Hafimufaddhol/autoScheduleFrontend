<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Aturan Kelas</h1>
        <p class="mt-2 text-gray-600">Atur slot harian, hari libur, dan slot terkunci untuk setiap kelas</p>
      </div>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Pilih Kelas -->
    <Card class="mb-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
        <select
          v-model="selectedKelasId"
          @change="loadRules"
          class="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Kelas --</option>
          <option v-for="kelas in kelasList" :key="kelas.id" :value="kelas.id">
            {{ kelas.nama }} ({{ kelas.kode }})
          </option>
        </select>
      </div>
    </Card>

    <!-- Form Rules -->
    <div v-if="selectedKelasId">
      <form @submit.prevent="handleSubmit">
        <!-- Slot Harian -->
        <Card class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Slot Harian</h3>
          <p class="text-sm text-gray-600 mb-4">Tentukan jumlah slot untuk setiap hari dalam seminggu</p>
          
          <div class="space-y-3">
            <div v-for="(slot, index) in form.slot_harian" :key="index" class="flex items-center gap-3">
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
                @click="removeSlotHarian(index)"
                class="text-red-600 hover:text-red-900"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addSlotHarian"
            class="mt-3 text-blue-600 hover:text-blue-900 font-medium"
          >
            <i class="fa-solid fa-plus mr-1"></i> Tambah Slot Harian
          </button>
        </Card>

        <!-- Disabled Day -->
        <Card class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Hari Tidak Aktif</h3>
          <p class="text-sm text-gray-600 mb-4">Pilih hari yang tidak ada pembelajaran</p>
          
          <div class="space-y-2">
            <div v-for="hari in hariOptions" :key="hari.value" class="flex items-center">
              <input
                type="checkbox"
                :id="'disabled-' + hari.value"
                :value="hari.value"
                v-model="form.disabled_day"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label :for="'disabled-' + hari.value" class="ml-2 block text-sm text-gray-900">
                {{ hari.label }}
              </label>
            </div>
          </div>
        </Card>

        <!-- Locked Slot -->
        <Card class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Slot Terkunci</h3>
          <p class="text-sm text-gray-600 mb-4">Kunci slot tertentu dengan mapel yang sudah ditentukan</p>
          
          <div class="space-y-3">
            <div v-for="(locked, index) in form.locked_slot" :key="index" class="flex items-center gap-3">
              <select
                v-model.number="locked.hari"
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
                v-model.number="locked.slot"
                type="number"
                min="1"
                placeholder="Slot ke-"
                class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                v-model="locked.mapel_id"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Mapel</option>
                <option v-for="mapel in mapelList" :key="mapel.id" :value="mapel.kode">
                  {{ mapel.nama }} ({{ mapel.kode }})
                </option>
              </select>
              
              <button
                type="button"
                @click="removeLockedSlot(index)"
                class="text-red-600 hover:text-red-900"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addLockedSlot"
            class="mt-3 text-blue-600 hover:text-blue-900 font-medium"
          >
            <i class="fa-solid fa-plus mr-1"></i> Tambah Slot Terkunci
          </button>
        </Card>

        <!-- Submit -->
        <div class="flex justify-end gap-3">
          <button
            type="submit"
            :disabled="submitting"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Aturan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <div class="text-center py-12 text-gray-500">
        <i class="fa-solid fa-clipboard-list text-5xl mb-4"></i>
        <p>Pilih kelas terlebih dahulu untuk mengatur aturan</p>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card, Alert } from '@/components/ui'
import kelasRepository from '@/repositories/kelasRepository'
import mapelRepository from '@/repositories/mapelRepository'
import kelasRulesRepository from '@/repositories/kelasRulesRepository'

const kelasList = ref([])
const mapelList = ref([])
const selectedKelasId = ref('')
const submitting = ref(false)

const form = ref({
  slot_harian: [],
  disabled_day: [],
  locked_slot: []
})

const hariOptions = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 7, label: 'Minggu' }
]

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
  try {
    const response = await kelasRepository.getAll()
    kelasList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Gagal memuat kelas:', error)
  }
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getAll()
    mapelList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Gagal memuat mapel:', error)
  }
}

const loadRules = async () => {
  if (!selectedKelasId.value) return

  try {
    const response = await kelasRulesRepository.get(selectedKelasId.value)
    // Backend returns data directly
    const data = response.data || {}
    
    form.value = {
      slot_harian: data.slot_harian || [],
      disabled_day: data.disabled_day || [],
      locked_slot: data.locked_slot || []
    }
  } catch (error) {
    showAlert('error', 'Gagal memuat aturan kelas')
    console.error(error)
  }
}

const addSlotHarian = () => {
  form.value.slot_harian.push({
    hari: 1,
    total_slot: 8
  })
}

const removeSlotHarian = (index) => {
  form.value.slot_harian.splice(index, 1)
}

const addLockedSlot = () => {
  form.value.locked_slot.push({
    hari: 1,
    slot: 1,
    mapel_id: ''
  })
}

const removeLockedSlot = (index) => {
  form.value.locked_slot.splice(index, 1)
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await kelasRulesRepository.update(selectedKelasId.value, form.value)
    showAlert('success', 'Aturan kelas berhasil disimpan')
  } catch (error) {
    showAlert('error', 'Gagal menyimpan aturan kelas')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchKelas()
  fetchMapels()
})
</script>
