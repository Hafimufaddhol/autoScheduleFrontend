<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">Selamat datang di Sistem Penjadwalan Otomatis</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm">Total Guru</p>
            <h3 class="text-3xl font-bold mt-1">{{ stats.guru }}</h3>
          </div>
          <div class="bg-white bg-opacity-20 rounded-full p-4">
            <i class="fa-solid fa-chalkboard-user text-3xl"></i>
          </div>
        </div>
      </Card>

      <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm">Total Kelas</p>
            <h3 class="text-3xl font-bold mt-1">{{ stats.kelas }}</h3>
          </div>
          <div class="bg-white bg-opacity-20 rounded-full p-4">
            <i class="fa-solid fa-door-open text-3xl"></i>
          </div>
        </div>
      </Card>

      <Card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100 text-sm">Mata Pelajaran</p>
            <h3 class="text-3xl font-bold mt-1">{{ stats.mapel }}</h3>
          </div>
          <div class="bg-white bg-opacity-20 rounded-full p-4">
            <i class="fa-solid fa-book text-3xl"></i>
          </div>
        </div>
      </Card>

      <Card class="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm">Jadwal Aktif</p>
            <h3 class="text-3xl font-bold mt-1">{{ stats.jadwal }}</h3>
          </div>
          <div class="bg-white bg-opacity-20 rounded-full p-4">
            <i class="fa-solid fa-calendar-days text-3xl"></i>
          </div>
        </div>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          @click="$router.push('/guru')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
        >
          <div class="bg-blue-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-chalkboard-user text-blue-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Kelola Guru</p>
            <p class="text-sm text-gray-600">Tambah atau edit data guru</p>
          </div>
        </button>

        <button
          @click="$router.push('/kelas')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
        >
          <div class="bg-green-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-door-open text-green-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Kelola Kelas</p>
            <p class="text-sm text-gray-600">Tambah atau edit data kelas</p>
          </div>
        </button>

        <button
          @click="$router.push('/mapel')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
        >
          <div class="bg-purple-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-book text-purple-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Kelola Mapel</p>
            <p class="text-sm text-gray-600">Tambah atau edit mata pelajaran</p>
          </div>
        </button>

        <button
          @click="$router.push('/konfigurasi')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-yellow-300"
        >
          <div class="bg-yellow-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-gear text-yellow-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Konfigurasi</p>
            <p class="text-sm text-gray-600">Setting sistem penjadwalan</p>
          </div>
        </button>

        <button
          @click="$router.push('/kelas-rules')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-red-300"
        >
          <div class="bg-red-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-list-check text-red-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Rules Kelas</p>
            <p class="text-sm text-gray-600">Atur rules per kelas</p>
          </div>
        </button>

        <button
          @click="$router.push('/jadwal')"
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-indigo-300"
        >
          <div class="bg-indigo-100 rounded-lg p-3 mr-4">
            <i class="fa-solid fa-calendar-days text-indigo-600 text-xl"></i>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-900">Generate Jadwal</p>
            <p class="text-sm text-gray-600">Buat jadwal otomatis</p>
          </div>
        </button>
      </div>
    </div>

    <!-- System Info -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Informasi Sistem</h3>
      </template>
      <div class="space-y-3">
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-gray-600">Max JP Guru Per Minggu</span>
          <span class="font-semibold text-gray-900">{{ konfigurasi.max_jp_per_guru || '-' }}</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-gray-600">Default Slot Per Hari</span>
          <span class="font-semibold text-gray-900">{{ konfigurasi.default_slot_per_hari || '-' }}</span>
        </div>
        <div class="flex items-center justify-between py-2">
          <span class="text-gray-600">Hari Kerja</span>
          <span class="font-semibold text-gray-900">{{ konfigurasi.hari_kerja?.join(', ') || '-' }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card } from '../components/ui'
import guruRepository from '../repositories/guruRepository'
import kelasRepository from '../repositories/kelasRepository'
import mapelRepository from '../repositories/mapelRepository'
import konfigurasiRepository from '../repositories/konfigurasiRepository'
import jadwalRepository from '../repositories/jadwalRepository'

// Reactive data
const stats = ref({
  guru: 0,
  kelas: 0,
  mapel: 0,
  jadwal: 0
})

const konfigurasi = ref({
  max_jp_per_guru: null,
  default_slot_per_hari: null,
  hari_kerja: []
})

// Methods
const loadStats = async () => {
  try {
    // Fetch guru count
    const guruResponse = await guruRepository.getAll()
    stats.value.guru = Array.isArray(guruResponse.data) ? guruResponse.data.length : 0

    // Fetch kelas count
    const kelasResponse = await kelasRepository.getAll()
    stats.value.kelas = Array.isArray(kelasResponse.data) ? kelasResponse.data.length : 0

    // Fetch mapel count
    const mapelResponse = await mapelRepository.getAll()
    stats.value.mapel = Array.isArray(mapelResponse.data) ? mapelResponse.data.length : 0

    // Fetch jadwal count
    const jadwalResponse = await jadwalRepository.getAll()
    stats.value.jadwal = Array.isArray(jadwalResponse.data) ? jadwalResponse.data.length : 0
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadKonfigurasi = async () => {
  try {
    const response = await konfigurasiRepository.get()
    if (response.data) {
      konfigurasi.value = response.data
    }
  } catch (error) {
    console.error('Error loading konfigurasi:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadKonfigurasi()
})
</script>

<script>
// Icon components
export const CurrencyDollarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
    </svg>
  `
}

export const ShoppingBagIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
    </svg>
  `
}

export const UsersIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
    </svg>
  `
}

export const ChartBarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  `
}
</script>

