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
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            id="jadwal-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari periode"
          />
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

    <div
      v-else-if="jadwalList.length === 0"
      class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center"
    >
      Tidak ada jadwal yang tersedia
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="j in jadwalList"
        :key="j.periode"
        @click="viewJadwal(j.periode)"
        class="p-5 rounded-lg shadow-sm bg-white cursor-pointer border border-gray-200 transform transition duration-150 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-500"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-semibold text-lg text-gray-900 mb-2">{{ j.periode }}</div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs text-gray-500">Status:</span>
              <Badge :label="j.status" :variant="getStatusVariant(j.status)" />
            </div>
            <div v-if="j.created_at" class="text-xs text-gray-400 mt-2">
              <i class="far fa-clock mr-1"></i>
              {{ formatDate(j.created_at) }}
            </div>
          </div>
          <div class="ml-4 flex gap-2">
            <button @click.stop="handleDelete(j.periode)" title="Hapus jadwal" class="text-red-600 hover:text-red-800 p-2">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && jadwalList.length > 0"
      class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="text-sm text-gray-700">
        Menampilkan {{ displayStart }}-{{ displayEnd }} dari {{ totalItems }} jadwal
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
          <template v-for="entry in visiblePages" :key="entry.key">
            <button
              v-if="entry.type === 'page'"
              @click="goToPage(entry.page)"
              :class="[
                'px-3 py-1 border rounded',
                currentPage === entry.page 
                  ? 'bg-cyan-600 text-white' 
                  : 'hover:bg-gray-50'
              ]"
            >
              {{ entry.label }}
            </button>
            <span
              v-else
              class="px-3 py-1 text-gray-400 select-none"
            >
              …
            </span>
          </template>
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

    const pagination = ref({
      page: 1,
      page_size: 10,
      total_items: 0,
      total_pages: 1
    });

    const loadJadwal = async ({
      page = pagination.value.page,
      pageSize = pagination.value.page_size,
      search = searchQuery.value
    } = {}) => {
      loading.value = true;
      try {
        const response = await jadwalRepository.getAll({
          page,
          pageSize,
          search: search?.trim() || undefined
        });
        jadwalList.value = response.data || [];

        const pagMeta = response.meta?.pagination;
        if (pagMeta) {
          pagination.value = {
            page: pagMeta.page,
            page_size: pagMeta.page_size,
            total_items: pagMeta.total_items,
            total_pages: pagMeta.total_pages
          };
        } else {
          pagination.value = {
            page,
            page_size: pageSize,
            total_items: jadwalList.value.length,
            total_pages: 1
          };
        }

        currentPage.value = pagination.value.page;
        localPageSize.value = pagination.value.page_size;
      } catch (err) {
        console.error('Error loading jadwal list:', err);
        showAlert('error', 'Gagal memuat daftar jadwal');
      } finally {
        loading.value = false;
      }
    };

    const viewJadwal = (periode) => {
      router.push({ name: 'JadwalDetail', params: { periode } });
    };

    const handleDelete = async (periode) => {
      if (!confirm(`Yakin ingin menghapus jadwal ${periode}?`)) return;

      try {
        await jadwalRepository.delete(periode);
        showAlert('success', 'Jadwal berhasil dihapus');
        await loadJadwal({ page: currentPage.value, pageSize: localPageSize.value, search: searchQuery.value });
      } catch (err) {
        console.error('Error deleting jadwal:', err);
        showAlert('error', 'Gagal menghapus jadwal');
      }
    };

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
        showAlert('info', 'Fitur generate jadwal belum diimplementasikan. Silakan tunggu update selanjutnya.');
        closeGenerateModal();
      } catch (err) {
        console.error('Error generating jadwal:', err);
        showAlert('error', 'Gagal membuat jadwal');
      } finally {
        generating.value = false;
      }
    };

    const totalItems = computed(() => pagination.value.total_items);
    const totalPages = computed(() => Math.max(pagination.value.total_pages, 1));

    const startIndex = computed(() => {
      if (totalItems.value === 0) return 0;
      return (pagination.value.page - 1) * pagination.value.page_size;
    });

    const endIndex = computed(() => {
      if (totalItems.value === 0) return 0;
      return Math.min(startIndex.value + jadwalList.value.length, totalItems.value);
    });

    const displayStart = computed(() => (totalItems.value === 0 ? 0 : startIndex.value + 1));
    const displayEnd = computed(() => (totalItems.value === 0 ? 0 : endIndex.value));

    const visiblePages = computed(() => {
      const entries = [];
      const total = totalPages.value;
      const current = currentPage.value;

      const addPage = (page) => {
        entries.push({ type: 'page', page, label: page, key: `page-${page}` });
      };
      const addEllipsis = (position) => {
        entries.push({ type: 'ellipsis', key: `ellipsis-${position}` });
      };

      if (total <= 7) {
        for (let i = 1; i <= total; i += 1) addPage(i);
      } else if (current <= 4) {
        for (let i = 1; i <= 5; i += 1) addPage(i);
        addEllipsis('right');
        addPage(total);
      } else if (current >= total - 3) {
        addPage(1);
        addEllipsis('left');
        for (let i = total - 4; i <= total; i += 1) addPage(i);
      } else {
        addPage(1);
        addEllipsis('left');
        for (let i = current - 1; i <= current + 1; i += 1) addPage(i);
        addEllipsis('right');
        addPage(total);
      }

      return entries;
    });

    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) return;
      loadJadwal({ page, pageSize: localPageSize.value, search: searchQuery.value });
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        goToPage(currentPage.value - 1);
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        goToPage(currentPage.value + 1);
      }
    };

    const handlePageSizeChange = () => {
      const size = Number(localPageSize.value) || 10;
      localPageSize.value = size;
      currentPage.value = 1;
      loadJadwal({ page: 1, pageSize: size, search: searchQuery.value });
    };

    const handleSearch = () => {
      currentPage.value = 1;
      loadJadwal({ page: 1, pageSize: localPageSize.value, search: searchQuery.value });
    };

    const showAlert = (type, message) => {
      alert.value = { show: true, type, message };
      setTimeout(() => {
        alert.value.show = false;
      }, 5000);
    };

    const getStatusVariant = (status) => {
      const variants = {
        ready: 'success',
        pending: 'warning',
        error: 'danger',
        not_found: 'secondary'
      };
      return variants[status] || 'secondary';
    };

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
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      displayStart,
      displayEnd,
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
