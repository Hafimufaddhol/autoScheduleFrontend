<template>
  <div class="jadwal-view p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Lihat Jadwal</h1>
        <p class="mt-2 text-gray-600">Tampilkan jadwal berdasarkan periode dan kelas</p>
      </div>
    </div>
      
    <!-- Input Periode -->
    <div class="mb-6">
      <div class="flex gap-4 items-center">
        <input
          v-model="periode"
          type="text"
          placeholder="Masukkan periode (misal: 2024-ganjil)"
          class="flex-1 lg:w-96 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 p-2.5"
        />
        <BaseButton
          :label="loading ? 'Memuat...' : 'Tampilkan'"
          :disabled="loading || !periode"
          @click="loadJadwal"
        />
      </div>

      <!-- Status Info -->
      <div v-if="jadwalData && jadwalData.status" class="mt-4">
        <div class="flex items-center gap-2">
          <span class="font-semibold">Status:</span>
          <span 
            :class="{
              'text-green-600': jadwalData.status === 'ready',
              'text-yellow-600': jadwalData.status === 'pending',
              'text-red-600': jadwalData.status === 'error',
              'text-gray-600': jadwalData.status === 'not_found'
            }"
            class="font-bold uppercase"
          >
            {{ jadwalData?.status || 'unknown' }}
          </span>
          <span v-if="jadwalData?.created_at" class="text-gray-500 ml-4">
            Dibuat: {{ formatDate(jadwalData.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Tabs -->
    <div v-if="jadwalData?.status === 'ready' && items.length > 0" class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <button
            @click="activeTab = 'kelas'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'kelas',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'kelas'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            Per Kelas
          </button>
          <button
            @click="activeTab = 'guru'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'guru',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'guru'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            Per Guru
          </button>
          <button
            @click="activeTab = 'raw'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'raw',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'raw'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            Data Mentah
          </button>
          <button
            @click="activeTab = 'grid'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'grid',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'grid'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            Grid Mingguan
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div v-if="jadwalData?.status === 'ready' && items.length > 0">
      <!-- Per Kelas View -->
      <div v-show="activeTab === 'kelas'" class="space-y-8">
        <div v-for="kelas in kelasGroups" :key="kelas.id" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-4">{{ kelas.nama }}</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mapel
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guru
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, idx) in kelas.items" :key="idx" class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.hari }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.start }}</td>
                  <td class="px-4 py-3">{{ item.mapel }}</td>
                  <td class="px-4 py-3">{{ item.guru }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.size }} JP</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 text-sm text-gray-600">
            Total JP: <span class="font-semibold">{{ kelas.totalJP }}</span>
          </div>
        </div>
      </div>

      <!-- Per Guru View -->
      <div v-show="activeTab === 'guru'" class="space-y-8">
        <div v-for="guru in guruGroups" :key="guru.id" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-4">{{ guru.nama }}</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mapel
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, idx) in guru.items" :key="idx" class="hover:bg-gray-50">
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.hari }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.start }}</td>
                  <td class="px-4 py-3">{{ item.kelas }}</td>
                  <td class="px-4 py-3">{{ item.mapel }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ item.size }} JP</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 text-sm text-gray-600">
            Total JP: <span class="font-semibold">{{ guru.totalJP }}</span>
          </div>
        </div>
      </div>

      <!-- Raw Data View -->
      <div v-show="activeTab === 'raw'" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Data Mentah (JSON)</h2>
        <pre class="bg-gray-50 p-4 rounded overflow-x-auto text-sm">{{ JSON.stringify(items, null, 2) }}</pre>
      </div>

      <!-- Grid Mingguan View -->
      <div v-show="activeTab === 'grid'" class="space-y-10">
        <div v-for="day in gridDays" :key="day.hari_index" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold mb-4">{{ day.hari }}</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th class="border px-2 py-2 w-16 text-xs uppercase bg-gray-50">Jam ke</th>
                  <th v-for="k in kelasOrdered" :key="k.id" class="border px-2 py-2 text-xs uppercase bg-gray-50">
                    {{ k.nama }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in day.rows" :key="row.slot">
                  <td class="border px-2 py-1 text-center text-sm bg-gray-50">{{ row.slot }}</td>
                  <template v-for="cell in row.cells" :key="cell.key">
                    <td v-if="cell.show" :rowspan="cell.rowspan" class="border align-top p-2 text-xs">
                      <div v-if="cell.text">
                        <div class="font-semibold">{{ cell.text.mapel }}</div>
                        <div class="text-gray-600">{{ cell.text.guru }}</div>
                      </div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="jadwalData?.status === 'ready' && items.length === 0" 
         class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
      Jadwal belum memiliki item.
    </div>

    <div v-else-if="jadwalData?.status === 'pending'" 
         class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
      Jadwal sedang diproses. Silakan refresh halaman setelah beberapa saat.
    </div>

    <div v-else-if="jadwalData?.status === 'not_found'" 
         class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded">
      Jadwal tidak ditemukan untuk periode ini.
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import BaseButton from '@/components/ui/BaseButton.vue';

export default {
  name: 'JadwalView',
  components: {
    BaseButton
  },
  setup() {
    const periode = ref('');
    const loading = ref(false);
    const error = ref('');
    const jadwalData = ref(null);
    const items = ref([]); // aggregated blocks for display
    const activeTab = ref('kelas');

    const API_BASE = import.meta.env.VITE_API_URL || 'https://qqv467v1-5000.asse.devtunnels.ms/';

    // Master data maps for pretty names
    const dayNames = ref(["Senin","Selasa","Rabu","Kamis","Jumat"]);
    const guruMap = ref({});
    const mapelMap = ref({});
    const kelasMap = ref({});

    const loadKonfigurasi = async () => {
      try {
        const res = await axios.get(`${API_BASE}/konfigurasi`);
        const konf = res?.data?.data ?? res?.data ?? {};
        if (Array.isArray(konf.hari) && konf.hari.length) {
          dayNames.value = konf.hari;
        }
      } catch (_) { /* ignore and use defaults */ }
    };

    const loadMasters = async () => {
      try {
        const [rg, rm, rk] = await Promise.all([
          axios.get(`${API_BASE}/guru`),
          axios.get(`${API_BASE}/mapel`),
          axios.get(`${API_BASE}/kelas`),
        ]);
        guruMap.value = {};
        (rg.data?.data ?? rg.data ?? []).forEach(g => { guruMap.value[g.id] = g.nama || g.kode || g.id; });
        mapelMap.value = {};
        (rm.data?.data ?? rm.data ?? []).forEach(m => { mapelMap.value[m.id] = m.nama || m.kode || m.id; });
        kelasMap.value = {};
        (rk.data?.data ?? rk.data ?? []).forEach(k => { kelasMap.value[k.id] = k.nama || k.kode || k.id; });
      } catch (_) { /* keep ids if fails */ }
    };

    const aggregateSlotsToBlocks = (slotItems) => {
      // slotItems is per-slot docs: {guru_id, kelas_id, mapel_id, hari_index, slot, block_ref, order_in_block}
      const byBlock = new Map();
      for (const it of slotItems) {
        const key = it.block_ref || `${it.guru_id}_${it.mapel_id}_${it.kelas_id}_${it.hari_index}`;
        if (!byBlock.has(key)) byBlock.set(key, []);
        byBlock.get(key).push(it);
      }
      const blocks = [];
      for (const [bref, arr] of byBlock.entries()) {
        if (!arr.length) continue;
        arr.sort((a,b) => (a.slot||0) - (b.slot||0));
        const first = arr[0];
        const slots = arr.map(x => x.slot).filter(s => typeof s === 'number');
        const start = slots.length ? slots[0] : null;
        const size = slots.length;
        const hari_index = first.hari_index;
        const hari = (hari_index != null && dayNames.value[hari_index]) ? dayNames.value[hari_index] : `${hari_index}`;
        blocks.push({
          block_id: bref,
          guru_id: first.guru_id,
          guru_nama: guruMap.value[first.guru_id] || first.guru_id,
          mapel_id: first.mapel_id,
          mapel_nama: mapelMap.value[first.mapel_id] || first.mapel_id,
          kelas_id: first.kelas_id,
          kelas_nama: kelasMap.value[first.kelas_id] || first.kelas_id,
          hari_index,
          hari,
          start,
          size,
          slots,
        });
      }
      // sort blocks by kelas, day, start
      blocks.sort((a,b) => {
        if (a.kelas_nama !== b.kelas_nama) return a.kelas_nama.localeCompare(b.kelas_nama);
        if (a.hari_index !== b.hari_index) return a.hari_index - b.hari_index;
        return (a.start||0) - (b.start||0);
      });
      return blocks;
    };

    const loadJadwal = async () => {
      if (!periode.value) return;
      loading.value = true;
      error.value = '';
      jadwalData.value = null;
      items.value = [];

      try {
        // fetch configuration and masters first for proper name mapping
        await Promise.all([loadKonfigurasi(), loadMasters()]);

        const response = await axios.get(`${API_BASE}/jadwal/${periode.value}`);
        const payload = response?.data?.data ?? response?.data;
        if (payload) {
          // Support both object payload and raw array (items-only) payloads
          if (Array.isArray(payload)) {
            jadwalData.value = { status: 'ready', items: payload };
          } else {
            jadwalData.value = payload;
          }
          if (jadwalData.value.status === 'ready' && Array.isArray(jadwalData.value.items)) {
            const slotItems = jadwalData.value.items;
            const looksAggregated = slotItems.length > 0 && Array.isArray(slotItems[0]?.slots);
            if (looksAggregated) {
              items.value = slotItems.map(b => ({
                block_id: b.block_id,
                guru_id: b.guru_id,
                guru_nama: guruMap.value[b.guru_id] || b.guru_id,
                mapel_id: b.mapel_id,
                mapel_nama: mapelMap.value[b.mapel_id] || b.mapel_id,
                kelas_id: b.kelas_id,
                kelas_nama: kelasMap.value[b.kelas_id] || b.kelas_id,
                hari_index: b.hari_index,
                hari: dayNames.value[b.hari_index] || `${b.hari_index}`,
                start: b.start,
                size: Array.isArray(b.slots) ? b.slots.length : (b.durasi || 0),
                slots: Array.isArray(b.slots) ? b.slots : [],
              }));
            } else {
              items.value = aggregateSlotsToBlocks(slotItems);
            }
          }
        } else {
          error.value = 'Format response tidak valid';
        }
      } catch (err) {
        console.error('Error loading jadwal:', err);
        error.value = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      } finally {
        loading.value = false;
      }
    };

    // Group by kelas
    const kelasGroups = computed(() => {
      const groups = {};
      items.value.forEach(item => {
        if (!groups[item.kelas_id]) {
          groups[item.kelas_id] = {
            id: item.kelas_id,
            nama: item.kelas_nama || item.kelas_id,
            items: [],
            totalJP: 0
          };
        }
        groups[item.kelas_id].items.push({
          hari: item.hari,
          start: item.start,
          mapel: item.mapel_nama || item.mapel_id,
          guru: item.guru_nama || item.guru_id,
          size: item.size
        });
        groups[item.kelas_id].totalJP += item.size || 0;
      });

      // Sort items by day and start time
      Object.values(groups).forEach(group => {
        group.items.sort((a, b) => {
          if (a.hari !== b.hari) return a.hari.localeCompare(b.hari);
          return a.start - b.start;
        });
      });

      return Object.values(groups).sort((a, b) => a.nama.localeCompare(b.nama));
    });

    // Group by guru
    const guruGroups = computed(() => {
      const groups = {};
      items.value.forEach(item => {
        if (!groups[item.guru_id]) {
          groups[item.guru_id] = {
            id: item.guru_id,
            nama: item.guru_nama || item.guru_id,
            items: [],
            totalJP: 0
          };
        }
        groups[item.guru_id].items.push({
          hari: item.hari,
          start: item.start,
          kelas: item.kelas_nama || item.kelas_id,
          mapel: item.mapel_nama || item.mapel_id,
          size: item.size
        });
        groups[item.guru_id].totalJP += item.size || 0;
      });

      // Sort items by day and start time
      Object.values(groups).forEach(group => {
        group.items.sort((a, b) => {
          if (a.hari !== b.hari) return a.hari.localeCompare(b.hari);
          return a.start - b.start;
        });
      });

      return Object.values(groups).sort((a, b) => a.nama.localeCompare(b.nama));
    });

    // Grid: compute ordered kelas list used as columns
    const kelasOrdered = computed(() => {
      const seen = new Map();
      items.value.forEach(it => {
        if (!seen.has(it.kelas_id)) {
          seen.set(it.kelas_id, { id: it.kelas_id, nama: it.kelas_nama || it.kelas_id });
        }
      });
      return Array.from(seen.values()).sort((a,b) => a.nama.localeCompare(b.nama));
    });

    // Helper to build cell matrix with rowspans per day
    const buildDayGrid = (hari_index) => {
      const kelasCols = kelasOrdered.value;
      if (kelasCols.length === 0) return { hari_index, hari: dayNames.value[hari_index] || `${hari_index}`, rows: [] };
      // collect blocks for this day
      const blocks = items.value.filter(it => it.hari_index === hari_index);
      // determine max slot number for this day
      let maxSlot = 0;
      for (const b of blocks) {
        if (Array.isArray(b.slots) && b.slots.length) {
          maxSlot = Math.max(maxSlot, Math.max(...b.slots));
        } else if (typeof b.start === 'number' && typeof b.size === 'number') {
          maxSlot = Math.max(maxSlot, b.start + b.size - 1);
        }
      }
      if (!maxSlot) maxSlot = 12; // sensible default
      // Build a lookup: kelas -> slot -> cell spec
      const cellMap = new Map();
      for (const k of kelasCols) {
        cellMap.set(k.id, {});
      }
      for (const b of blocks) {
        const k = b.kelas_id;
        if (!cellMap.has(k)) continue;
        const slots = Array.isArray(b.slots) && b.slots.length
          ? b.slots.slice().sort((a,b) => a-b)
          : Array.from({length: b.size || 0}, (_,i) => (b.start||0)+i);
        if (!slots.length) continue;
        const start = slots[0];
        const size = slots.length;
        // place a starting cell with rowspan
        cellMap.get(k)[start] = {
          show: true,
          rowspan: size,
          key: `${k}_${start}`,
          text: { mapel: b.mapel_nama || b.mapel_id, guru: b.guru_nama || b.guru_id }
        };
        // mark following slots as covered
        for (let i = 1; i < size; i++) {
          const s = start + i;
          cellMap.get(k)[s] = { show: false, rowspan: 0, key: `${k}_${s}`, text: null };
        }
      }
      // build rows
      const rows = [];
      for (let s = 1; s <= maxSlot; s++) {
        const row = { slot: s, cells: [] };
        for (const k of kelasCols) {
          const spec = cellMap.get(k.id)[s];
          if (spec) {
            row.cells.push(spec);
          } else {
            row.cells.push({ show: true, rowspan: 1, key: `${k.id}_${s}`, text: null });
          }
        }
        rows.push(row);
      }
      return { hari_index, hari: dayNames.value[hari_index] || `${hari_index}`, rows };
    };

    // Grid: days present in data
    const gridDays = computed(() => {
      const present = new Set(items.value.map(it => it.hari_index).filter(v => v !== undefined && v !== null));
      const idxs = Array.from(present.values()).sort((a,b) => a-b);
      return idxs.map(i => buildDayGrid(i));
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      return date.toLocaleString('id-ID');
    };

    return {
      periode,
      loading,
      error,
      jadwalData,
      items,
      activeTab,
      loadJadwal,
      kelasGroups,
      guruGroups,
      kelasOrdered,
      gridDays,
      formatDate
    };
  }
};
</script>

<style scoped>
.jadwal-view {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
