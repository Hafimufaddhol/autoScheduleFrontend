<template>
  <div class="p-6">
    <PageHeader
      title="Konfigurasi Sistem"
      subtitle="Atur parameter global untuk penjadwalan dan kelola paket jurusan"
    />

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Form -->
    <Card>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Parameter Utama</h3>
              <p class="text-sm text-gray-500">Isi batas JP untuk seluruh mapel dan guru.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              v-model.number="form.min_jp_per_mapel_per_minggu"
              type="number"
              min="1"
              label="Min JP/Mapel/Minggu"
              required
            />
            <Input
              v-model.number="form.max_jp_per_mapel_per_minggu"
              type="number"
              min="1"
              label="Max JP/Mapel/Minggu"
              required
            />
            <Input
              v-model.number="form.guru_max_jp_per_hari"
              type="number"
              min="1"
              label="Guru Max JP/Hari"
              required
            />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Paket Jurusan</h3>
              <p class="text-sm text-gray-500">Tetapkan paket yang tersedia untuk kelas dan mapel.</p>
            </div>
          </div>
          <div class="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <div class="flex-1">
              <Input
                v-model="newPaket"
                label="Nama Paket Baru"
                placeholder="Contoh: IPA"
              />
            </div>
            <button type="button" @click="handleAddPaket" class="inline-flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm">
              <i class="fa-solid fa-plus mr-2"></i> Tambah Paket
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-if="paket.length === 0" class="text-gray-500">Belum ada paket</span>
            <span v-for="p in paket" :key="p" class="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              {{ p }}
              <button type="button" @click="handleDeletePaket(p)" class="text-red-600 hover:text-red-800"><i class="fa-solid fa-xmark"></i></button>
            </span>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Mapel Olahraga</h3>
              <p class="text-sm text-gray-500">Pilih satu mapel olahraga yang diprioritaskan ke jam pagi.</p>
            </div>
            <span class="text-sm text-gray-500">
              {{ selectedOlahragaDetails.length ? selectedOlahragaDetails[0].nama : 'Belum dipilih' }}
            </span>
          </div>
          <div class="space-y-4">
            <div class="relative" ref="olahragaDropdownRef">
              <button
                type="button"
                class="inline-flex items-center justify-between gap-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                @click.stop.prevent="toggleOlahragaDropdown"
              >
                <span>
                  {{ selectedOlahragaDetails.length ? selectedOlahragaDetails[0].nama : 'Pilih mapel olahraga' }}
                </span>
                <i :class="['fa-solid', 'fa-chevron-' + (olahragaDropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
              </button>
              <transition name="fade">
                <div
                  v-if="olahragaDropdownOpen"
                  class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  <div class="p-3 border-b border-gray-100">
                    <Input
                      v-model="olahragaSearch"
                      placeholder="Cari mapel..."
                      size="sm"
                      variant="filled"
                    />
                  </div>
                  <div class="max-h-60 overflow-y-auto">
                    <button
                      v-for="mapel in filteredOlahragaOptions"
                      :key="mapel.id"
                      type="button"
                      class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                      @click.stop.prevent="selectOlahraga(mapel.id)"
                    >
                      <div>
                        <p class="font-medium text-gray-900">{{ mapel.nama }}</p>
                        <p class="text-xs text-gray-500">{{ mapel.kode }}</p>
                      </div>
                      <i
                        v-if="selectedOlahragaId === mapel.id"
                        class="fa-solid fa-check text-cyan-600"
                      ></i>
                    </button>
                    <p v-if="!filteredOlahragaOptions.length" class="p-4 text-sm text-gray-500">Mapel tidak ditemukan.</p>
                  </div>
                </div>
              </transition>
            </div>

            <div v-if="selectedOlahragaDetails.length" class="flex flex-wrap gap-2">
              <span
                :key="`olahraga-${selectedOlahragaDetails[0].id}`"
                class="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-sm text-green-800"
              >
                {{ selectedOlahragaDetails[0].nama }} ({{ selectedOlahragaDetails[0].kode }})
                <button type="button" class="text-green-600 hover:text-green-900" @click="clearOlahraga()">
                  <i class="fa-solid fa-xmark text-xs"></i>
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-gray-400">Belum ada mapel olahraga dipilih.</p>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Default Slot Harian</h3>
              <p class="text-sm text-gray-500">Jumlah slot dasar tiap hari untuk kelas tanpa aturan khusus.</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="(slot, index) in form.default_slot_harian" :key="`slot-${index}`" class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 border border-gray-100 rounded-lg p-3">
              <div class="flex-1">
                <label class="text-xs font-medium text-gray-500">Hari</label>
                <select
                  v-model.number="slot.hari"
                  class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option :value="1">Senin</option>
                  <option :value="2">Selasa</option>
                  <option :value="3">Rabu</option>
                  <option :value="4">Kamis</option>
                  <option :value="5">Jumat</option>
                  <option :value="6">Sabtu</option>
                </select>
              </div>
              <div class="flex-1">
                <Input
                  v-model.number="slot.total_slot"
                  type="number"
                  min="1"
                  max="20"
                  label="Total Slot"
                  placeholder="Jumlah slot"
                />
              </div>
              <button
                type="button"
                @click="removeSlot(index)"
                class="text-red-600 hover:text-red-700"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addSlot"
            class="mt-3 inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium"
          >
            <i class="fa-solid fa-plus mr-2"></i> Tambah Slot Harian
          </button>
        </div>

        <!-- Definisi JP Section -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Definisi Jam Pelajaran (JP)</h3>
              <p class="text-sm text-gray-500">Tentukan waktu mulai dan selesai untuk setiap JP.</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="(jp, index) in form.definisi_jp" :key="`jp-${index}`" class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 border border-gray-100 rounded-lg p-3">
              <div class="flex-1">
                <Input
                  v-model.number="jp.jp"
                  type="number"
                  min="1"
                  label="JP ke-"
                  placeholder="1"
                />
              </div>
              <div class="flex-1">
                <Input
                  v-model="jp.mulai"
                  type="time"
                  label="Mulai"
                  placeholder="07:00"
                />
              </div>
              <div class="flex-1">
                <Input
                  v-model="jp.selesai"
                  type="time"
                  label="Selesai"
                  placeholder="07:45"
                />
              </div>
              <button
                type="button"
                @click="removeJP(index)"
                class="text-red-600 hover:text-red-700"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <p v-if="form.definisi_jp.length === 0" class="text-sm text-gray-400">Belum ada definisi JP.</p>
          </div>

          <button
            type="button"
            @click="addJP"
            class="mt-3 inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium"
          >
            <i class="fa-solid fa-plus mr-2"></i> Tambah JP
          </button>
        </div>

        <!-- Jam Istirahat Section -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Jam Istirahat</h3>
              <p class="text-sm text-gray-500">Konfigurasi jam istirahat (untuk keperluan solver).</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="(ist, index) in form.jam_istirahat" :key="`istirahat-${index}`" class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 border border-gray-100 rounded-lg p-3">
              <div class="flex-1">
                <Input
                  v-model.number="ist.mulai"
                  type="number"
                  min="1"
                  label="Setelah JP ke-"
                  placeholder="Mulai"
                />
              </div>
              <div class="flex-1">
                <Input
                  v-model.number="ist.selesai"
                  type="number"
                  min="1"
                  label="Sebelum JP ke-"
                  placeholder="Selesai"
                />
              </div>
              <button
                type="button"
                @click="removeIstirahat(index)"
                class="text-red-600 hover:text-red-700"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <p v-if="form.jam_istirahat.length === 0" class="text-sm text-gray-400">Belum ada jam istirahat.</p>
          </div>

          <button
            type="button"
            @click="addIstirahat"
            class="mt-3 inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium"
          >
            <i class="fa-solid fa-plus mr-2"></i> Tambah Jam Istirahat
          </button>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm disabled:opacity-50"
          >
            <i class="fa-solid fa-floppy-disk mr-2"></i>
            {{ submitting ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
          </button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Card, Alert, Input } from '@/components/ui'
import { PageHeader } from '@/components'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'
import mapelRepository from '@/repositories/mapelRepository'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { confirm } = useConfirmDialog()

const loading = ref(false)
const submitting = ref(false)

const form = ref({
  min_jp_per_mapel_per_minggu: 2,
  max_jp_per_mapel_per_minggu: 5,
  guru_max_jp_per_hari: 5,
  default_slot_harian: [],
  olahraga_mapel_ids: [],
  definisi_jp: [],
  jam_istirahat: []
})

const paket = ref([])
const newPaket = ref('')
const mapelOptions = ref([])
const olahragaDropdownOpen = ref(false)
const olahragaDropdownRef = ref(null)
const olahragaSearch = ref('')

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

const selectedOlahragaId = computed(() => form.value.olahraga_mapel_ids[0] || null)

const selectedOlahragaDetails = computed(() => {
  const id = selectedOlahragaId.value
  if (!id) return []
  const mapel = mapelOptions.value.find(item => item.id === id)
  return mapel ? [mapel] : []
})

const filteredOlahragaOptions = computed(() => {
  const keyword = olahragaSearch.value.trim().toLowerCase()
  if (!keyword) return mapelOptions.value
  return mapelOptions.value.filter(mapel => {
    const nama = mapel.nama?.toLowerCase() || ''
    const kode = mapel.kode?.toLowerCase() || ''
    return nama.includes(keyword) || kode.includes(keyword)
  })
})

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const normalizeSlotHarian = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map(item => ({
      hari: Number(item.hari) || 1,
      total_slot: Number(item.total_slot) || 0
    }))
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([hariKey, totalSlot]) => ({
      hari: Number(hariKey) || 1,
      total_slot: Number(totalSlot) || 0
    }))
  }
  return []
}

const normalizeOlahragaIds = (raw) => {
  if (Array.isArray(raw) && raw.length) {
    return [raw[0]]
  }
  if (typeof raw === 'string' && raw) {
    return [raw]
  }
  return []
}

const normalizeJamIstirahat = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw.map(item => ({
    mulai: Number(item.mulai) || 1,
    selesai: Number(item.selesai) || 2
  }))
}

const normalizeDefinisiJP = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw.map(item => ({
    jp: Number(item.jp) || 1,
    mulai: item.mulai || '07:00',
    selesai: item.selesai || '07:45'
  })).sort((a, b) => a.jp - b.jp)
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
      default_slot_harian: normalizeSlotHarian(data.default_slot_harian),
      olahraga_mapel_ids: normalizeOlahragaIds(data.olahraga_mapel_ids),
      definisi_jp: normalizeDefinisiJP(data.definisi_jp),
      jam_istirahat: normalizeJamIstirahat(data.jam_istirahat)
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

const fetchMapelOptions = async () => {
  try {
    const res = await mapelRepository.getAll({ pageSize: 1000 })
    const list = res?.data ?? res ?? []
    const normalized = list.map(m => ({
      id: m.id,
      nama: m.nama || m.kode || m.id,
      kode: m.kode || '-'
    }))
    mapelOptions.value = normalized
  } catch (error) {
    console.error('Error loading mapel options:', error)
    mapelOptions.value = []
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

const addJP = () => {
  const nextJP = form.value.definisi_jp.length + 1
  const lastJP = form.value.definisi_jp[form.value.definisi_jp.length - 1]
  
  // Auto-calculate next time slot (45 min after last)
  let mulai = '07:00'
  let selesai = '07:50'
  
  if (lastJP) {
    mulai = lastJP.selesai
    const [h, m] = mulai.split(':').map(Number)
    const totalMinutes = h * 60 + m + 50
    const newH = Math.floor(totalMinutes / 60)
    const newM = totalMinutes % 60
    selesai = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
  }
  
  form.value.definisi_jp.push({
    jp: nextJP,
    mulai,
    selesai
  })
}

const removeJP = (index) => {
  form.value.definisi_jp.splice(index, 1)
  // Re-number JP sequence
  form.value.definisi_jp.forEach((jp, idx) => {
    jp.jp = idx + 1
  })
}

const addIstirahat = () => {
  form.value.jam_istirahat.push({
    mulai: 4,
    selesai: 5
  })
}

const removeIstirahat = (index) => {
  form.value.jam_istirahat.splice(index, 1)
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

const toggleOlahragaDropdown = () => {
  olahragaDropdownOpen.value = !olahragaDropdownOpen.value
}

const selectOlahraga = (mapelId) => {
  form.value.olahraga_mapel_ids = mapelId ? [mapelId] : []
  olahragaDropdownOpen.value = false
}

const clearOlahraga = () => {
  form.value.olahraga_mapel_ids = []
}

const handleOlahragaClickOutside = (event) => {
  if (!olahragaDropdownOpen.value) return
  const dropdownEl = olahragaDropdownRef.value
  if (dropdownEl && !dropdownEl.contains(event.target)) {
    olahragaDropdownOpen.value = false
  }
}

onMounted(() => {
  fetchMapelOptions()
  fetchKonfigurasi()
  document.addEventListener('click', handleOlahragaClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOlahragaClickOutside)
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
  const ok = await confirm({
    title: 'Hapus Paket',
    message: `Hapus paket "${name}"? Semua mapel yang memiliki paket ini akan menjadi umum.`,
    confirmText: 'Ya, Hapus',
    variant: 'danger'
  })
  if (!ok) return
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
