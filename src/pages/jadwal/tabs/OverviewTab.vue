<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Stat Cards -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-cyan-100 text-cyan-600">
            <i class="fas fa-book text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Demand</p>
            <p class="text-2xl font-bold text-gray-900">{{ diagnostics?.meta?.total_demand || 0 }} JP</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <i class="fas fa-check-circle text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Assigned</p>
            <p class="text-2xl font-bold text-gray-900">{{ diagnostics?.meta?.assigned_demand || 0 }} JP</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <i class="fas fa-users text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Supply</p>
            <p class="text-2xl font-bold text-gray-900">{{ diagnostics?.meta?.total_supply || 0 }} JP</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full" :class="deficitCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
            <i class="fas" :class="deficitCount > 0 ? 'fa-exclamation-triangle' : 'fa-check'"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Deficit</p>
            <p class="text-2xl font-bold" :class="deficitCount > 0 ? 'text-red-600' : 'text-green-600'">
              {{ deficitCount }} Kelas-Mapel
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Hari per Minggu</p>
        <p class="text-lg font-semibold">{{ diagnostics?.meta?.hari_per_minggu || '-' }} hari</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Slot per Hari</p>
        <p class="text-lg font-semibold">{{ diagnostics?.meta?.slot_per_hari || '-' }} slot</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Dibuat</p>
        <p class="text-lg font-semibold">{{ formatDate(jadwalStatus?.created_at) }}</p>
      </div>
    </div>

    <!-- Peringatan Umum -->
    <div v-if="peringatan.length > 0" class="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6">
      <h3 class="text-base font-bold text-amber-700 mb-3">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Peringatan
      </h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-amber-800">
        <li v-for="(msg, idx) in peringatan" :key="idx">{{ msg }}</li>
      </ul>
    </div>

    <!-- Kelas Mapel Tidak Terpenuhi -->
    <div v-if="kelasMapelTidakTerpenuhi.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-red-600 mb-4">
        <i class="fas fa-exclamation-circle mr-2"></i>
        Kelas-Mapel Tidak Terpenuhi ({{ kelasMapelTidakTerpenuhi.length }})
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mapel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JP</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, idx) in kelasMapelTidakTerpenuhi" :key="idx" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap">{{ item.kelas_nama || item.kelas_id }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ item.mapel_nama || item.mapel_id }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ item.jp }} JP</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <div class="flex flex-col gap-1">
                  <span>{{ item.pesan || formatReason(item.reason) }}</span>
                  <Badge :variant="getReasonVariant(item.reason)" class="w-fit">{{ formatReason(item.reason) }}</Badge>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mapel Tanpa Guru -->
    <div v-if="mapelTanpaGuru.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-orange-600 mb-4">
        <i class="fas fa-user-slash mr-2"></i>
        Mapel Tanpa Guru ({{ mapelTanpaGuru.length }})
      </h3>
      <div class="flex flex-wrap gap-2">
        <Badge v-for="mapelId in mapelTanpaGuru" :key="mapelId" variant="warning">
          {{ mapelMap[mapelId] || mapelId }}
        </Badge>
      </div>
    </div>

    <!-- Kelas Over Capacity -->
    <div v-if="kelasOverCapacity.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-yellow-600 mb-4">
        <i class="fas fa-exclamation mr-2"></i>
        Kelas Over Capacity ({{ kelasOverCapacity.length }})
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Over</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, idx) in kelasOverCapacity" :key="idx" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ kelasMap[item.kelas_id] || item.kelas_id }}</td>
              <td class="px-4 py-3">{{ item.demand }} JP</td>
              <td class="px-4 py-3">{{ item.capacity }} JP</td>
              <td class="px-4 py-3 text-red-600 font-semibold">+{{ item.demand - item.capacity }} JP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Phase Info -->
    <!-- <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        <i class="fas fa-cogs mr-2"></i>
        Informasi Proses
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Phase A Status</p>
          <p class="text-lg font-semibold">{{ diagnostics?.meta?.phase_a_status || '-' }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Phase B Strategy</p>
          <p class="text-lg font-semibold">{{ diagnostics?.meta?.phase_b_strategy || '-' }}</p>
        </div>
        <div v-if="diagnostics?.meta?.missing_guru_pairs" class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Missing Guru Pairs</p>
          <p class="text-lg font-semibold">{{ diagnostics?.meta?.missing_guru_pairs }}</p>
        </div>
        <div v-if="diagnostics?.meta?.missing_guru_demand" class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Missing Guru Demand</p>
          <p class="text-lg font-semibold">{{ diagnostics?.meta?.missing_guru_demand }} JP</p>
        </div>
      </div>
    </div> -->

    <!-- No Issues Message -->
    <div v-if="kelasMapelTidakTerpenuhi.length === 0 && mapelTanpaGuru.length === 0 && kelasOverCapacity.length === 0" 
         class="bg-green-50 border border-green-200 text-green-800 px-4 py-8 rounded text-center mt-6">
      <i class="fas fa-check-circle text-3xl mb-2"></i>
      <p class="font-medium">Semua kebutuhan jadwal terpenuhi!</p>
      <p class="text-sm mt-1">Tidak ada deficit atau masalah yang terdeteksi.</p>
    </div>
  </div>
</template>

<script>
import Badge from '@/components/ui/Badge.vue';
import { useJadwalDetail } from '../composables/useJadwalDetail';

export default {
  name: 'OverviewTab',
  components: {
    Badge
  },
  setup() {
    const {
      jadwalStatus,
      diagnostics,
      kelasMapelTidakTerpenuhi,
      mapelTanpaGuru,
      kelasOverCapacity,
      deficitCount,
      peringatan,
      mapelMap,
      kelasMap,
      formatReason,
      getReasonVariant,
      formatDate
    } = useJadwalDetail();

    return {
      jadwalStatus,
      diagnostics,
      kelasMapelTidakTerpenuhi,
      mapelTanpaGuru,
      kelasOverCapacity,
      deficitCount,
      peringatan,
      mapelMap,
      kelasMap,
      formatReason,
      getReasonVariant,
      formatDate
    };
  }
};
</script>
