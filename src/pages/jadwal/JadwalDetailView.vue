<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="text-gray-600 hover:text-gray-900">
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Jadwal: {{ periode }}</h1>
          <p class="mt-2 text-gray-600">Detail jadwal pelajaran</p>
        </div>
      </div>

      <!-- Export PDF Dropdown -->
      <div v-if="jadwalStatus?.status === 'ready'" class="relative" ref="exportDropdownRef">
        <button
          @click="toggleExportDropdown"
          :disabled="exporting"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium text-sm shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i :class="exporting ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'" class="text-sm"></i>
          <span>{{ exporting ? 'Mengekspor...' : 'Ekspor PDF' }}</span>
          <i v-if="!exporting" class="fas fa-chevron-down text-xs ml-1"></i>
        </button>
        <transition name="fade">
          <div
            v-if="exportDropdownOpen && !exporting"
            class="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <button
              @click="handleExportPdf('hari')"
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 rounded-t-xl"
            >
              <i class="fas fa-calendar-day text-cyan-600 w-4"></i>
              <span>Per Hari</span>
            </button>
            <button
              @click="handleExportPdf('kelas')"
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
            >
              <i class="fas fa-school text-cyan-600 w-4"></i>
              <span>Per Kelas</span>
            </button>
            <button
              @click="handleExportPdf('guru')"
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 rounded-b-xl"
            >
              <i class="fas fa-chalkboard-teacher text-cyan-600 w-4"></i>
              <span>Per Guru</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Status Bar -->
    <div v-if="jadwalStatus" class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div class="flex items-center gap-4">
        <span class="font-semibold text-gray-700">Status:</span>
        <Badge 
          :label="jadwalStatus.status" 
          :variant="getStatusVariant(jadwalStatus.status)"
        />
        <span v-if="jadwalStatus.created_at" class="text-gray-500 ml-auto">
          <i class="far fa-clock mr-2"></i>
          Dibuat: {{ formatDate(jadwalStatus.created_at) }}
        </span>
      </div>
    </div>

    <!-- Loading State (Initial) -->
    <div v-if="loadingStatus" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-cyan-600"></i>
      <p class="mt-4 text-gray-600">Memuat jadwal...</p>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" type="error" :message="error" @close="error = ''" />

    <!-- Tabs -->
    <div v-else-if="jadwalStatus?.status === 'ready'" class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <button
            @click="switchTab('overview')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-chart-pie mr-2"></i>
            Overview
          </button>
          <button
            @click="switchTab('hari')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'hari'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-calendar-day mr-2"></i>
            Per Hari
          </button>
          <button
            @click="switchTab('kelas')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'kelas'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-school mr-2"></i>
            Per Kelas
          </button>
          <button
            @click="switchTab('guru')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'guru'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-chalkboard-teacher mr-2"></i>
            Per Guru
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="mt-6">
        <OverviewTab v-show="activeTab === 'overview'" />
        <HariTab v-show="activeTab === 'hari'" @open-edit="openEditModal" />
        <KelasTab v-show="activeTab === 'kelas'" />
        <GuruTab v-show="activeTab === 'guru'" />
      </div>
    </div>

    <!-- Pending State -->
    <div v-else-if="jadwalStatus?.status === 'pending'" 
         class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-8 rounded text-center">
      <i class="fas fa-clock text-3xl mb-2"></i>
      <p>Jadwal sedang diproses. Silakan refresh halaman setelah beberapa saat.</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="jadwalStatus?.status === 'not_found'" 
         class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
      <i class="fas fa-question-circle text-3xl mb-2"></i>
      <p>Jadwal tidak ditemukan untuk periode ini.</p>
    </div>

    <!-- Edit Modal -->
    <EditModal 
      :show="showEditModal" 
      :block="editBlock" 
      @close="closeEditModal" 
      @saved="handleEditSaved" 
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Badge from '@/components/ui/Badge.vue';
import Alert from '@/components/ui/Alert.vue';
import OverviewTab from './tabs/OverviewTab.vue';
import HariTab from './tabs/HariTab.vue';
import KelasTab from './tabs/KelasTab.vue';
import GuruTab from './tabs/GuruTab.vue';
import EditModal from './components/EditModal.vue';
import { useJadwalDetail } from './composables/useJadwalDetail';
import jadwalRepository from '@/repositories/jadwalRepository';

export default {
  name: 'JadwalDetailView',
  components: {
    Badge,
    Alert,
    OverviewTab,
    HariTab,
    KelasTab,
    GuruTab,
    EditModal
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const {
      periode,
      loadingStatus,
      error,
      jadwalStatus,
      currentItems,
      selectedKelas,
      selectedGuru,
      initPeriode,
      loadKonfigurasi,
      loadReferences,
      loadJadwalStatus,
      loadHariItems,
      loadKelasItems,
      loadGuruItems,
      getStatusVariant,
      formatDate,
      resetState
    } = useJadwalDetail();
    
    // Tab state
    const activeTab = ref('overview');
    
    // Edit modal states
    const showEditModal = ref(false);
    const editBlock = ref(null);

    // Export PDF states
    const exporting = ref(false);
    const exportDropdownOpen = ref(false);
    const exportDropdownRef = ref(null);

    // Initialize periode from route
    initPeriode(route.params.periode);

    // Switch tab handler
    const switchTab = async (tab) => {
      activeTab.value = tab;
      currentItems.value = [];
      
      if (tab === 'hari') {
        await loadHariItems();
      } else if (tab === 'kelas' && selectedKelas.value) {
        await loadKelasItems();
      } else if (tab === 'guru' && selectedGuru.value) {
        await loadGuruItems();
      }
    };

    // Edit modal functions
    const openEditModal = (block) => {
      editBlock.value = block;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editBlock.value = null;
    };

    const handleEditSaved = async () => {
      // Refresh current view
      if (activeTab.value === 'hari') {
        await loadHariItems();
      } else if (activeTab.value === 'kelas' && selectedKelas.value) {
        await loadKelasItems();
      } else if (activeTab.value === 'guru' && selectedGuru.value) {
        await loadGuruItems();
      }
    };

    const goBack = () => {
      router.push({ name: 'Jadwal' });
    };

    // Export PDF functions
    const toggleExportDropdown = () => {
      exportDropdownOpen.value = !exportDropdownOpen.value;
    };

    const handleExportPdf = async (view) => {
      exportDropdownOpen.value = false;
      exporting.value = true;
      try {
        const response = await jadwalRepository.exportPdf(periode.value, view);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jadwal-${periode.value}-per-${view}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export PDF error:', err);
        error.value = 'Gagal mengekspor PDF. Silakan coba lagi.';
      } finally {
        exporting.value = false;
      }
    };

    // Close export dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target)) {
        exportDropdownOpen.value = false;
      }
    };

    onMounted(async () => {
      document.addEventListener('click', handleClickOutside);
      await Promise.all([loadKonfigurasi(), loadReferences()]);
      const status = await loadJadwalStatus();
      
      // If ready, load initial data for first tab (hari)
      if (status?.status === 'ready') {
        await loadHariItems();
      }
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      resetState();
    });

    return {
      periode,
      loadingStatus,
      error,
      jadwalStatus,
      activeTab,
      showEditModal,
      editBlock,
      exporting,
      exportDropdownOpen,
      exportDropdownRef,
      switchTab,
      openEditModal,
      closeEditModal,
      handleEditSaved,
      getStatusVariant,
      formatDate,
      goBack,
      toggleExportDropdown,
      handleExportPdf
    };
  }
};
</script>
