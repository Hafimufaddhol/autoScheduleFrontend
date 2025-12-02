<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 uppercase tracking-wide">Data Master</p>
        <h1 class="text-3xl font-bold text-gray-900">Kelas</h1>
        <p class="mt-1 text-gray-600">Kelola info kelas, aturan, dan kebutuhan JP per mapel melalui editor halaman penuh.</p>
      </div>
      <BaseButton icon="fas fa-plus" label="Tambah Kelas" size="lg" @click="goToCreate" />
    </div>

    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 gap-4">
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="kelas-search" class="sr-only">Pencarian</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input
            v-model="searchQuery"
            type="text"
            id="kelas-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari nama / kode"
          />
        </div>
      </form>
      <p class="text-sm text-gray-500 sm:pl-4">
        Klik tombol edit di setiap baris untuk loncat langsung ke tab Info, Aturan, atau JP Mapel.
      </p>
    </div>

    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <MyTable
      :data="rows"
      :columns="columns"
      :loading="loading"
      :show-actions="false"
      :show-pagination="true"
      :current-page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :page-size="pageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="handleSort"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="setPage"
      @update:pageSize="setPageSize"
    >
      <template #cell-paket="{ row }">
        <Badge :label="row.paket || row.jurusan || 'Umum'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <ActionDropdown :kelas-id="row.id" />
          <button
            type="button"
            class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2"
            @click="handleDelete(row.id)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </template>
    </MyTable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Alert, Badge } from '@/components/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import MyTable from '@/components/ui/MyTable.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import { useRemoteTable } from '@/composables/useRemoteTable.js'
import kelasRepository from '@/repositories/kelasRepository'

const router = useRouter()

const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'kode', label: 'Kode', sortable: true },
  { key: 'paket', label: 'Paket/Jurusan', sortable: false },
  { key: 'tingkat', label: 'Tingkat', sortable: true },
  { key: 'actions', label: 'Aksi', sortable: false }
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
} = useRemoteTable((params) => kelasRepository.getAll(params))

const alert = ref({ show: false, type: 'success', message: '' })

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

const goToCreate = () => {
  router.push({ name: 'KelasInfo', params: { id: 'new' } })
}

const handleDelete = async (id) => {
  if (!id) return
  if (!confirm('Yakin ingin menghapus kelas ini? Semua aturan dan JP mapel terkait akan ikut dihapus.')) return
  try {
  await kelasRepository.delete(id)
  showAlert('success', 'Kelas berhasil dihapus')
  refresh()
  } catch (error) {
    showAlert('error', 'Gagal menghapus kelas')
    console.error(error)
  }
}

onMounted(() => {
  refresh()
})

onBeforeUnmount(() => {
  if (searchDebounce.value) {
    clearTimeout(searchDebounce.value)
  }
})
</script>
