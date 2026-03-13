<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Top Section: Greeting + Tahun Ajaran -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">Ringkasan data penjadwalan Anda</p>
      </div>

      <!-- Tahun Ajaran Badge -->
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
        <i class="fa-solid fa-calendar-check text-indigo-500"></i>
        <template v-if="!isEditingTahunAjaran">
          <span class="text-sm font-medium text-gray-700">{{ tahunAjaran || 'Tahun ajaran belum diatur' }}</span>
          <button
            @click="startEditTahunAjaran"
            class="text-gray-400 hover:text-indigo-600 transition-colors ml-1"
            title="Edit Tahun Ajaran"
          >
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
        </template>
        <template v-else>
          <input
            ref="tahunAjaranInput"
            v-model="tahunAjaranEdit"
            type="text"
            placeholder="cth: 2025/2026 Ganjil"
            class="border border-gray-300 rounded-md px-2.5 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-52"
            @keyup.enter="saveTahunAjaran"
            @keyup.escape="cancelEditTahunAjaran"
          />
          <button
            @click="saveTahunAjaran"
            :disabled="savingTahunAjaran"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <i v-if="savingTahunAjaran" class="fa-solid fa-spinner fa-spin text-xs"></i>
            <i v-else class="fa-solid fa-check text-xs"></i>
          </button>
          <button
            @click="cancelEditTahunAjaran"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </template>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <router-link to="/guru" class="group block">
        <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <i class="fa-solid fa-chalkboard-user text-blue-600"></i>
            </div>
            <i class="fa-solid fa-arrow-right text-gray-300 text-xs group-hover:text-blue-400 transition-colors"></i>
          </div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">
            <span v-if="loading" class="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse"></span>
            <span v-else>{{ stats.guru }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">Total Guru</p>
        </div>
      </router-link>

      <router-link to="/kelas" class="group block">
        <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-emerald-200 transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <i class="fa-solid fa-door-open text-emerald-600"></i>
            </div>
            <i class="fa-solid fa-arrow-right text-gray-300 text-xs group-hover:text-emerald-400 transition-colors"></i>
          </div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">
            <span v-if="loading" class="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse"></span>
            <span v-else>{{ stats.kelas }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">Total Kelas</p>
        </div>
      </router-link>

      <router-link to="/mapel" class="group block">
        <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-violet-200 transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <i class="fa-solid fa-book text-violet-600"></i>
            </div>
            <i class="fa-solid fa-arrow-right text-gray-300 text-xs group-hover:text-violet-400 transition-colors"></i>
          </div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">
            <span v-if="loading" class="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse"></span>
            <span v-else>{{ stats.mapel }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">Mata Pelajaran</p>
        </div>
      </router-link>

      <router-link to="/jadwal" class="group block">
        <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-amber-200 transition-all duration-200">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <i class="fa-solid fa-calendar-days text-amber-600"></i>
            </div>
            <i class="fa-solid fa-arrow-right text-gray-300 text-xs group-hover:text-amber-400 transition-colors"></i>
          </div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">
            <span v-if="loading" class="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse"></span>
            <span v-else>{{ stats.jadwal }}</span>
          </p>
          <p class="text-xs text-gray-500 mt-1">Jadwal Tersimpan</p>
        </div>
      </router-link>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Jadwal Terbaru -->
      <div class="lg:col-span-2">
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">Jadwal Terbaru</h2>
              <p class="text-xs text-gray-400 mt-0.5">Daftar jadwal yang sudah di-generate</p>
            </div>
            <router-link to="/jadwal" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              Lihat Semua →
            </router-link>
          </div>
          <div class="p-5">
            <!-- Loading State -->
            <div v-if="loadingJadwal" class="space-y-3">
              <div v-for="n in 3" :key="n" class="flex items-center gap-4 p-3 rounded-lg">
                <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
                  <div class="w-20 h-3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <!-- Empty State -->
            <div v-else-if="recentJadwal.length === 0" class="text-center py-8">
              <div class="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <i class="fa-solid fa-calendar-xmark text-gray-300 text-xl"></i>
              </div>
              <p class="text-sm text-gray-500">Belum ada jadwal</p>
              <p class="text-xs text-gray-400 mt-1">Generate jadwal pertama Anda</p>
            </div>
            <!-- Jadwal List -->
            <div v-else class="space-y-2">
              <router-link
                v-for="jdw in recentJadwal"
                :key="jdw.periode"
                :to="`/jadwal/${jdw.periode}`"
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="jdw.status === 'ready' ? 'bg-emerald-50' : 'bg-amber-50'"
                >
                  <i class="fa-solid text-sm"
                    :class="jdw.status === 'ready' ? 'fa-check-circle text-emerald-500' : 'fa-clock text-amber-500'"
                  ></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ jdw.periode }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(jdw.created_at) }}</p>
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  :class="jdw.status === 'ready'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'"
                >
                  {{ jdw.status === 'ready' ? 'Siap' : jdw.status }}
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Aksi Cepat + Info Konfigurasi -->
      <div class="space-y-6">
        <!-- Aksi Cepat -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="text-sm font-semibold text-gray-900">Aksi Cepat</h2>
          </div>
          <div class="p-3">
            <router-link
              v-for="action in quickActions"
              :key="action.href"
              :to="action.href"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                :class="action.bgClass"
              >
                <i :class="[action.icon, action.iconColor, 'text-sm']"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ action.label }}</p>
              </div>
              <i class="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:text-gray-400"></i>
            </router-link>
          </div>
        </div>

        <!-- Info Konfigurasi -->
        <div class="bg-white border border-gray-200 rounded-xl">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="text-sm font-semibold text-gray-900">Konfigurasi Aktif</h2>
            <router-link to="/konfigurasi" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
              Ubah →
            </router-link>
          </div>
          <div class="p-5 space-y-4">
            <div v-if="loadingKonfig" class="space-y-4">
              <div v-for="n in 4" :key="n" class="flex justify-between">
                <div class="w-24 h-4 bg-gray-100 rounded animate-pulse"></div>
                <div class="w-12 h-4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
            <template v-else>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">Max JP/Mapel/Minggu</span>
                <span class="text-sm font-semibold text-gray-900">{{ konfig.max_jp_per_mapel_per_minggu ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">Max JP Guru/Hari</span>
                <span class="text-sm font-semibold text-gray-900">{{ konfig.guru_max_jp_per_hari ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">Definisi JP</span>
                <span class="text-sm font-semibold text-gray-900">{{ konfig.definisi_jp?.length || 0 }} slot</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">Paket Penjurusan</span>
                <span class="text-sm font-semibold text-gray-900">{{ konfig.paket?.length || 0 }} paket</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import guruRepository from '../repositories/guruRepository'
import kelasRepository from '../repositories/kelasRepository'
import mapelRepository from '../repositories/mapelRepository'
import jadwalRepository from '../repositories/jadwalRepository'
import konfigurasiRepository from '../repositories/konfigurasiRepository'

// --- State ---
const loading = ref(true)
const loadingJadwal = ref(true)
const loadingKonfig = ref(true)

const stats = ref({ guru: 0, kelas: 0, mapel: 0, jadwal: 0 })
const recentJadwal = ref([])
const konfig = ref({})

// Tahun Ajaran
const tahunAjaran = ref('')
const tahunAjaranEdit = ref('')
const isEditingTahunAjaran = ref(false)
const savingTahunAjaran = ref(false)
const tahunAjaranInput = ref(null)

// Quick Actions config
const quickActions = [
  { href: '/guru', label: 'Kelola Guru', icon: 'fa-solid fa-chalkboard-user', iconColor: 'text-blue-600', bgClass: 'bg-blue-50 group-hover:bg-blue-100' },
  { href: '/kelas', label: 'Kelola Kelas', icon: 'fa-solid fa-door-open', iconColor: 'text-emerald-600', bgClass: 'bg-emerald-50 group-hover:bg-emerald-100' },
  { href: '/mapel', label: 'Kelola Mapel', icon: 'fa-solid fa-book', iconColor: 'text-violet-600', bgClass: 'bg-violet-50 group-hover:bg-violet-100' },
  { href: '/konfigurasi', label: 'Konfigurasi', icon: 'fa-solid fa-gear', iconColor: 'text-amber-600', bgClass: 'bg-amber-50 group-hover:bg-amber-100' },
  { href: '/jadwal', label: 'Generate Jadwal', icon: 'fa-solid fa-calendar-days', iconColor: 'text-indigo-600', bgClass: 'bg-indigo-50 group-hover:bg-indigo-100' },
]

// --- Data fetching ---

const loadStats = async () => {
  loading.value = true
  try {
    const [guruRes, kelasRes, mapelRes, jadwalRes] = await Promise.all([
      guruRepository.getReference(),
      kelasRepository.getReference(),
      mapelRepository.getReference(),
      jadwalRepository.getAll().catch(() => ({ data: [] }))
    ])
    stats.value.guru = Array.isArray(guruRes.data) ? guruRes.data.length : 0
    stats.value.kelas = Array.isArray(kelasRes.data) ? kelasRes.data.length : 0
    stats.value.mapel = Array.isArray(mapelRes.data) ? mapelRes.data.length : 0
    stats.value.jadwal = Array.isArray(jadwalRes.data) ? jadwalRes.data.length : 0
  } catch (err) {
    console.error('Error loading stats:', err)
  } finally {
    loading.value = false
  }
}

const loadRecentJadwal = async () => {
  loadingJadwal.value = true
  try {
    const res = await jadwalRepository.getAll({ sort: '-created_at', pageSize: 5 })
    recentJadwal.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Error loading jadwal:', err)
    recentJadwal.value = []
  } finally {
    loadingJadwal.value = false
  }
}

const loadKonfigurasi = async () => {
  loadingKonfig.value = true
  try {
    const response = await konfigurasiRepository.get()
    const config = response.data
    if (config) {
      tahunAjaran.value = config.tahun_ajaran || ''
      konfig.value = config
    }
  } catch (err) {
    console.error('Error loading konfigurasi:', err)
  } finally {
    loadingKonfig.value = false
  }
}

// --- Tahun Ajaran ---

const startEditTahunAjaran = async () => {
  tahunAjaranEdit.value = tahunAjaran.value
  isEditingTahunAjaran.value = true
  await nextTick()
  tahunAjaranInput.value?.focus()
}

const cancelEditTahunAjaran = () => {
  isEditingTahunAjaran.value = false
  tahunAjaranEdit.value = ''
}

const saveTahunAjaran = async () => {
  savingTahunAjaran.value = true
  try {
    await konfigurasiRepository.update({ tahun_ajaran: tahunAjaranEdit.value.trim() })
    tahunAjaran.value = tahunAjaranEdit.value.trim()
    isEditingTahunAjaran.value = false
  } catch (err) {
    console.error('Error saving tahun ajaran:', err)
  } finally {
    savingTahunAjaran.value = false
  }
}

// --- Helpers ---

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// --- Lifecycle ---
onMounted(() => {
  loadStats()
  loadRecentJadwal()
  loadKonfigurasi()
})
</script>

