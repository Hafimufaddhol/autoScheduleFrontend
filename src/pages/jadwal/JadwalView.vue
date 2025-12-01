<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Jadwal</h1>
        <p class="mt-2 text-gray-600">Kelola jadwal pelajaran per periode</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 mb-4 gap-4">
      <!-- Search -->
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="jadwal-search" class="sr-only">Search</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input v-model="searchQuery" @input="handleSearch" type="text" id="jadwal-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari periode" />
        </div>
      </form>

      <!-- Buttons -->
      <div class="flex items-center space-x-2 sm:space-x-3 ml-auto mt-3 sm:mt-0">
        <BaseButton 
          icon="fas fa-plus"
          size="lg"
          label="Generate Jadwal"
          @click="openGenerateModal"
        />
      </div>
    </div>

    <!-- Alert -->
    <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

    <!-- Cards Grid -->
    <div v-if="loading" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-3xl text-cyan-600"></i>
    </div>
    
    <div v-else-if="filteredJadwal.length === 0" class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
      Tidak ada jadwal yang tersedia
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="j in paginatedJadwal" :key="j.periode"
        @click="viewJadwal(j.periode)"
        class="p-5 rounded-lg shadow-sm bg-white cursor-pointer border border-gray-200 transform transition duration-150 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-500">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-semibold text-lg text-gray-900 mb-2">{{ j.periode }}</div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs text-gray-500">Status:</span>
              <Badge 
                :label="j.status" 
                :variant="getStatusVariant(j.status)"
              />
            </div>
            <div v-if="j.created_at" class="text-xs text-gray-400 mt-2">
              <i class="far fa-clock mr-1"></i>
              {{ formatDate(j.created_at) }}
            </div>
          </div>
          <div class="ml-4 flex gap-2">
            <button @click.stop="handleDelete(j.periode)" title="Hapus jadwal"
                    class="text-red-600 hover:text-red-800 p-2">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && filteredJadwal.length > 0" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-700">
        Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, totalItems) }} dari {{ totalItems }} jadwal
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label for="pageSize" class="text-sm text-gray-700">Per halaman:</label>
          <select 
            id="pageSize"
            v-model="localPageSize"
            @change="handlePageSizeChange"
            class="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        
        <div class="flex gap-1">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 border rounded',
              currentPage === page 
                ? 'bg-cyan-600 text-white' 
                : 'hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Generate -->
    <Modal :isOpen="showGenerateModal" @close="closeGenerateModal" title="Generate Jadwal" :showFooter="false">
      <form @submit.prevent="handleGenerate">
        <div class="space-y-4">
          <Input v-model="generateForm.periode" label="Periode" placeholder="Contoh: 2024-Ganjil" required />
          <p class="text-sm text-gray-600">
            Proses generate jadwal akan berjalan di background. Status dapat dilihat pada card jadwal.
          </p>
          <div class="flex justify-end gap-2 mt-4">
            <BaseButton label="Batal" variant="secondary" @click="closeGenerateModal" />
            <BaseButton label="Generate" icon="fas fa-play" type="submit" :loading="generating" />
          </div>
        </div>
      </form>
    </Modal>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import Input from '@/components/ui/Input.vue';
import Alert from '@/components/ui/Alert.vue';
import jadwalRepository from '@/repositories/jadwalRepository';

export default {
  name: 'JadwalView',
  components: {
    BaseButton,
    Badge,
    Modal,
    Input,
    Alert
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const jadwalList = ref([]);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const localPageSize = ref(10);
    const showGenerateModal = ref(false);
    const generating = ref(false);
    const generateForm = ref({ periode: '' });
    const alert = ref({ show: false, type: 'success', message: '' });

    // Load jadwal list
    const loadJadwal = async () => {
      loading.value = true;
      try {
        const response = await jadwalRepository.getAll();
        jadwalList.value = response.data?.data || response.data || [];
      } catch (err) {
        console.error('Error loading jadwal list:', err);
        showAlert('error', 'Gagal memuat daftar jadwal');
      } finally {
        loading.value = false;
      }
    };

    // Navigate to detail page
    const viewJadwal = (periode) => {
      router.push({ name: 'JadwalDetail', params: { periode } });
    };

    // Delete jadwal
    const handleDelete = async (periode) => {
      if (!confirm(`Yakin ingin menghapus jadwal ${periode}?`)) return;
      
      try {
        await jadwalRepository.delete(periode);
        showAlert('success', 'Jadwal berhasil dihapus');
        await loadJadwal(); // Refresh list
      } catch (err) {
        console.error('Error deleting jadwal:', err);
        showAlert('error', 'Gagal menghapus jadwal');
      }
    };

    // Modal handlers
    const openGenerateModal = () => {
      generateForm.value = { periode: '' };
      showGenerateModal.value = true;
    };

    const closeGenerateModal = () => {
      showGenerateModal.value = false;
      generateForm.value = { periode: '' };
    };

    const handleGenerate = async () => {
      if (!generateForm.value.periode) return;
      
      generating.value = true;
      try {
        // TODO: Call backend create endpoint when implemented
        // await jadwalRepository.create(generateForm.value.periode);
        showAlert('info', 'Fitur generate jadwal belum diimplementasikan. Silakan tunggu update selanjutnya.');
        closeGenerateModal();
        // await loadJadwal(); // Refresh after create
      } catch (err) {
        console.error('Error generating jadwal:', err);
        showAlert('error', 'Gagal membuat jadwal');
      } finally {
        generating.value = false;
      }
    };

    // Search & Filter
    const handleSearch = () => {
      currentPage.value = 1; // Reset to first page on search
    };

    const filteredJadwal = computed(() => {
      if (!searchQuery.value) return jadwalList.value;
      const query = searchQuery.value.toLowerCase();
      return jadwalList.value.filter(j => 
        j.periode?.toLowerCase().includes(query)
      );
    });

    // Pagination
    const totalItems = computed(() => filteredJadwal.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / localPageSize.value));
    
    const startIndex = computed(() => (currentPage.value - 1) * localPageSize.value);
    const endIndex = computed(() => startIndex.value + localPageSize.value);
    
    const paginatedJadwal = computed(() => {
      return filteredJadwal.value.slice(startIndex.value, endIndex.value);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    });

    const goToPage = (page) => {
      if (page === '...') return;
      currentPage.value = page;
    };

    const previousPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const handlePageSizeChange = () => {
      currentPage.value = 1;
    };

    // Alert helper
    const showAlert = (type, message) => {
      alert.value = { show: true, type, message };
      setTimeout(() => {
        alert.value.show = false;
      }, 5000);
    };

    // Status badge variant
    const getStatusVariant = (status) => {
      const variants = {
        ready: 'success',
        pending: 'warning',
        error: 'danger',
        not_found: 'secondary'
      };
      return variants[status] || 'secondary';
    };

    // Format date
    const formatDate = (timestamp) => {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      loadJadwal();
    });

    return {
      loading,
      jadwalList,
      searchQuery,
      currentPage,
      localPageSize,
      showGenerateModal,
      generating,
      generateForm,
      alert,
      filteredJadwal,
      paginatedJadwal,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      viewJadwal,
      handleDelete,
      openGenerateModal,
      closeGenerateModal,
      handleGenerate,
      handleSearch,
      goToPage,
      previousPage,
      nextPage,
      handlePageSizeChange,
      getStatusVariant,
      formatDate
    };
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
