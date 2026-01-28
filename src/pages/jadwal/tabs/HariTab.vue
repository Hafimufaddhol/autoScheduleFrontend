<template>
  <div>
    <!-- Day Selector -->
    <div class="mb-6 flex items-center gap-4">
      <label class="font-medium text-gray-700">Pilih Hari:</label>
      <div class="flex gap-2">
        <button
          v-for="(day, index) in dayNames"
          :key="index"
          @click="handleSelectHari(index)"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            selectedHari === index
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <!-- Loading Items -->
    <div v-if="loadingItems" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-2xl text-cyan-600"></i>
      <p class="mt-2 text-gray-600">Memuat jadwal hari {{ dayNames[selectedHari] }}...</p>
    </div>

    <!-- Grid Table -->
    <div v-else-if="currentItems.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-900">
        Jadwal Hari {{ dayNames[selectedHari] }}
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th class="border px-2 py-2 w-16 text-xs uppercase bg-gray-50">Jam ke</th>
              <th v-for="k in kelasOrderedForDay" :key="k.id" class="border px-2 py-2 text-xs uppercase bg-gray-50">
                {{ k.nama }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in gridRows" :key="row.key || row.slot" :class="row.isBreak ? 'bg-yellow-50' : ''">
              <template v-if="row.isBreak">
                <td :colspan="kelasOrderedForDay.length + 1" class="border px-2 py-1 text-center text-xs font-semibold text-yellow-700">
                  {{ row.label || 'Istirahat' }}
                </td>
              </template>
              <template v-else>
                <td class="border px-2 py-1 text-center text-sm bg-gray-50 font-semibold">{{ row.slot }}</td>
                <template v-for="cell in row.cells" :key="cell.key">
                  <td 
                    v-if="cell.show" 
                    :rowspan="cell.rowspan" 
                    class="border align-top p-2 text-xs"
                    :class="{ 'cursor-pointer hover:bg-cyan-50': cell.block }"
                    @click="cell.block ? openEdit(cell.block) : null"
                  >
                    <div v-if="cell.text" class="space-y-1">
                      <div class="font-semibold text-gray-900">{{ cell.text.mapel }}</div>
                      <div class="text-gray-600">{{ cell.text.guru }}</div>
                      <div class="text-xs text-cyan-600 opacity-0 hover:opacity-100 transition-opacity">
                        <i class="fas fa-edit"></i> Edit
                      </div>
                    </div>
                  </td>
                </template>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
      <i class="fas fa-calendar-times text-3xl mb-2"></i>
      <p>Tidak ada jadwal untuk hari {{ dayNames[selectedHari] }}.</p>
    </div>
  </div>
</template>

<script>
import { useJadwalDetail } from '../composables/useJadwalDetail';

export default {
  name: 'HariTab',
  emits: ['open-edit'],
  setup(_, { emit }) {
    const {
      loadingItems,
      currentItems,
      dayNames,
      selectedHari,
      kelasOrderedForDay,
      gridRows,
      selectHari
    } = useJadwalDetail();

    const handleSelectHari = async (index) => {
      await selectHari(index);
    };

    const openEdit = (block) => {
      emit('open-edit', block);
    };

    return {
      loadingItems,
      currentItems,
      dayNames,
      selectedHari,
      kelasOrderedForDay,
      gridRows,
      handleSelectHari,
      openEdit
    };
  }
};
</script>
