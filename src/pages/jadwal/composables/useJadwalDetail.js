import { ref, computed } from 'vue';
import jadwalRepository from '@/repositories/jadwalRepository';
import guruRepository from '@/repositories/guruRepository';
import mapelRepository from '@/repositories/mapelRepository';
import kelasRepository from '@/repositories/kelasRepository';
import konfigurasiRepository from '@/repositories/konfigurasiRepository';

// Shared state (singleton)
const periode = ref('');
const loadingStatus = ref(false);
const loadingItems = ref(false);
const error = ref('');
const jadwalStatus = ref(null);
const currentItems = ref([]);
const rawItems = ref([]);
const rawDataLoaded = ref(false);

// Reference lists
const dayNames = ref(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
const guruList = ref([]);
const kelasList = ref([]);
const mapelList = ref([]);
const guruMap = ref({});
const mapelMap = ref({});
const kelasMap = ref({});
const breakMarkers = ref([]);

// Selection states
const selectedHari = ref(0);
const selectedKelas = ref('');
const selectedGuru = ref('');

export function useJadwalDetail() {
  // Initialize periode
  const initPeriode = (periodeValue) => {
    periode.value = periodeValue;
  };

  // Load konfigurasi for day names and break markers
  const loadKonfigurasi = async () => {
    try {
      const response = await konfigurasiRepository.get();
      const konf = response?.data?.data ?? response?.data ?? {};
      if (Array.isArray(konf.hari) && konf.hari.length) {
        dayNames.value = konf.hari;
      }
      // Parse break markers
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

  // Load reference lists
  const loadReferences = async () => {
    try {
      const [guruData, mapelData, kelasData] = await Promise.all([
        guruRepository.getReference(),
        mapelRepository.getReference(),
        kelasRepository.getReference(),
      ]);
      
      // Guru list and map
      const guruArr = guruData?.data ?? guruData ?? [];
      guruList.value = guruArr;
      guruMap.value = {};
      guruArr.forEach(g => { 
        guruMap.value[g.id] = g.nama || g.kode || g.id; 
      });
      
      // Mapel list and map
      const mapelArr = mapelData?.data ?? mapelData ?? [];
      mapelList.value = mapelArr;
      mapelMap.value = {};
      mapelArr.forEach(m => { 
        mapelMap.value[m.id] = m.nama || m.kode || m.id; 
      });
      
      // Kelas list and map
      const kelasArr = kelasData?.data ?? kelasData ?? [];
      kelasList.value = kelasArr;
      kelasMap.value = {};
      kelasArr.forEach(k => { 
        kelasMap.value[k.id] = k.nama || k.kode || k.id; 
      });
    } catch (_) { /* keep ids if fails */ }
  };

  // Load jadwal status
  const loadJadwalStatus = async () => {
    if (!periode.value) return;
    loadingStatus.value = true;
    error.value = '';
    
    try {
      const response = await jadwalRepository.getStatus(periode.value);
      jadwalStatus.value = response;
      return response;
    } catch (err) {
      console.error('Error loading jadwal status:', err);
      error.value = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      return null;
    } finally {
      loadingStatus.value = false;
    }
  };

  // Aggregate slot items to blocks - groups consecutive slots with same guru/mapel
  const aggregateSlotsToBlocks = (slotItems) => {
    // Sort by kelas, then hari, then slot
    const sorted = [...slotItems].sort((a, b) => {
      if (a.kelas_id !== b.kelas_id) return String(a.kelas_id).localeCompare(String(b.kelas_id));
      if (a.hari_index !== b.hari_index) return (a.hari_index || 0) - (b.hari_index || 0);
      return (a.slot || 0) - (b.slot || 0);
    });

    const blocks = [];
    let currentBlock = null;

    for (const it of sorted) {
      const combo = `${it.guru_id}_${it.mapel_id}_${it.kelas_id}_${it.hari_index}`;
      
      // Check if this slot can be merged with current block
      const canMerge = currentBlock && 
        currentBlock.combo === combo &&
        it.slot === currentBlock.lastSlot + 1;

      if (canMerge) {
        // Add to current block
        currentBlock.slotItems.push(it);
        currentBlock.slots.push(it.slot);
        currentBlock.lastSlot = it.slot;
        currentBlock.size++;
      } else {
        // Start new block
        const hari_index = it.hari_index;
        const hari = (hari_index != null && dayNames.value[hari_index]) ? dayNames.value[hari_index] : `${hari_index}`;
        
        currentBlock = {
          block_id: it.block_ref || `${combo}_${it.slot}`,
          combo,
          guru_id: it.guru_id,
          guru_nama: guruMap.value[it.guru_id] || it.guru_id,
          mapel_id: it.mapel_id,
          mapel_nama: mapelMap.value[it.mapel_id] || it.mapel_id,
          kelas_id: it.kelas_id,
          kelas_nama: kelasMap.value[it.kelas_id] || it.kelas_id,
          hari_index,
          hari,
          start: it.slot,
          size: 1,
          slots: [it.slot],
          slotItems: [it],
          lastSlot: it.slot
        };
        blocks.push(currentBlock);
      }
    }

    // Remove temporary fields
    blocks.forEach(b => delete b.lastSlot && delete b.combo);
    
    return blocks;
  };

  // Load items by hari
  const loadHariItems = async () => {
    loadingItems.value = true;
    currentItems.value = [];
    
    try {
      const response = await jadwalRepository.getItems(periode.value, 'hari', selectedHari.value);
      const slotItems = response?.items ?? [];
      currentItems.value = aggregateSlotsToBlocks(slotItems);
    } catch (err) {
      console.error('Error loading hari items:', err);
      error.value = 'Gagal memuat jadwal hari';
    } finally {
      loadingItems.value = false;
    }
  };

  // Load items by kelas
  const loadKelasItems = async () => {
    if (!selectedKelas.value) {
      currentItems.value = [];
      return;
    }
    
    loadingItems.value = true;
    currentItems.value = [];
    
    try {
      const response = await jadwalRepository.getItems(periode.value, 'kelas', selectedKelas.value);
      const slotItems = response?.items ?? [];
      currentItems.value = aggregateSlotsToBlocks(slotItems);
    } catch (err) {
      console.error('Error loading kelas items:', err);
      error.value = 'Gagal memuat jadwal kelas';
    } finally {
      loadingItems.value = false;
    }
  };

  // Load items by guru
  const loadGuruItems = async () => {
    if (!selectedGuru.value) {
      currentItems.value = [];
      return;
    }
    
    loadingItems.value = true;
    currentItems.value = [];
    
    try {
      const response = await jadwalRepository.getItems(periode.value, 'guru', selectedGuru.value);
      const slotItems = response?.items ?? [];
      currentItems.value = aggregateSlotsToBlocks(slotItems);
    } catch (err) {
      console.error('Error loading guru items:', err);
      error.value = 'Gagal memuat jadwal guru';
    } finally {
      loadingItems.value = false;
    }
  };

  // Load all raw data
  const loadAllRawData = async () => {
    loadingItems.value = true;
    
    try {
      const response = await jadwalRepository.getItems(periode.value);
      rawItems.value = response?.items ?? [];
      rawDataLoaded.value = true;
    } catch (err) {
      console.error('Error loading raw data:', err);
      error.value = 'Gagal memuat data mentah';
    } finally {
      loadingItems.value = false;
    }
  };

  // Select hari handler
  const selectHari = async (index) => {
    selectedHari.value = index;
    await loadHariItems();
  };

  // Select kelas handler
  const selectKelas = async (id) => {
    selectedKelas.value = id;
    await loadKelasItems();
  };

  // Select guru handler
  const selectGuru = async (id) => {
    selectedGuru.value = id;
    await loadGuruItems();
  };

  // Clear selection functions
  const clearKelasSelection = () => {
    selectedKelas.value = '';
    currentItems.value = [];
  };

  const clearGuruSelection = () => {
    selectedGuru.value = '';
    currentItems.value = [];
  };

  // Helper functions
  const getKelasName = (id) => kelasMap.value[id] || id;
  const getGuruName = (id) => guruMap.value[id] || id;
  const getMapelName = (id) => mapelMap.value[id] || id;

  const getStatusVariant = (status) => {
    const variants = {
      ready: 'success',
      pending: 'warning',
      error: 'danger',
      not_found: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const formatReason = (reason) => {
    const reasons = {
      'GURU_TIDAK_TERSEDIA': 'Guru Tidak Tersedia',
      'MAPEL_TIDAK_DITEMUKAN': 'Mapel Tidak Ditemukan',
      'KELAS_TIDAK_DITEMUKAN': 'Kelas Tidak Ditemukan',
      'KAPASITAS_TIDAK_CUKUP': 'Kapasitas Tidak Cukup',
      'JADWAL_BENTROK': 'Jadwal Bentrok'
    };
    return reasons[reason] || reason;
  };

  const getReasonVariant = (reason) => {
    const variants = {
      'GURU_TIDAK_TERSEDIA': 'danger',
      'MAPEL_TIDAK_DITEMUKAN': 'warning',
      'KELAS_TIDAK_DITEMUKAN': 'warning',
      'KAPASITAS_TIDAK_CUKUP': 'secondary',
      'JADWAL_BENTROK': 'danger'
    };
    return variants[reason] || 'secondary';
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

  // Computed properties
  const diagnostics = computed(() => jadwalStatus.value?.diagnostics || {});
  
  const kelasMapelTidakTerpenuhi = computed(() => {
    return diagnostics.value?.kelas_mapel_tidak_terpenuhi || [];
  });
  
  const mapelTanpaGuru = computed(() => {
    return diagnostics.value?.mapel_tanpa_guru || [];
  });
  
  const kelasOverCapacity = computed(() => {
    return diagnostics.value?.kelas_over_capacity || [];
  });
  
  const deficitCount = computed(() => {
    return kelasMapelTidakTerpenuhi.value.length;
  });

  const totalJP = computed(() => {
    return currentItems.value.reduce((sum, item) => sum + (item.size || 0), 0);
  });

  // Kelas columns for grid (ordered)
  const kelasOrderedForDay = computed(() => {
    const seen = new Map();
    currentItems.value.forEach(it => {
      if (!seen.has(it.kelas_id)) {
        seen.set(it.kelas_id, { id: it.kelas_id, nama: it.kelas_nama || it.kelas_id });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  });

  // Build grid rows for Per Hari view
  const gridRows = computed(() => {
    const kelasCols = kelasOrderedForDay.value;
    if (kelasCols.length === 0) return [];
    
    const blocks = currentItems.value;
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
        ? b.slots.slice().sort((a, b) => a - b)
        : Array.from({ length: b.size || 0 }, (_, i) => (b.start || 0) + i);
      if (!slots.length) continue;
      
      const segments = [];
      let currentSegment = [];
      slots.forEach((slot) => {
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
          text: { mapel: b.mapel_nama || b.mapel_id, guru: b.guru_nama || b.guru_id },
          block: b  // Include block data for edit modal
        };
        for (let i = 1; i < segSize; i++) {
          const sVal = segmentSlots[i];
          cellMap.get(k)[sVal] = { show: false, rowspan: 0, key: `${baseKey}_${i}`, text: null, block: null };
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
      const row = { key: `slot-${selectedHari.value}-${s}`, slot: s, cells: [], isBreak: false };
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
          key: `break-${selectedHari.value}-${s}`,
          isBreak: true,
          label: breakLookup[s],
        });
      }
    }
    
    return rows;
  });

  const processedKelasItems = computed(() => {
    return currentItems.value
      .slice()
      .sort((a, b) => {
        if (a.hari_index !== b.hari_index) return a.hari_index - b.hari_index;
        return (a.start || 0) - (b.start || 0);
      })
      .map(item => ({
        hari: item.hari,
        start: item.start,
        mapel: item.mapel_nama || item.mapel_id,
        guru: item.guru_nama || item.guru_id,
        size: item.size
      }));
  });

  const processedGuruItems = computed(() => {
    return currentItems.value
      .slice()
      .sort((a, b) => {
        if (a.hari_index !== b.hari_index) return a.hari_index - b.hari_index;
        return (a.start || 0) - (b.start || 0);
      })
      .map(item => ({
        hari: item.hari,
        start: item.start,
        kelas: item.kelas_nama || item.kelas_id,
        mapel: item.mapel_nama || item.mapel_id,
        size: item.size
      }));
  });

  const filteredKelasList = computed(() => {
    return kelasList.value;
  });

  const filteredGuruList = computed(() => {
    return guruList.value;
  });

  // Reset all state (useful when leaving the page)
  const resetState = () => {
    periode.value = '';
    jadwalStatus.value = null;
    currentItems.value = [];
    rawItems.value = [];
    rawDataLoaded.value = false;
    selectedHari.value = 0;
    selectedKelas.value = '';
    selectedGuru.value = '';
    error.value = '';
  };

  return {
    // State
    periode,
    loadingStatus,
    loadingItems,
    error,
    jadwalStatus,
    currentItems,
    rawItems,
    rawDataLoaded,
    dayNames,
    guruList,
    kelasList,
    mapelList,
    guruMap,
    mapelMap,
    kelasMap,
    breakMarkers,
    selectedHari,
    selectedKelas,
    selectedGuru,
    
    // Computed
    diagnostics,
    kelasMapelTidakTerpenuhi,
    mapelTanpaGuru,
    kelasOverCapacity,
    deficitCount,
    totalJP,
    kelasOrderedForDay,
    gridRows,
    processedKelasItems,
    processedGuruItems,
    filteredKelasList,
    filteredGuruList,
    
    // Methods
    initPeriode,
    loadKonfigurasi,
    loadReferences,
    loadJadwalStatus,
    loadHariItems,
    loadKelasItems,
    loadGuruItems,
    loadAllRawData,
    selectHari,
    selectKelas,
    selectGuru,
    clearKelasSelection,
    clearGuruSelection,
    getKelasName,
    getGuruName,
    getMapelName,
    getStatusVariant,
    formatReason,
    getReasonVariant,
    formatDate,
    resetState,
    aggregateSlotsToBlocks
  };
}
