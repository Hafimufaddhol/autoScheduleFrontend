<template>
  <div class="p-6">
    <PageHeader
      title="Data Guru"
      subtitle="Kelola data guru dengan kompetensi dan jadwal ketersediaan"
    >
      <template #actions>
        <BaseButton
          icon="fas fa-plus"
          size="lg"
          label="Tambah Guru"
          @click="openCreateModal"
        />
      </template>
    </PageHeader>

    <div class="mb-6 max-w-xl">
      <SearchBar
        v-model="searchQuery"
        id="guru-search"
        placeholder="Cari nama / kode"
        label="Cari Guru"
      />
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Table -->
    <MyTable
      :data="rows"
      :columns="columns"
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
      <template #cell-kompetensi="{ row }">
        <div class="flex flex-wrap gap-1">
          <Badge v-for="(val, mapelId) in row.kompetensi" :key="mapelId" :label="mapelNamaMap[mapelId] || mapelId" variant="primary" />
        </div>
      </template>
      <template #cell-hari_tidak_masuk="{ row }">
        <span v-if="row.hari_tidak_masuk && row.hari_tidak_masuk.length > 0">
          {{ row.hari_tidak_masuk.join(', ') }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </MyTable>

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Guru" :showFooter="false">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <Input v-model="form.nama" label="Nama Guru" placeholder="Contoh: Budi Santoso" required />
          <Input v-model="form.kode" label="Kode Guru" placeholder="Contoh: GR-001" required />
          <Input
            v-model.number="form.max_jp_per_minggu"
            type="number"
            min="1"
            label="Max JP per Minggu"
            placeholder="Mis. 24"
            helper-text="Batas jumlah jam pelajaran guru dalam seminggu"
            required
          />
          
          <ReferenceList
            v-model="selectedKompetensi"
            type="mapel"
            :multiple="true"
            :showBadges="true"
            label="Kompetensi (Mapel)"
            helperText="Pilih mapel dengan pencarian cepat kemudian klik untuk menambah atau menghapus."
            placeholder="Pilih kompetensi mapel"
            noSelectionText="Belum ada mapel dipilih."
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hari Tidak Masuk</label>
            <div class="space-y-2">
              <div v-for="hari in hariOptions" :key="hari" class="flex items-center">
                <input
                  type="checkbox"
                  :id="'hari-' + hari"
                  :value="hari"
                  v-model="form.hari_tidak_masuk"
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
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
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { Alert, Badge, Input, Modal, SearchBar, ReferenceList } from '@/components/ui'
import { PageHeader } from '@/components'
import BaseButton from '@/components/ui/BaseButton.vue'
import MyTable from '@/components/ui/MyTable.vue'
import { useRemoteTable } from '@/composables/useRemoteTable.js'
import guruRepository from '@/repositories/guruRepository'
import mapelRepository from '@/repositories/mapelRepository'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { confirm } = useConfirmDialog()

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'max_jp_per_minggu', label: 'Max JP/Mgg', sortable: false },
  { key: 'kompetensi', label: 'Kompetensi', sortable: false },
  { key: 'hari_tidak_masuk', label: 'Hari Tidak Masuk', sortable: false },
]

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
  refresh
} = useRemoteTable((params) => guruRepository.getAll(params), )
const availableMapels = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  max_jp_per_minggu: 24,
  hari_tidak_masuk: []
})

const selectedKompetensi = ref([])

// Map mapelId to nama for display
const mapelNamaMap = computed(() => {
  const map = {}
  availableMapels.value.forEach(mapel => {
    map[mapel.id] = mapel.nama || mapel.kode || mapel.id
  })
  return map
})

const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

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

const handleSort = ({ key }) => {
  toggleSort(key)
}

const fetchMapels = async () => {
  try {
    const response = await mapelRepository.getReference()
    availableMapels.value = Array.isArray(response?.data) ? response.data : []
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
    max_jp_per_minggu: 24,
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
    max_jp_per_minggu: guru.max_jp_per_minggu ?? 24,
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
      max_jp_per_minggu: form.value.max_jp_per_minggu ? Number(form.value.max_jp_per_minggu) : null,
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
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data guru')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const ok = await confirm({
    title: 'Hapus Guru',
    message: 'Yakin ingin menghapus guru ini?',
    confirmText: 'Ya, Hapus',
    variant: 'danger'
  })
  if (!ok) return

  try {
    await guruRepository.delete(id)
    showAlert('success', 'Guru berhasil dihapus')
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menghapus guru')
    console.error(error)
  }
}

onMounted(() => {
  refresh()
  fetchMapels()
})

onBeforeUnmount(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>
