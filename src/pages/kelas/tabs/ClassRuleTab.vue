<template>
  <div>
    <div v-if="!kelas?.id" class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
      Simpan info kelas terlebih dahulu untuk mengatur aturan khusus.
    </div>
    <div v-else class="space-y-8">
      <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

      <Card>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Slot Harian</h3>
            <p class="text-sm text-gray-500">Override jumlah slot per hari di luar konfigurasi global.</p>
          </div>
          <BaseButton icon="fa-solid fa-plus" label="Tambah Hari" size="sm" @click="addSlotHarian" />
        </div>

        <div class="mt-4 space-y-3">
          <div v-for="(slot, index) in form.slot_harian" :key="index" class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
            <select v-model.number="slot.hari" class="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500">
              <option v-for="hari in hariOptions" :key="hari.value" :value="hari.value">{{ hari.label }}</option>
            </select>
            <input
              v-model.number="slot.total_slot"
              type="number"
              min="1"
              max="12"
              placeholder="Jumlah slot"
              class="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button type="button" class="text-red-600 hover:text-red-800" @click="removeSlotHarian(index)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
          <p v-if="!form.slot_harian.length" class="text-sm text-gray-500">Gunakan tombol di atas untuk menambahkan aturan slot harian khusus.</p>
        </div>
      </Card>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 class="text-xl font-semibold text-gray-900">Hari Tidak Aktif</h3>
          <p class="text-sm text-gray-500">Pilih hari yang dinonaktifkan khusus kelas ini.</p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <label v-for="hari in hariOptions" :key="hari.value" class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.disabled_day" :value="hari.value" class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
              {{ hari.label }}
            </label>
          </div>
        </Card>
        <Card>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">Slot Terkunci</h3>
              <p class="text-sm text-gray-500">Pastikan mapel tertentu mengisi slot/hari tertentu.</p>
            </div>
            <BaseButton icon="fa-solid fa-plus" label="Tambah Slot" size="sm" @click="addLockedSlot" />
          </div>
          <div class="mt-4 space-y-3">
            <div v-for="(locked, index) in form.locked_slot" :key="index" class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
              <select v-model.number="locked.hari" class="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                <option v-for="hari in hariOptions" :key="hari.value" :value="hari.value">{{ hari.label }}</option>
              </select>
              <input
                v-model.number="locked.slot"
                type="number"
                min="1"
                placeholder="Slot ke-"
                class="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              />
              <select v-model="locked.mapel_id" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500">
                <option value="">Pilih Mapel</option>
                <option v-for="mapel in mapelList" :key="mapel.id" :value="mapel.kode">
                  {{ mapel.nama }} ({{ mapel.kode }})
                </option>
              </select>
              <button type="button" class="text-red-600 hover:text-red-800" @click="removeLockedSlot(index)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <p v-if="!form.locked_slot.length" class="text-sm text-gray-500">Belum ada slot terkunci.</p>
          </div>
        </Card>
      </div>

      <div class="flex justify-end">
        <BaseButton
          icon="fa-solid fa-floppy-disk"
          label="Simpan Aturan Kelas"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Card, Alert } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import kelasRulesRepository from '@/repositories/kelasRulesRepository'
import mapelRepository from '@/repositories/mapelRepository'

const props = defineProps({
  kelas: { type: Object, required: true },
  isNew: { type: Boolean, default: false }
})

const emit = defineEmits(['notify'])

const mapelList = ref([])
const alert = ref({ show: false, type: 'success', message: '' })
const saving = ref(false)
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
  { value: 6, label: 'Sabtu' }
]

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  emit('notify', { type, message })
  setTimeout(() => {
    alert.value.show = false
  }, 3500)
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getAll({ pageSize: 1000 })
    mapelList.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error('Gagal memuat mapel', error)
  }
}

const loadRules = async () => {
  if (!props.kelas?.id || props.isNew) return
  try {
    const response = await kelasRulesRepository.get(props.kelas.id)
    const data = response?.data || response
    form.value = {
      slot_harian: data.slot_harian || [],
      disabled_day: data.disabled_day || [],
      locked_slot: data.locked_slot || []
    }
  } catch (error) {
    console.error(error)
    showAlert('error', 'Gagal memuat aturan kelas')
  }
}

watch(
  () => props.kelas?.id,
  () => loadRules(),
  { immediate: true }
)

const addSlotHarian = () => {
  form.value.slot_harian.push({ hari: 1, total_slot: 8 })
}

const removeSlotHarian = (index) => {
  form.value.slot_harian.splice(index, 1)
}

const addLockedSlot = () => {
  form.value.locked_slot.push({ hari: 1, slot: 1, mapel_id: '' })
}

const removeLockedSlot = (index) => {
  form.value.locked_slot.splice(index, 1)
}

const handleSubmit = async () => {
  if (!props.kelas?.id) return
  saving.value = true
  try {
    await kelasRulesRepository.update(props.kelas.id, form.value)
    showAlert('success', 'Aturan kelas tersimpan')
  } catch (error) {
    console.error(error)
    showAlert('error', 'Gagal menyimpan aturan kelas')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMapels()
})
</script>
