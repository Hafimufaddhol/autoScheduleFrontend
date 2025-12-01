<template>
  <div class="p-6 space-y-6">
    <button
      class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      type="button"
      @click="goBack"
    >
      <i class="fa-solid fa-arrow-left"></i>
      Kembali ke daftar kelas
    </button>

    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 p-6">
        <div>
          <p class="text-sm uppercase tracking-wide text-gray-400">Kelas / {{ kelasTitle }}</p>
          <h1 class="text-3xl font-bold text-gray-900">{{ headerTitle }}</h1>
          <p class="mt-1 text-gray-600" v-if="!isNew">
            Paket {{ kelasDetail?.jurusan || kelasDetail?.paket || 'Umum' }} • Tingkat {{ kelasDetail?.tingkat || '-' }}
          </p>
          <p class="mt-1 text-gray-600" v-else>
            Isi informasi dasar terlebih dahulu untuk mengaktifkan tab lainnya.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            @click="refreshKelas"
          >
            <i class="fa-solid fa-rotate"></i>
            Muat Ulang
          </button>
        </div>
      </div>

      <div class="sticky top-16 z-10 border-b border-gray-100 bg-white px-6">
        <nav class="-mb-px flex gap-4 overflow-x-auto py-3 text-sm font-medium">
          <router-link
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.to"
            class="rounded-md px-4 py-2"
            :class="[
              isActiveTab(tab.key)
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                : tab.disabled
                  ? 'text-gray-400 border border-transparent cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 border border-transparent'
            ]"
            :tabindex="tab.disabled ? -1 : 0"
            :aria-disabled="tab.disabled"
          >
            {{ tab.label }}
          </router-link>
        </nav>
      </div>

      <div class="p-6">
        <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />
        <div v-if="loading" class="flex items-center justify-center py-24 text-gray-500">
          <i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
          Memuat data kelas...
        </div>
        <router-view
          v-else
          :key="route.fullPath"
          :kelas="kelasDetail"
          :is-new="isNew"
          @notify="handleNotify"
          @refresh="refreshKelas"
          @created="handleCreated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alert } from '@/components/ui'
import kelasRepository from '@/repositories/kelasRepository'

const route = useRoute()
const router = useRouter()

const kelasDetail = ref(null)
const loading = ref(true)
const alert = ref({ show: false, type: 'success', message: '' })

const isNew = computed(() => route.params.id === 'new')
const kelasTitle = computed(() => (isNew.value ? 'Kelas Baru' : kelasDetail.value?.nama || 'Memuat...'))
const headerTitle = computed(() => (isNew.value ? 'Buat Kelas Baru' : kelasDetail.value?.nama || 'Detail Kelas'))

const tabs = computed(() => {
  const idParam = route.params.id
  return [
    { key: 'info', label: 'Info Kelas', to: { name: 'KelasInfo', params: { id: idParam } }, disabled: false },
    { key: 'aturan', label: 'Aturan Kelas', to: { name: 'KelasAturan', params: { id: idParam } }, disabled: isNew.value },
    { key: 'jp-mapel', label: 'JP Mapel', to: { name: 'KelasJPMapel', params: { id: idParam } }, disabled: isNew.value }
  ]
})

const handleNotify = ({ type, message }) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 3500)
}

const fetchKelas = async () => {
  if (isNew.value) {
    kelasDetail.value = {
      id: null,
      nama: '',
      kode: '',
      paket: '',
      jurusan: '',
      tingkat: null,
      jumlah_murid: null,
      wali_kelas: ''
    }
    loading.value = false
    return
  }
  loading.value = true
  try {
    const response = await kelasRepository.getById(route.params.id)
    kelasDetail.value = response?.data || response
  } catch (error) {
    handleNotify({ type: 'error', message: 'Kelas tidak ditemukan atau gagal dimuat' })
    console.error(error)
    router.replace('/kelas')
  } finally {
    loading.value = false
  }
}

const refreshKelas = () => {
  fetchKelas()
}

const handleCreated = (newId) => {
  if (!newId) return
  router.replace({ name: 'KelasInfo', params: { id: newId } })
}

const goBack = () => {
  router.push('/kelas')
}

const isActiveTab = (key) => {
  if (key === 'info') return route.name === 'KelasInfo'
  if (key === 'aturan') return route.name === 'KelasAturan'
  if (key === 'jp-mapel') return route.name === 'KelasJPMapel'
  return false
}

watch(
  () => route.params.id,
  () => {
    fetchKelas()
  },
  { immediate: true }
)
</script>
