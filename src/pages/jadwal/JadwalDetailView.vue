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
    </div>

    <!-- Status Bar -->
    <div v-if="jadwalData && jadwalData.status" class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div class="flex items-center gap-4">
        <span class="font-semibold text-gray-700">Status:</span>
        <Badge 
          :label="jadwalData.status" 
          :variant="getStatusVariant(jadwalData.status)"
        />
        <span v-if="jadwalData.created_at" class="text-gray-500 ml-auto">
          <i class="far fa-clock mr-2"></i>
          Dibuat: {{ formatDate(jadwalData.created_at) }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-cyan-600"></i>
      <p class="mt-4 text-gray-600">Memuat jadwal...</p>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" type="error" :message="error" @close="error = ''" />

    <!-- Tabs -->
    <div v-else-if="jadwalData?.status === 'ready' && items.length > 0" class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <button
            @click="activeTab = 'kelas'"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'kelas',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'kelas'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-school mr-2"></i>
            Per Kelas
          </button>
          <button
            @click="activeTab = 'guru'"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'guru',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'guru'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-chalkboard-teacher mr-2"></i>
            Per Guru
          </button>
          <button
            @click="activeTab = 'grid'"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'grid',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'grid'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-table mr-2"></i>
            Grid Mingguan
          </button>
          <button
            @click="activeTab = 'raw'"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'raw',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'raw'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-code mr-2"></i>
            Data Mentah
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="mt-6">
        <!-- Per Kelas View -->
        <div v-show="activeTab === 'kelas'" class="space-y-8">
          <div v-for="kelas in kelasGroups" :key="kelas.id" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-4 text-gray-900">{{ kelas.nama }}</h2>
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
            <h2 class="text-2xl font-bold mb-4 text-gray-900">{{ guru.nama }}</h2>
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

        <!-- Grid Mingguan View -->
        <div v-show="activeTab === 'grid'" class="space-y-10">
          <div v-for="day in gridDays" :key="day.hari_index" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-4 text-gray-900">{{ day.hari }}</h2>
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
                  <tr v-for="row in day.rows" :key="row.key || row.slot" :class="row.isBreak ? 'bg-yellow-50' : ''">
                    <template v-if="row.isBreak">
                      <td :colspan="kelasOrdered.length + 1" class="border px-2 py-1 text-center text-xs font-semibold text-yellow-700">
                        {{ row.label || 'Istirahat' }}
                      </td>
                    </template>
                    <template v-else>
                      <td class="border px-2 py-1 text-center text-sm bg-gray-50 font-semibold">{{ row.slot }}</td>
                      <template v-for="cell in row.cells" :key="cell.key">
                        <td v-if="cell.show" :rowspan="cell.rowspan" class="border align-top p-2 text-xs">
                          <div v-if="cell.text" class="space-y-1">
                            <div class="font-semibold text-gray-900">{{ cell.text.mapel }}</div>
                            <div class="text-gray-600">{{ cell.text.guru }}</div>
                          </div>
                        </td>
                      </template>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Raw Data View -->
        <div v-show="activeTab === 'raw'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-900">Data Mentah (JSON)</h2>
          <pre class="bg-gray-50 p-4 rounded overflow-x-auto text-sm">{{ JSON.stringify(items, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Empty/Status States -->
    <div v-else-if="jadwalData?.status === 'ready' && items.length === 0" 
         class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded text-center">
      <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
      <p>Jadwal belum memiliki item.</p>
    </div>

    <div v-else-if="jadwalData?.status === 'pending'" 
         class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-8 rounded text-center">
      <i class="fas fa-clock text-3xl mb-2"></i>
      <p>Jadwal sedang diproses. Silakan refresh halaman setelah beberapa saat.</p>
    </div>

    <div v-else-if="jadwalData?.status === 'not_found'" 
         class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
      <i class="fas fa-question-circle text-3xl mb-2"></i>
      <p>Jadwal tidak ditemukan untuk periode ini.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Badge from '@/components/ui/Badge.vue';
import Alert from '@/components/ui/Alert.vue';
import jadwalRepository from '@/repositories/jadwalRepository';
import guruRepository from '@/repositories/guruRepository';
import mapelRepository from '@/repositories/mapelRepository';
import kelasRepository from '@/repositories/kelasRepository';
import konfigurasiRepository from '@/repositories/konfigurasiRepository';

export default {
  name: 'JadwalDetailView',
  components: {
    Badge,
    Alert
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const periode = ref(route.params.periode);
    const loading = ref(false);
    const error = ref('');
    const jadwalData = ref(null);
    const items = ref([]);
    const activeTab = ref('kelas');

    // Master data maps
    const dayNames = ref(["Senin","Selasa","Rabu","Kamis","Jumat"]);
  const guruMap = ref({});
  const mapelMap = ref({});
  const kelasMap = ref({});
  const breakMarkers = ref([]);

    const loadKonfigurasi = async () => {
      try {
        const response = await konfigurasiRepository.get();
        const konf = response?.data?.data ?? response?.data ?? {};
        if (Array.isArray(konf.hari) && konf.hari.length) {
          dayNames.value = konf.hari;
        }
        const rawBreaks = Array.isArray(konf.jam_istirahat) ? konf.jam_istirahat : [];
        if (rawBreaks.length) {
          const parsed = rawBreaks
            .map((entry, idx) => {
              const mulai = Number(entry.mulai);
              const selesai = Number(entry.selesai);
              if (!Number.isFinite(mulai)) {
                return null;
              }
              const boundary = Number.isFinite(selesai)
                ? Math.min(mulai, selesai)
                : mulai;
              if (!Number.isFinite(boundary) || boundary <= 0) {
                return null;
              }
              const baseLabel = entry.label || entry.nama || `Istirahat ${idx + 1}`;
              const label = Number.isFinite(mulai) && Number.isFinite(selesai)
                ? `${baseLabel} (${mulai}-${selesai})`
                : baseLabel;
              return { afterSlot: boundary, label };
            })
            .filter(Boolean)
            .sort((a, b) => a.afterSlot - b.afterSlot);
          const dedup = [];
          const seen = new Set();
          parsed.forEach(marker => {
            if (seen.has(marker.afterSlot)) return;
            seen.add(marker.afterSlot);
            dedup.push(marker);
          });
          breakMarkers.value = dedup;
        } else {
          breakMarkers.value = [];
        }
      } catch (_) { /* ignore */ }
    };

    const loadMasters = async () => {
      try {
        const [guruData, mapelData, kelasData] = await Promise.all([
          guruRepository.getAll({ pageSize: 1000 }),
          mapelRepository.getAll({ pageSize: 1000 }),
          kelasRepository.getAll({ pageSize: 1000 }),
        ]);
        
        guruMap.value = {};
        const guruList = guruData?.data ?? guruData ?? [];
        guruList.forEach(g => { 
          guruMap.value[g.id] = g.nama || g.kode || g.id; 
        });
        
        mapelMap.value = {};
        const mapelList = mapelData?.data ?? mapelData ?? [];
        mapelList.forEach(m => { 
          mapelMap.value[m.id] = m.nama || m.kode || m.id; 
        });
        
        kelasMap.value = {};
        const kelasList = kelasData?.data ?? kelasData ?? [];
        kelasList.forEach(k => { 
          kelasMap.value[k.id] = k.nama || k.kode || k.id; 
        });
      } catch (_) { /* keep ids if fails */ }
    };

    const aggregateSlotsToBlocks = (slotItems) => {
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
        await Promise.all([loadKonfigurasi(), loadMasters()]);

        const response = await jadwalRepository.getById(periode.value);
        const payload = response?.data?.data ?? response?.data;
        if (payload) {
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

      Object.values(groups).forEach(group => {
        group.items.sort((a, b) => {
          if (a.hari !== b.hari) return a.hari.localeCompare(b.hari);
          return a.start - b.start;
        });
      });

      return Object.values(groups).sort((a, b) => a.nama.localeCompare(b.nama));
    });

    // Grid: kelas columns
    const kelasOrdered = computed(() => {
      const seen = new Map();
      items.value.forEach(it => {
        if (!seen.has(it.kelas_id)) {
          seen.set(it.kelas_id, { id: it.kelas_id, nama: it.kelas_nama || it.kelas_id });
        }
      });
      return Array.from(seen.values()).sort((a,b) => a.nama.localeCompare(b.nama));
    });

    const buildDayGrid = (hari_index) => {
      const kelasCols = kelasOrdered.value;
      if (kelasCols.length === 0) return { hari_index, hari: dayNames.value[hari_index] || `${hari_index}`, rows: [] };
      const blocks = items.value.filter(it => it.hari_index === hari_index);
      let maxSlot = 0;
      for (const b of blocks) {
        if (Array.isArray(b.slots) && b.slots.length) {
          maxSlot = Math.max(maxSlot, Math.max(...b.slots));
        } else if (typeof b.start === 'number' && typeof b.size === 'number') {
          maxSlot = Math.max(maxSlot, b.start + b.size - 1);
        }
      }
      if (!maxSlot) maxSlot = 12;
      const maxBreak = breakMarkers.value.reduce((acc, marker) => Math.max(acc, Number(marker.afterSlot) || 0), 0);
      if (maxBreak > maxSlot) {
        maxSlot = maxBreak;
      }
      const cellMap = new Map();
      for (const k of kelasCols) {
        cellMap.set(k.id, {});
      }
      const breakBoundarySet = new Set(
        breakMarkers.value
          .map(marker => Number(marker.afterSlot))
          .filter(num => Number.isFinite(num) && num > 0)
      );
      for (const b of blocks) {
        const k = b.kelas_id;
        if (!cellMap.has(k)) continue;
        const slots = Array.isArray(b.slots) && b.slots.length
          ? b.slots.slice().sort((a,b) => a-b)
          : Array.from({length: b.size || 0}, (_,i) => (b.start||0)+i);
        if (!slots.length) continue;
        const segments = [];
        let currentSegment = [];
        slots.forEach((slot, idx) => {
          if (!Number.isFinite(slot)) return;
          if (!currentSegment.length) {
            currentSegment = [slot];
            return;
          }
          const prev = currentSegment[currentSegment.length - 1];
          const separated = !Number.isFinite(prev)
            || slot !== prev + 1
            || breakBoundarySet.has(prev);
          if (separated) {
            segments.push(currentSegment);
            currentSegment = [slot];
          } else {
            currentSegment.push(slot);
          }
        });
        if (currentSegment.length) {
          segments.push(currentSegment);
        }
        segments.forEach((segmentSlots, segIdx) => {
          const segStart = segmentSlots[0];
          const segSize = segmentSlots.length;
          const baseKey = `${k}_${segStart}_${segIdx}`;
          cellMap.get(k)[segStart] = {
            show: true,
            rowspan: segSize,
            key: baseKey,
            text: { mapel: b.mapel_nama || b.mapel_id, guru: b.guru_nama || b.guru_id }
          };
          for (let i = 1; i < segSize; i++) {
            const sVal = segmentSlots[i];
            cellMap.get(k)[sVal] = { show: false, rowspan: 0, key: `${baseKey}_${i}`, text: null };
          }
        });
      }
      const rows = [];
      const breakLookup = {};
      breakMarkers.value.forEach((marker, idx) => {
        const boundary = Number(marker.afterSlot);
        if (!Number.isFinite(boundary) || boundary <= 0) return;
        breakLookup[boundary] = marker.label || `Istirahat ${idx + 1}`;
      });
      for (let s = 1; s <= maxSlot; s++) {
        const row = { key: `slot-${hari_index}-${s}`, slot: s, cells: [], isBreak: false };
        for (const k of kelasCols) {
          const spec = cellMap.get(k.id)[s];
          if (spec) {
            row.cells.push(spec);
          } else {
            row.cells.push({ show: true, rowspan: 1, key: `${k.id}_${s}`, text: null });
          }
        }
        rows.push(row);
        if (breakLookup[s]) {
          rows.push({
            key: `break-${hari_index}-${s}`,
            isBreak: true,
            label: breakLookup[s],
          });
        }
      }
      return { hari_index, hari: dayNames.value[hari_index] || `${hari_index}`, rows };
    };

    const gridDays = computed(() => {
      const present = new Set(items.value.map(it => it.hari_index).filter(v => v !== undefined && v !== null));
      const idxs = Array.from(present.values()).sort((a,b) => a-b);
      return idxs.map(i => buildDayGrid(i));
    });

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

    const goBack = () => {
      router.push({ name: 'Jadwal' });
    };

    onMounted(() => {
      loadJadwal();
    });

    return {
      periode,
      loading,
      error,
      jadwalData,
      items,
      activeTab,
      kelasGroups,
      guruGroups,
      kelasOrdered,
      gridDays,
      getStatusVariant,
      formatDate,
      goBack
    };
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
