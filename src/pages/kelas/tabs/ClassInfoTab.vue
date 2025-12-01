<template>
  <div class="space-y-8">
    <section class="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 class="text-lg font-semibold text-gray-900">Identitas Kelas</h3>
        <p class="text-sm text-gray-500">Nama, kode, serta paket / jurusan menentukan filter otomatis mapel.</p>
        <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
          <Input v-model="form.nama" label="Nama Kelas" placeholder="Contoh: XI IPA 1" required />
          <Input v-model="form.kode" label="Kode Kelas" placeholder="Contoh: XI-IPA-1" required />
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Paket / Jurusan</label>
            <select
              v-model="form.paket"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              <option value="">Pilih Paket</option>
              <option v-for="paket in paketOptions" :key="paket" :value="paket">{{ paket }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Tingkat</label>
              <select
                v-model.number="form.tingkat"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                <option value="">Pilih</option>
                <option :value="10">10</option>
                <option :value="11">11</option>
                <option :value="12">12</option>
              </select>
            </div>
            <Input v-model.number="form.jumlah_murid" type="number" min="0" label="Jumlah Murid" placeholder="opsional" />
          </div>
          <Input v-model="form.wali_kelas" label="Wali Kelas" placeholder="opsional" />
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton
              type="submit"
              :loading="saving"
              label="Simpan Perubahan"
              icon="fa-solid fa-floppy-disk"
            />
          </div>
        </form>
      </Card>
      <Card class="h-fit">
        <h3 class="text-lg font-semibold text-gray-900">Catatan</h3>
        <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Nama & kode digunakan untuk pencarian dan integrasi laporan.</li>
          <li>Paket/jurusan dipakai untuk memfilter mapel relevan di tab JP Mapel.</li>
          <li>Tingkat membantu auto-generate kebutuhan JP dan validasi solver.</li>
          <li>Jumlah murid & wali kelas bersifat opsional, tersimpan di dokumen kelas.</li>
        </ul>
      </Card>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Card, Input } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import kelasRepository from '@/repositories/kelasRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'

const props = defineProps({
  kelas: { type: Object, required: true },
  isNew: { type: Boolean, default: false }
})

const emit = defineEmits(['notify', 'refresh', 'created'])

const form = ref({
  nama: '',
  kode: '',
  paket: '',
  tingkat: '',
  jumlah_murid: null,
  wali_kelas: ''
})

const paketOptions = ref(['Umum'])
const saving = ref(false)

const syncForm = () => {
  if (!props.kelas) return
  form.value = {
    nama: props.kelas.nama || '',
    kode: props.kelas.kode || '',
    paket: props.kelas.paket || props.kelas.jurusan || '',
    tingkat: props.kelas.tingkat || '',
    jumlah_murid: props.kelas.jumlah_murid ?? null,
    wali_kelas: props.kelas.wali_kelas || ''
  }
}

watch(
  () => props.kelas,
  () => syncForm(),
  { immediate: true }
)

const fetchPaketOptions = async () => {
  try {
    const response = await konfigurasiRepository.getPaket()
    const arr = Array.isArray(response?.paket) ? response.paket.slice() : []
    if (!arr.includes('Umum')) arr.unshift('Umum')
    paketOptions.value = arr
  } catch (error) {
    console.error('Gagal memuat paket', error)
  }
}

onMounted(() => {
  fetchPaketOptions()
})

const showToast = (type, message) => {
  emit('notify', { type, message })
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (props.isNew) {
      const payload = { ...form.value }
      const response = await kelasRepository.create(payload)
      showToast('success', 'Kelas baru berhasil dibuat')
      emit('created', response?.id)
    } else {
      await kelasRepository.update(props.kelas.id, form.value)
      showToast('success', 'Info kelas diperbarui')
      emit('refresh')
    }
  } catch (error) {
    console.error(error)
    showToast('error', 'Gagal menyimpan info kelas')
  } finally {
    saving.value = false
  }
}
</script>
