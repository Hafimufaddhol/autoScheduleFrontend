<template>
  <div class="p-6">
    <PageHeader
      title="Data Mata Pelajaran"
      subtitle="Kelola mata pelajaran dengan filter paket dan tingkat tertentu"
    >
      <template #actions>
        <BaseButton
          icon="fas fa-plus"
          size="lg"
          label="Tambah Mapel"
          @click="openCreateModal"
        />
      </template>
    </PageHeader>

    <div class="mb-6 max-w-xl">
      <SearchBar
        v-model="searchQuery"
        id="mapel-search"
        placeholder="Cari nama / kode"
        label="Cari Mapel"
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

    <!-- Modal Create/Edit -->
    <Modal :isOpen="showModal" @close="closeModal" title="Form Mata Pelajaran" :showFooter="false">
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

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'paket_tertentu', label: 'Paket Tertentu', sortable: false },
  { key: 'tingkat_tertentu', label: 'Tingkat Tertentu', sortable: false },
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
} = useRemoteTable((params) => mapelRepository.getAll(params))

const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  nama: '',
  kode: '',
  paket_tertentu: [],
  tingkat_tertentu: []
})

const paketOptions = ref([])
const tingkatOptions = [10, 11, 12]

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

const fetchPaket = async () => {
  try {
    const res = await konfigurasiRepository.getPaket()
    // Do not include 'Umum' because empty selection represents umum
    paketOptions.value = Array.isArray(res.paket) ? res.paket : []
  } catch (e) {
    paketOptions.value = []
    console.error(e)
  }
}

const handleSort = ({ key }) => {
  toggleSort(key)
}

const openCreateModal = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    nama: '',
    kode: '',
    paket_tertentu: [],
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
    paket_tertentu: (mapel.paket_tertentu && mapel.paket_tertentu.length ? mapel.paket_tertentu : (mapel.jurusan_tertentu || [])),
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
    const payload = { ...form.value, jurusan_tertentu: form.value.paket_tertentu }
    if (isEdit.value) {
      await mapelRepository.update(currentId.value, payload)
      showAlert('success', 'Mapel berhasil diupdate')
    } else {
      await mapelRepository.create(payload)
      showAlert('success', 'Mapel berhasil ditambahkan')
    }

    closeModal()
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menyimpan data mapel')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const ok = await confirm({
    title: 'Hapus Mapel',
    message: 'Yakin ingin menghapus mapel ini?',
    confirmText: 'Ya, Hapus',
    variant: 'danger'
  })
  if (!ok) return

  try {
    await mapelRepository.delete(id)
    showAlert('success', 'Mapel berhasil dihapus')
    refresh()
  } catch (error) {
    showAlert('error', 'Gagal menghapus mapel')
    console.error(error)
  }
}

onMounted(() => {
  refresh()
  fetchPaket()
})

onBeforeUnmount(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>
