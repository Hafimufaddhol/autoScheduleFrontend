<template>
  <div>
    <!-- Kelas Selector (Searchable) -->
    <div class="mb-6 flex items-center gap-4">
      <label class="font-medium text-gray-700">Pilih Kelas:</label>
      <div class="relative min-w-64" ref="kelasDropdownRef">
        <button
          type="button"
          class="inline-flex items-center justify-between gap-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          @click.stop.prevent="toggleDropdown"
        >
          <span>{{ selectedKelas ? getKelasName(selectedKelas) : 'Pilih Kelas' }}</span>
          <i :class="['fa-solid', 'fa-chevron-' + (dropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
        </button>
        <transition name="fade">
          <div
            v-if="dropdownOpen"
            class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div class="p-3 border-b border-gray-100">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari kelas..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
                @click.stop
              />
            </div>
            <div class="max-h-60 overflow-y-auto">
              <button
                v-for="kelas in filteredList"
                :key="kelas.id"
                type="button"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                @click.stop.prevent="handleSelect(kelas.id)"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ kelas.nama || kelas.kode || kelas.id }}</p>
                  <p v-if="kelas.kode && kelas.nama" class="text-xs text-gray-500">{{ kelas.kode }}</p>
                </div>
                <i
                  v-if="selectedKelas === kelas.id"
                  class="fa-solid fa-check text-cyan-600"
                ></i>
              </button>
              <p v-if="!filteredList.length" class="p-4 text-sm text-gray-500">Kelas tidak ditemukan.</p>
            </div>
          </div>
        </transition>
      </div>
      <button
        v-if="selectedKelas"
        type="button"
        class="text-gray-400 hover:text-gray-600"
        @click="handleClear"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Loading Items -->
    <div v-if="loadingItems" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-cyan-600"></i>
      <p class="mt-2 text-gray-600">Memuat jadwal kelas...</p>
    </div>

    <!-- Items Table -->
    <div v-else-if="selectedKelas && currentItems.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-900">
        Jadwal Kelas {{ getKelasName(selectedKelas) }}
        <span class="text-sm font-normal text-gray-500 ml-2">({{ totalJP }} JP)</span>
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JP</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- <tr 
              v-for="(item, idx) in processedKelasItems" 
              :key="idx" 
              :class="['hover:bg-gray-50', item.isContinuation ? 'bg-gray-50' : '']"
            > -->
            <tr 
              v-for="(item, idx) in processedKelasItems" 
              :key="idx" 
              class='hover:bg-gray-50'
            >
              <td 
                v-if="item.showHari" 
                :rowspan="item.hariRowspan"
                class="px-4 py-3 whitespace-nowrap align-top font-semibold text-gray-700 bg-gray-50"
              >
                {{ item.hari }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">{{ item.slot }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ item.waktu }}</td>
              <td class="px-4 py-3">
                <span>
                    {{ item.mapel }}
                <!-- <span :class="item.isContinuation ? 'text-gray-400 italic' : ''"> -->
                <!-- {{ item.isContinuation ? '↳ lanjutan' : item.mapel }} -->
                </span>
              </td>
              <td class="px-4 py-3">{{ item.guru }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="selectedKelas && currentItems.length === 0" class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
      <i class="fas fa-school text-3xl mb-2"></i>
      <p>Tidak ada jadwal untuk kelas ini.</p>
    </div>

    <div v-else class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-8 rounded text-center">
      <i class="fas fa-hand-pointer text-3xl mb-2"></i>
      <p>Silakan pilih kelas untuk melihat jadwal.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useJadwalDetail } from '../composables/useJadwalDetail';

export default {
  name: 'KelasTab',
  setup() {
    const {
      loadingItems,
      currentItems,
      kelasList,
      selectedKelas,
      processedKelasItems,
      totalJP,
      selectKelas,
      clearKelasSelection,
      getKelasName
    } = useJadwalDetail();

    // Local dropdown state
    const dropdownOpen = ref(false);
    const kelasDropdownRef = ref(null);
    const searchQuery = ref('');

    // Filtered list
    const filteredList = computed(() => {
      if (!searchQuery.value) return kelasList.value;
      const keyword = searchQuery.value.toLowerCase();
      return kelasList.value.filter(k => {
        const nama = (k.nama || '').toLowerCase();
        const kode = (k.kode || '').toLowerCase();
        return nama.includes(keyword) || kode.includes(keyword);
      });
    });

    // Toggle dropdown
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
      if (dropdownOpen.value) {
        searchQuery.value = '';
      }
    };

    // Handle select
    const handleSelect = async (id) => {
      dropdownOpen.value = false;
      searchQuery.value = '';
      await selectKelas(id);
    };

    // Handle clear
    const handleClear = () => {
      clearKelasSelection();
    };

    // Click outside handler
    const handleClickOutside = (event) => {
      if (kelasDropdownRef.value && !kelasDropdownRef.value.contains(event.target)) {
        dropdownOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      loadingItems,
      currentItems,
      selectedKelas,
      processedKelasItems,
      totalJP,
      getKelasName,
      dropdownOpen,
      kelasDropdownRef,
      searchQuery,
      filteredList,
      toggleDropdown,
      handleSelect,
      handleClear
    };
  }
};
</script>

<style scoped>
/* Fade transition for dropdowns */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
