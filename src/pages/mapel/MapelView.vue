<template>
  <div class="p-6">
    <PageHeader
      title="Data Mata Pelajaran"
      subtitle="Kelola mata pelajaran dan jam khusus"
    >
      <template #actions>
        <BaseButton
          icon="fas fa-plus"
          size="lg"
          :label="activeTab === 'mapel' ? 'Tambah Mapel' : 'Tambah Jam Khusus'"
          @click="openCreateModal"
        />
      </template>
    </PageHeader>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-6" aria-label="Tabs">
        <button
          id="tab-mapel"
          type="button"
          class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="activeTab === 'mapel'
            ? 'border-cyan-500 text-cyan-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          @click="switchTab('mapel')"
        >
          <i class="fa-solid fa-book mr-2"></i>Mapel Biasa
        </button>
        <button
          id="tab-jam-khusus"
          type="button"
          class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="activeTab === 'jam_khusus'
            ? 'border-cyan-500 text-cyan-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          @click="switchTab('jam_khusus')"
        >
          <i class="fa-solid fa-clock mr-2"></i>Jam Khusus
        </button>
      </nav>
    </div>

    <div class="mb-6 max-w-xl">
      <SearchBar
        v-model="searchQuery"
        id="mapel-search"
        placeholder="Cari nama / kode"
        label="Cari"
      />
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table: Mapel Biasa -->
    <MyTable
      v-if="activeTab === 'mapel'"
      :data="rows"
      :columns="mapelColumns"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      :current-page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :page-size="pageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="handleSort"
      @edit="openEditModal"
      @delete="handleDelete"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="setPage"
      @update:pageSize="setPageSize"
    >
      <template #cell-kode="{ row }">
        <Badge :label="row.kode" variant="primary" />
      </template>
      <template #cell-paket_tertentu="{ row }">
        <span v-if="(row.paket_tertentu && row.paket_tertentu.length) || (row.jurusan_tertentu && row.jurusan_tertentu.length)">
          <Badge
            v-for="jur in (row.paket_tertentu && row.paket_tertentu.length ? row.paket_tertentu : row.jurusan_tertentu)"
            :key="jur"
            :label="jur"
            variant="success"
            class="mr-1"
          />
        </span>
        <span v-else class="text-gray-400">Semua</span>
      </template>
      <template #cell-tingkat_tertentu="{ row }">
        <span v-if="row.tingkat_tertentu && row.tingkat_tertentu.length > 0">
          {{ row.tingkat_tertentu.join(', ') }}
        </span>
        <span v-else class="text-gray-400">Semua</span>
      </template>
    </MyTable>

    <!-- Table: Jam Khusus -->
    <MyTable
      v-if="activeTab === 'jam_khusus'"
      :data="rows"
      :columns="jamKhususColumns"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      :current-page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :page-size="pageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="handleSort"
      @edit="openEditModal"
      @delete="handleDelete"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="setPage"
      @update:pageSize="setPageSize"
    >
      <template #cell-kode="{ row }">
        <Badge :label="row.kode" variant="primary" />
      </template>
      <template #cell-hari_khusus="{ row }">
        <Badge :label="row.hari_khusus || '-'" variant="warning" />
      </template>
      <template #cell-slot_khusus="{ row }">
        <span class="font-semibold">Jam ke-{{ row.slot_khusus || 1 }}</span>
      </template>
      <template #cell-durasi_khusus="{ row }">
        {{ row.durasi_khusus || 1 }} JP
      </template>
    </MyTable>

    <!-- Modal Create/Edit: Mapel Biasa -->
    <Modal :isOpen="showModal && activeTab === 'mapel'" @close="closeModal" title="Form Mata Pelajaran" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Mapel" placeholder="Contoh: Matematika" required />
          <Input v-model="form.kode" label="Kode Mapel" placeholder="Contoh: MATH" required />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Paket Tertentu</label>
            <p class="text-xs text-gray-500 mb-2">Kosongkan jika untuk semua paket</p>
            <div class="space-y-2">
              <div v-for="jur in paketOptions" :key="jur" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'jur-' + jur"
                  :value="jur"
                  v-model="form.paket_tertentu"
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
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
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
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
            class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal Create/Edit: Jam Khusus -->
    <Modal :isOpen="showModal && activeTab === 'jam_khusus'" @close="closeModal" title="Form Jam Khusus" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Kegiatan" placeholder="Contoh: Sholat Dhuha" required />
          <Input v-model="form.kode" label="Kode" placeholder="Contoh: SHDH" required />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hari</label>
            <select
              v-model="form.hari_khusus"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="" disabled>Pilih hari</option>
              <option v-for="h in hariOptions" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jam Ke- (Slot)</label>
              <input
                type="number"
                v-model.number="form.slot_khusus"
                min="1"
                required
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p class="text-xs text-gray-500 mt-1">Posisi slot di hari tersebut (1 = jam pertama)</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Durasi (JP)</label>
              <input
                type="number"
                v-model.number="form.durasi_khusus"
                min="1"
                required
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p class="text-xs text-gray-500 mt-1">Berapa JP yang di-reserve</p>
            </div>
          </div>

          <div class="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p class="text-sm text-amber-800">
              <i class="fa-solid fa-circle-info mr-1"></i>
              Jam khusus akan otomatis di-reserve untuk <strong>seluruh kelas</strong> pada hari dan slot yang dipilih saat penjadwalan.
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
          >
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Alert, Badge, Input, Modal, SearchBar } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import MyTable from '@/components/ui/MyTable.vue'
import { PageHeader } from '@/components'
import { useRemoteTable } from '@/composables/useRemoteTable.js'
import mapelRepository from '@/repositories/mapelRepository'
import konfigurasiRepository from '@/repositories/konfigurasiRepository'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { confirm } = useConfirmDialog()

// --- Tab state ---
const activeTab = ref('mapel')

// --- Columns per tab ---
const mapelColumns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'paket_tertentu', label: 'Paket Tertentu', sortable: false },
  { key: 'tingkat_tertentu', label: 'Tingkat Tertentu', sortable: false },
]

const jamKhususColumns = [
  { key: 'nama', label: 'Nama Kegiatan', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'hari_khusus', label: 'Hari', sortable: true },
  { key: 'slot_khusus', label: 'Jam Ke-', sortable: true },
  { key: 'durasi_khusus', label: 'Durasi', sortable: false },
]

// --- Remote table ---
const searchQuery = ref('')
const searchDebounce = ref(null)
const {
  rows,
  loading,
  page,
  pageSize,
  totalPages,
  totalItems,
  sortBy,
  sortOrder,
  setPage,
  nextPage,
  previousPage,
  setPageSize,
  setSearchValue,
  toggleSort,
  setFilter,
  refresh
} = useRemoteTable((params) => mapelRepository.getAll(params), {
  filters: { is_jam_khusus: 'false' },
})

// --- Hari options (fetched from konfigurasi) ---
const hariOptions = ref(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])

const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  paket_tertentu: [],
  tingkat_tertentu: [],
  // Jam khusus fields
  hari_khusus: '',
  slot_khusus: 1,
  durasi_khusus: 1,
})

const paketOptions = ref([])
const tingkatOptions = [10, 11, 12]

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

// --- Tab switching ---
const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  setFilter('is_jam_khusus', tab === 'jam_khusus' ? 'true' : 'false')
}

watch(searchQuery, (value) => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
  searchDebounce.value = setTimeout(() => {
    setSearchValue(value)
  }, 600)
})

const showAlert = (type, message) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const fetchPaket = async () => {
  try {
    const res = await konfigurasiRepository.getPaket()
    paketOptions.value = Array.isArray(res.paket) ? res.paket : []
  } catch (e) {
    paketOptions.value = []
    console.error(e)
  }
}

const fetchHariOptions = async () => {
  try {
    const res = await konfigurasiRepository.get()
    const data = res?.data || res
    if (data?.hari && Array.isArray(data.hari)) {
      hariOptions.value = data.hari
    }
  } catch (e) {
    console.error(e)
  }
}

const handleSort = ({ key }) => {
  toggleSort(key)
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  if (activeTab.value === 'mapel') {
    form.value = {
      nama: '',
      kode: '',
      paket_tertentu: [],
      tingkat_tertentu: [],
      hari_khusus: '',
      slot_khusus: 1,
      durasi_khusus: 1,
    }
  } else {
    form.value = {
      nama: '',
      kode: '',
      paket_tertentu: [],
      tingkat_tertentu: [],
      hari_khusus: '',
      slot_khusus: 1,
      durasi_khusus: 1,
    }
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  currentId.value = item.id
  if (activeTab.value === 'mapel') {
    form.value = {
      nama: item.nama,
      kode: item.kode,
      paket_tertentu: (item.paket_tertentu && item.paket_tertentu.length ? item.paket_tertentu : (item.jurusan_tertentu || [])),
      tingkat_tertentu: item.tingkat_tertentu || [],
      hari_khusus: '',
      slot_khusus: 1,
      durasi_khusus: 1,
    }
  } else {
    form.value = {
      nama: item.nama,
      kode: item.kode,
      paket_tertentu: [],
      tingkat_tertentu: [],
      hari_khusus: item.hari_khusus || '',
      slot_khusus: item.slot_khusus || 1,
      durasi_khusus: item.durasi_khusus || 1,
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    let payload
    if (activeTab.value === 'jam_khusus') {
      payload = {
        nama: form.value.nama,
        kode: form.value.kode,
        is_jam_khusus: true,
        hari_khusus: form.value.hari_khusus,
        slot_khusus: form.value.slot_khusus,
        durasi_khusus: form.value.durasi_khusus,
      }
    } else {
      payload = {
        nama: form.value.nama,
        kode: form.value.kode,
        is_jam_khusus: false,
        jurusan_tertentu: form.value.paket_tertentu,
        paket_tertentu: form.value.paket_tertentu,
        tingkat_tertentu: form.value.tingkat_tertentu,
      }
    }

    if (isEdit.value) {
      await mapelRepository.update(currentId.value, payload)
      showAlert('success', activeTab.value === 'jam_khusus' ? 'Jam khusus berhasil diupdate' : 'Mapel berhasil diupdate')
    } else {
      await mapelRepository.create(payload)
      showAlert('success', activeTab.value === 'jam_khusus' ? 'Jam khusus berhasil ditambahkan' : 'Mapel berhasil ditambahkan')
    }

    closeModal()
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const label = activeTab.value === 'jam_khusus' ? 'jam khusus' : 'mapel'
  const ok = await confirm({
    title: `Hapus ${label}`,
    message: `Yakin ingin menghapus ${label} ini?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger'
  })
  if (!ok) return

  try {
    await mapelRepository.delete(id)
    showAlert('success', `${label.charAt(0).toUpperCase() + label.slice(1)} berhasil dihapus`)
    refresh()
  } catch (error) {
    showAlert('error', `Gagal menghapus ${label}`)
    console.error(error)
  }
}

onMounted(() => {
  fetchPaket()
  fetchHariOptions()
})

onBeforeUnmount(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>
