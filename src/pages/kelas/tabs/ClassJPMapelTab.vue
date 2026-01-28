<template>
  <div>
    <div v-if="!kelas?.id" class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
      Simpan info kelas terlebih dahulu untuk mengatur kebutuhan JP per mapel.
    </div>

    <div v-else class="space-y-6">
      <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

      <div class="grid gap-4 ">
        <Card>
          <h3 class="text-lg font-semibold text-gray-900">Salin dari Kelas Lain</h3>
          <p class="text-sm text-gray-500">Gunakan konfigurasi JP kelas lain sebagai template instan.</p>
          <div class="mt-3 space-y-3">
            <select v-model="copySourceId" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500">
              <option value="">Pilih kelas sumber</option>
              <option v-for="kls in kelasOptions" :key="kls.id" :value="kls.id" :disabled="kls.id === kelas.id">
                {{ kls.nama }} ({{ kls.kode || kls.id }})
              </option>
            </select>
            <label class="inline-flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" v-model="overwrite" class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
              Timpa konfigurasi saat ini
            </label>
            <BaseButton
              class="ml-3"
              icon="fa-solid fa-copy"
              label="Salin konfigurasi"
              size="sm"
              :disabled="!copySourceId"
              :loading="copyLoading"
              @click="handleCopy"
            />
          </div>
        </Card>

        <!-- <Card>
          <h3 class="text-lg font-semibold text-gray-900">Auto Generate JP</h3>
          <p class="text-sm text-gray-500">Buat entry otomatis berdasarkan jurusan & tingkat mapel yang cocok.</p>
          <div class="mt-3 space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700">Fallback JP</label>
              <input
                v-model.number="autoSettings.fallback"
                type="number"
                min="1"
                class="mt-1 w-28 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <label class="inline-flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" v-model="autoSettings.onlyEmpty" class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
              Isi mapel yang belum memiliki JP saja
            </label>
            <BaseButton
              icon="fa-solid fa-wand-magic-sparkles"
              label="Generate otomatis"
              size="sm"
              :loading="autoLoading"
              @click="handleAutoGenerate"
            />
          </div>
        </Card> -->
      </div>

      <Card>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="text-2xl font-semibold text-gray-900">Daftar JP per Mapel</h3>
            <p class="text-sm text-gray-500">
              Total mapel terkonfigurasi: <span class="font-semibold text-gray-900">{{ totalConfigured }}</span> · Total JP/minggu:
              <span class="font-semibold text-gray-900">{{ totalJp }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="search"
              type="text"
              placeholder="Cari mapel / kode"
              class="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
            <BaseButton
              icon="fa-solid fa-plus"
              label="Tambah Mapel"
              size="sm"
              :disabled="isAdding || addLoading"
              @click="startAdd"
            />
          </div>
        </div>

        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mapel</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kode</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">JP/Minggu</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="isAdding" class="bg-cyan-50">
                <td class="px-4 py-3">
                  <div class="space-y-2">
                    <div class="relative" @keydown.escape.prevent="closeDropdown">
                      <input
                        ref="mapelInputRef"
                        v-model="mapelSearch"
                        type="text"
                        placeholder="Ketik nama atau kode mapel"
                        class="w-full rounded-lg border border-cyan-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                        @focus="openDropdown"
                        @input="handleMapelSearch"
                        @blur="scheduleDropdownClose"
                      />
                      <div
                        v-if="dropdownOpen"
                        class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                      >
                        <button
                          v-for="option in filteredMapelOptions"
                          :key="option.id"
                          type="button"
                          class="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-cyan-50"
                          @mousedown.prevent="selectMapel(option)"
                        >
                          <span class="font-medium text-gray-900">{{ option.nama || option.name }}</span>
                          <span class="text-xs text-gray-500">({{ option.kode || option.id }})</span>
                        </button>
                        <p v-if="!filteredMapelOptions.length" class="px-3 py-2 text-sm text-gray-500">Mapel tidak ditemukan / sudah dipakai.</p>
                      </div>
                    </div>
                    <p v-if="newEntry.mapel" class="text-xs text-gray-500">
                      Dipilih: {{ newEntry.mapel.nama || newEntry.mapel.name }} ({{ newEntry.mapel.kode || newEntry.mapel.id }})
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">-</td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="newEntry.jp"
                    type="number"
                    min="1"
                    placeholder="JP"
                    class="w-24 rounded-lg border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-cyan-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">Baru</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                      :disabled="addLoading"
                      @click="saveNewEntry"
                    >
                      <i class="fa-solid fa-check"></i>
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                      :disabled="addLoading"
                      @click="cancelAdd"
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-for="row in filteredRows" :key="row.entryId" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ row.nama }}</p>
                  <p class="text-xs text-gray-500">{{ row.jurusanLabel }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ row.kode || '-' }}</td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="row.jp_per_minggu"
                    type="number"
                    min="1"
                    class="w-24 rounded-lg border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-cyan-500"
                    @input="handleJpChange(row)"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" :class="statusClass(row)">
                    <template v-if="row.saving">Menyimpan...</template>
                    <template v-else-if="row.status === 'saved'">Tersimpan</template>
                    <template v-else-if="row.status === 'dirty'">Belum disimpan</template>
                    <template v-else-if="row.status === 'error'">Gagal</template>
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                    :disabled="row.saving"
                    @click="deleteRow(row)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loading" class="mt-4 text-center text-sm text-gray-500">Memuat data...</div>
        <div v-else-if="!filteredRows.length && !isAdding" class="mt-4 text-center text-sm text-gray-500">Belum ada mapel yang dikonfigurasi.</div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Card, Alert } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import mapelRepository from '@/repositories/mapelRepository'
import kelasRepository from '@/repositories/kelasRepository'
import kelasMapelJpRepository from '@/repositories/kelasMapelJpRepository'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { confirm } = useConfirmDialog()

const props = defineProps({
  kelas: { type: Object, required: true },
  isNew: { type: Boolean, default: false }
})

const emit = defineEmits(['notify'])

const alert = ref({ show: false, type: 'success', message: '' })
const search = ref('')
const kelasOptions = ref([])
const mapelMaster = ref([])
const rows = ref([])
const loading = ref(false)
const overwrite = ref(true)
const copySourceId = ref('')
const copyLoading = ref(false)
const autoSettings = ref({ fallback: 2, onlyEmpty: true })
const autoLoading = ref(false)
const debounceMap = new Map()

const isAdding = ref(false)
const addLoading = ref(false)
const mapelSearch = ref('')
const dropdownOpen = ref(false)
const dropdownCloseTimer = ref(null)
const mapelInputRef = ref(null)
const newEntry = ref({ mapel: null, jp: '' })

const totalConfigured = computed(() => rows.value.length)
const totalJp = computed(() => rows.value.reduce((sum, row) => sum + (Number(row.jp_per_minggu) || 0), 0))
const mapelMap = computed(() => {
  const obj = {}
  mapelMaster.value.forEach(mp => {
    obj[mp.id] = mp
  })
  return obj
})

const usedMapelIds = computed(() => new Set(rows.value.map(row => row.mapel_id)))
const availableMapels = computed(() => mapelMaster.value.filter(mp => !usedMapelIds.value.has(mp.id)))
const filteredMapelOptions = computed(() => {
  const keyword = mapelSearch.value.trim().toLowerCase()
  if (!keyword) return availableMapels.value.slice(0, 10)
  return availableMapels.value
    .filter(mp => {
      const name = (mp.nama || mp.name || '').toLowerCase()
      const code = (mp.kode || mp.id || '').toLowerCase()
      return name.includes(keyword) || code.includes(keyword)
    })
    .slice(0, 10)
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return rows.value
  return rows.value.filter(row => {
    return (
      row.nama?.toLowerCase().includes(keyword) ||
      (row.kode || '').toLowerCase().includes(keyword)
    )
  })
})

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  emit('notify', { type, message })
  setTimeout(() => {
    alert.value.show = false
  }, 3200)
}

const statusClass = (row) => {
  if (row.saving) return 'bg-cyan-100 text-cyan-800'
  if (row.status === 'saved') return 'bg-emerald-100 text-emerald-800'
  if (row.status === 'dirty') return 'bg-amber-100 text-amber-800'
  if (row.status === 'error') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-600'
}

const hydrateRows = (pairs = []) => {
  rows.value = pairs.map(entry => {
    const mp = mapelMap.value[entry.mapel_id] || {}
    const jurusan = mp.jurusan_tertentu || mp.paket_tertentu || []
    return {
      entryId: entry.id,
      mapel_id: entry.mapel_id,
      nama: mp.nama || mp.name || entry.mapel_id,
      kode: mp.kode || mp.id || entry.mapel_id,
      jurusanLabel: jurusan.length ? jurusan.join(', ') : 'Semua jurusan',
      jp_per_minggu: entry.jp_per_minggu,
      status: 'saved',
      saving: false
    }
  })
}

const fetchKelasOptions = async () => {
  try {
    const response = await kelasRepository.getAll({ pageSize: 200 })
    kelasOptions.value = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  } catch (error) {
    console.error('Gagal memuat daftar kelas', error)
  }
}

const fetchMapelMaster = async () => {
  if (mapelMaster.value.length) return
  try {
    const response = await mapelRepository.getAll({ pageSize: 1000 })
    mapelMaster.value = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
  } catch (error) {
    showAlert('error', 'Gagal memuat data mapel')
    console.error(error)
  }
}

const fetchPairs = async () => {
  if (!props.kelas?.id || props.isNew) return
  loading.value = true
  try {
    await fetchMapelMaster()
  const response = await kelasMapelJpRepository.list({ kelasId: props.kelas.id, legacy: true })
    const pairs = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
    hydrateRows(pairs)
  } catch (error) {
    showAlert('error', 'Gagal memuat data JP mapel')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleJpChange = (row) => {
  row.status = 'dirty'
  row.saving = false
  if (debounceMap.has(row.mapel_id)) {
    clearTimeout(debounceMap.get(row.mapel_id))
  }
  debounceMap.set(row.mapel_id, setTimeout(() => saveRow(row), 700))
}

const saveRow = async (row) => {
  if (!props.kelas?.id || !row.entryId) return
  const value = Number(row.jp_per_minggu)
  if (!value || value < 1) {
    row.status = 'error'
    showAlert('error', 'JP minimal 1 jam per minggu')
    return
  }
  row.saving = true
  try {
    await kelasMapelJpRepository.update(row.entryId, {
      kelas_id: props.kelas.id,
      mapel_id: row.mapel_id,
      jp_per_minggu: value
    })
    row.status = 'saved'
  } catch (error) {
    row.status = 'error'
    console.error(error)
    showAlert('error', `Gagal menyimpan JP untuk ${row.nama}`)
  } finally {
    row.saving = false
  }
}

const deleteRow = async (row) => {
  if (!row.entryId) return
  const ok = await confirm({
    title: 'Hapus JP Mapel',
    message: `Hapus JP mapel ${row.nama}?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger'
  })
  if (!ok) return
  row.saving = true
  try {
    await kelasMapelJpRepository.delete(row.entryId)
    showAlert('success', 'JP mapel dihapus')
    await fetchPairs()
  } catch (error) {
    row.saving = false
    showAlert('error', 'Gagal menghapus JP mapel')
    console.error(error)
  }
}

const startAdd = () => {
  isAdding.value = true
  addLoading.value = false
  mapelSearch.value = ''
  newEntry.value = { mapel: null, jp: '' }
  dropdownOpen.value = true
  nextTickFocus()
}

const nextTickFocus = () => {
  requestAnimationFrame(() => {
    mapelInputRef.value?.focus()
  })
}

const cancelAdd = () => {
  isAdding.value = false
  addLoading.value = false
  newEntry.value = { mapel: null, jp: '' }
  mapelSearch.value = ''
  closeDropdown()
}

const openDropdown = () => {
  if (!isAdding.value) return
  dropdownOpen.value = true
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value)
    dropdownCloseTimer.value = null
  }
}

const scheduleDropdownClose = () => {
  dropdownCloseTimer.value = setTimeout(() => {
    dropdownOpen.value = false
  }, 150)
}

const closeDropdown = () => {
  dropdownOpen.value = false
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value)
    dropdownCloseTimer.value = null
  }
}

const handleMapelSearch = () => {
  if (!isAdding.value) return
  newEntry.value.mapel = null
  openDropdown()
}

const selectMapel = (option) => {
  newEntry.value.mapel = option
  mapelSearch.value = `${option.nama || option.name} (${option.kode || option.id})`
  closeDropdown()
}

const saveNewEntry = async () => {
  if (!props.kelas?.id) return
  if (!newEntry.value.mapel) {
    showAlert('error', 'Pilih mapel terlebih dahulu')
    return
  }
  const jpValue = Number(newEntry.value.jp)
  if (!jpValue || jpValue < 1) {
    showAlert('error', 'JP minimal 1 jam per minggu')
    return
  }
  addLoading.value = true
  try {
    await kelasMapelJpRepository.create({
      kelas_id: props.kelas.id,
      mapel_id: newEntry.value.mapel.id,
      jp_per_minggu: jpValue
    })
    showAlert('success', 'JP mapel ditambahkan')
    cancelAdd()
    await fetchPairs()
  } catch (error) {
    addLoading.value = false
    console.error(error)
    showAlert('error', 'Gagal menambahkan JP mapel')
  }
}

const handleCopy = async () => {
  if (!copySourceId.value || !props.kelas?.id) return
  copyLoading.value = true
  try {
    await kelasMapelJpRepository.bulkCopy({
      source_kelas_id: copySourceId.value,
      target_kelas_ids: [props.kelas.id],
      overwrite: overwrite.value
    })
    showAlert('success', 'Konfigurasi berhasil disalin')
    await fetchPairs()
  } catch (error) {
    showAlert('error', 'Gagal menyalin konfigurasi')
    console.error(error)
  } finally {
    copyLoading.value = false
  }
}

const handleAutoGenerate = async () => {
  if (!props.kelas?.id) return
  autoLoading.value = true
  try {
    await kelasMapelJpRepository.autoGenerate({
      kelas_id: props.kelas.id,
      fallback_jp: autoSettings.value.fallback,
      only_empty: autoSettings.value.onlyEmpty
    })
    showAlert('success', 'JP otomatis berhasil dibuat')
    await fetchPairs()
  } catch (error) {
    console.error(error)
    showAlert('error', 'Gagal menjalankan auto generate')
  } finally {
    autoLoading.value = false
  }
}

watch(
  () => props.kelas?.id,
  (newId) => {
    if (newId && newId !== 'new') {
      fetchPairs()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await Promise.all([fetchKelasOptions(), fetchPairs()])
})

onBeforeUnmount(() => {
  debounceMap.forEach(timeoutId => clearTimeout(timeoutId))
  debounceMap.clear()
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value)
  }
})
</script>
