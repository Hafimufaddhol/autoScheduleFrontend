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
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'overview',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'overview'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-chart-pie mr-2"></i>
            Overview
          </button>
          <button
            @click="switchTab('hari')"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'hari',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'hari'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-calendar-day mr-2"></i>
            Per Hari
          </button>
          <button
            @click="switchTab('kelas')"
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
            @click="switchTab('guru')"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'guru',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'guru'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-chalkboard-teacher mr-2"></i>
            Per Guru
          </button>
          <!-- <button
            @click="switchTab('raw')"
            :class="{
              'border-cyan-500 text-cyan-600': activeTab === 'raw',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'raw'
            }"
            class="py-4 px-1 border-b-2 font-medium text-sm"
          >
            <i class="fas fa-code mr-2"></i>
            Data Mentah
          </button> -->
        </nav>
      </div>

      <!-- Content -->
      <div class="mt-6">
        <!-- Overview View -->
        <div v-show="activeTab === 'overview'">
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
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JP Dibutuhkan</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, idx) in kelasMapelTidakTerpenuhi" :key="idx" class="hover:bg-gray-50">
                    <td class="px-4 py-3">{{ item.kelas_nama || item.kelas_id }}</td>
                    <td class="px-4 py-3">{{ item.mapel_nama || item.mapel_id }}</td>
                    <td class="px-4 py-3">{{ item.jp }} JP</td>
                    <td class="px-4 py-3">
                      <Badge :variant="getReasonVariant(item.reason)">{{ formatReason(item.reason) }}</Badge>
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
          <div class="bg-white rounded-lg shadow-md p-6">
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
          </div>

          <!-- No Issues Message -->
          <div v-if="kelasMapelTidakTerpenuhi.length === 0 && mapelTanpaGuru.length === 0 && kelasOverCapacity.length === 0" 
               class="bg-green-50 border border-green-200 text-green-800 px-4 py-8 rounded text-center mt-6">
            <i class="fas fa-check-circle text-3xl mb-2"></i>
            <p class="font-medium">Semua kebutuhan jadwal terpenuhi!</p>
            <p class="text-sm mt-1">Tidak ada deficit atau masalah yang terdeteksi.</p>
          </div>
        </div>

        <!-- Per Hari View -->
        <div v-show="activeTab === 'hari'">
          <!-- Day Selector -->
          <div class="mb-6 flex items-center gap-4">
            <label class="font-medium text-gray-700">Pilih Hari:</label>
            <div class="flex gap-2">
              <button
                v-for="(day, index) in dayNames"
                :key="index"
                @click="selectHari(index)"
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

          <div v-else class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
            <i class="fas fa-calendar-times text-3xl mb-2"></i>
            <p>Tidak ada jadwal untuk hari {{ dayNames[selectedHari] }}.</p>
          </div>
        </div>

        <!-- Per Kelas View -->
        <div v-show="activeTab === 'kelas'">
          <!-- Kelas Selector (Searchable) -->
          <div class="mb-6 flex items-center gap-4">
            <label class="font-medium text-gray-700">Pilih Kelas:</label>
            <div class="relative min-w-64" ref="kelasDropdownRef">
              <button
                type="button"
                class="inline-flex items-center justify-between gap-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                @click.stop.prevent="toggleKelasDropdown"
              >
                <span>{{ selectedKelas ? getKelasName(selectedKelas) : 'Pilih Kelas' }}</span>
                <i :class="['fa-solid', 'fa-chevron-' + (kelasDropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
              </button>
              <transition name="fade">
                <div
                  v-if="kelasDropdownOpen"
                  class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  <div class="p-3 border-b border-gray-100">
                    <input
                      v-model="kelasSearch"
                      type="text"
                      placeholder="Cari kelas..."
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
                      @click.stop
                    />
                  </div>
                  <div class="max-h-60 overflow-y-auto">
                    <button
                      v-for="kelas in filteredKelasList"
                      :key="kelas.id"
                      type="button"
                      class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                      @click.stop.prevent="selectKelas(kelas.id)"
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
                    <p v-if="!filteredKelasList.length" class="p-4 text-sm text-gray-500">Kelas tidak ditemukan.</p>
                  </div>
                </div>
              </transition>
            </div>
            <button
              v-if="selectedKelas"
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="clearKelasSelection"
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
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, idx) in processedKelasItems" :key="idx" class="hover:bg-gray-50">
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.hari }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.start }}</td>
                    <td class="px-4 py-3">{{ item.mapel }}</td>
                    <td class="px-4 py-3">{{ item.guru }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.size }} JP</td>
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

        <!-- Per Guru View -->
        <div v-show="activeTab === 'guru'">
          <!-- Guru Selector (Searchable) -->
          <div class="mb-6 flex items-center gap-4">
            <label class="font-medium text-gray-700">Pilih Guru:</label>
            <div class="relative min-w-64" ref="guruDropdownRef">
              <button
                type="button"
                class="inline-flex items-center justify-between gap-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                @click.stop.prevent="toggleGuruDropdown"
              >
                <span>{{ selectedGuru ? getGuruName(selectedGuru) : 'Pilih Guru' }}</span>
                <i :class="['fa-solid', 'fa-chevron-' + (guruDropdownOpen ? 'up' : 'down'), 'text-xs']"></i>
              </button>
              <transition name="fade">
                <div
                  v-if="guruDropdownOpen"
                  class="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  <div class="p-3 border-b border-gray-100">
                    <input
                      v-model="guruSearch"
                      type="text"
                      placeholder="Cari guru..."
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
                      @click.stop
                    />
                  </div>
                  <div class="max-h-60 overflow-y-auto">
                    <button
                      v-for="guru in filteredGuruList"
                      :key="guru.id"
                      type="button"
                      class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                      @click.stop.prevent="selectGuru(guru.id)"
                    >
                      <div>
                        <p class="font-medium text-gray-900">{{ guru.nama || guru.kode || guru.id }}</p>
                        <p v-if="guru.kode && guru.nama" class="text-xs text-gray-500">{{ guru.kode }}</p>
                      </div>
                      <i
                        v-if="selectedGuru === guru.id"
                        class="fa-solid fa-check text-cyan-600"
                      ></i>
                    </button>
                    <p v-if="!filteredGuruList.length" class="p-4 text-sm text-gray-500">Guru tidak ditemukan.</p>
                  </div>
                </div>
              </transition>
            </div>
            <button
              v-if="selectedGuru"
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="clearGuruSelection"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Loading Items -->
          <div v-if="loadingItems" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-2xl text-cyan-600"></i>
            <p class="mt-2 text-gray-600">Memuat jadwal guru...</p>
          </div>

          <!-- Items Table -->
          <div v-else-if="selectedGuru && currentItems.length > 0" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-4 text-gray-900">
              Jadwal Guru {{ getGuruName(selectedGuru) }}
              <span class="text-sm font-normal text-gray-500 ml-2">({{ totalJP }} JP)</span>
            </h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, idx) in processedGuruItems" :key="idx" class="hover:bg-gray-50">
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.hari }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.start }}</td>
                    <td class="px-4 py-3">{{ item.kelas }}</td>
                    <td class="px-4 py-3">{{ item.mapel }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ item.size }} JP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="selectedGuru && currentItems.length === 0" class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
            <i class="fas fa-chalkboard-teacher text-3xl mb-2"></i>
            <p>Tidak ada jadwal untuk guru ini.</p>
          </div>

          <div v-else class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-8 rounded text-center">
            <i class="fas fa-hand-pointer text-3xl mb-2"></i>
            <p>Silakan pilih guru untuk melihat jadwal.</p>
          </div>
        </div>

        <!-- Raw Data View -->
        <div v-show="activeTab === 'raw'">
          <!-- Load All Button -->
          <div v-if="!rawDataLoaded" class="mb-4">
            <button
              @click="loadAllRawData"
              :disabled="loadingItems"
              class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              <i v-if="loadingItems" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-download mr-2"></i>
              Muat Semua Data
            </button>
          </div>

          <div v-if="loadingItems && activeTab === 'raw'" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-2xl text-cyan-600"></i>
            <p class="mt-2 text-gray-600">Memuat semua data jadwal...</p>
          </div>

          <div v-else-if="rawDataLoaded && rawItems.length > 0" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-4 text-gray-900">
              Data Mentah (JSON) 
              <span class="text-sm font-normal text-gray-500">- {{ rawItems.length }} items</span>
            </h2>
            <pre class="bg-gray-50 p-4 rounded overflow-x-auto text-sm max-h-96 overflow-y-auto">{{ JSON.stringify(rawItems, null, 2) }}</pre>
          </div>

          <div v-else-if="rawDataLoaded && rawItems.length === 0" class="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-8 rounded text-center">
            <i class="fas fa-database text-3xl mb-2"></i>
            <p>Tidak ada data jadwal.</p>
          </div>

          <div v-else class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-8 rounded text-center">
            <i class="fas fa-info-circle text-3xl mb-2"></i>
            <p>Klik tombol "Muat Semua Data" untuk melihat data mentah.</p>
          </div>
        </div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
    
    // Loading states
    const loadingStatus = ref(false);
    const loadingItems = ref(false);
    const error = ref('');
    
    // Status data
    const jadwalStatus = ref(null);
    
    // Current items for display (lazy loaded)
    const currentItems = ref([]);
    const rawItems = ref([]);
    const rawDataLoaded = ref(false);
    
    // Tab state
    const activeTab = ref('overview');
    
    // Selection states
    const selectedHari = ref(0); // Default Senin
    const selectedKelas = ref('');
    const selectedGuru = ref('');
    
    // Searchable dropdown states
    const kelasDropdownOpen = ref(false);
    const kelasDropdownRef = ref(null);
    const kelasSearch = ref('');
    const guruDropdownOpen = ref(false);
    const guruDropdownRef = ref(null);
    const guruSearch = ref('');
    
    // Reference lists
    const dayNames = ref(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
    const guruList = ref([]);
    const kelasList = ref([]);
    const guruMap = ref({});
    const mapelMap = ref({});
    const kelasMap = ref({});
    const breakMarkers = ref([]);

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
        
        // Mapel map
        const mapelArr = mapelData?.data ?? mapelData ?? [];
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
        
        // If ready, load initial data for first tab
        if (response?.status === 'ready') {
          await loadHariItems();
        }
      } catch (err) {
        console.error('Error loading jadwal status:', err);
        error.value = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      } finally {
        loadingStatus.value = false;
      }
    };

    // Aggregate slot items to blocks
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
        arr.sort((a, b) => (a.slot || 0) - (b.slot || 0));
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
      // raw tab loads on demand
    };

    // Select hari handler
    const selectHari = async (index) => {
      selectedHari.value = index;
      await loadHariItems();
    };

    // Processed items for each view
    const processedHariItems = computed(() => {
      return currentItems.value
        .slice()
        .sort((a, b) => {
          if (a.kelas_nama !== b.kelas_nama) return a.kelas_nama.localeCompare(b.kelas_nama);
          return (a.start || 0) - (b.start || 0);
        })
        .map(item => ({
          start: item.start,
          kelas: item.kelas_nama || item.kelas_id,
          mapel: item.mapel_nama || item.mapel_id,
          guru: item.guru_nama || item.guru_id,
          size: item.size
        }));
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

    // Total JP
    const totalJP = computed(() => {
      return currentItems.value.reduce((sum, item) => sum + (item.size || 0), 0);
    });

    // Diagnostics computed properties for Overview tab
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

    // Filtered lists for searchable dropdowns
    const filteredKelasList = computed(() => {
      if (!kelasSearch.value) return kelasList.value;
      const keyword = kelasSearch.value.toLowerCase();
      return kelasList.value.filter(k => {
        const nama = (k.nama || '').toLowerCase();
        const kode = (k.kode || '').toLowerCase();
        return nama.includes(keyword) || kode.includes(keyword);
      });
    });

    const filteredGuruList = computed(() => {
      if (!guruSearch.value) return guruList.value;
      const keyword = guruSearch.value.toLowerCase();
      return guruList.value.filter(g => {
        const nama = (g.nama || '').toLowerCase();
        const kode = (g.kode || '').toLowerCase();
        return nama.includes(keyword) || kode.includes(keyword);
      });
    });

    // Dropdown toggle functions
    const toggleKelasDropdown = () => {
      kelasDropdownOpen.value = !kelasDropdownOpen.value;
      guruDropdownOpen.value = false;
      if (kelasDropdownOpen.value) {
        kelasSearch.value = '';
      }
    };

    const toggleGuruDropdown = () => {
      guruDropdownOpen.value = !guruDropdownOpen.value;
      kelasDropdownOpen.value = false;
      if (guruDropdownOpen.value) {
        guruSearch.value = '';
      }
    };

    // Select functions
    const selectKelas = (id) => {
      selectedKelas.value = id;
      kelasDropdownOpen.value = false;
      kelasSearch.value = '';
      loadKelasItems();
    };

    const selectGuru = (id) => {
      selectedGuru.value = id;
      guruDropdownOpen.value = false;
      guruSearch.value = '';
      loadGuruItems();
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

    // Click outside handler for dropdowns
    const handleClickOutside = (event) => {
      if (kelasDropdownRef.value && !kelasDropdownRef.value.contains(event.target)) {
        kelasDropdownOpen.value = false;
      }
      if (guruDropdownRef.value && !guruDropdownRef.value.contains(event.target)) {
        guruDropdownOpen.value = false;
      }
    };

    // Helper functions
    const getKelasName = (id) => kelasMap.value[id] || id;
    const getGuruName = (id) => guruMap.value[id] || id;

    const getStatusVariant = (status) => {
      const variants = {
        ready: 'success',
        pending: 'warning',
        error: 'danger',
        not_found: 'secondary'
      };
      return variants[status] || 'secondary';
    };

    // Helper functions for Overview tab
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

    const goBack = () => {
      router.push({ name: 'Jadwal' });
    };

    onMounted(async () => {
      document.addEventListener('click', handleClickOutside);
      await Promise.all([loadKonfigurasi(), loadReferences()]);
      await loadJadwalStatus();
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      periode,
      loadingStatus,
      loadingItems,
      error,
      jadwalStatus,
      currentItems,
      rawItems,
      rawDataLoaded,
      activeTab,
      selectedHari,
      selectedKelas,
      selectedGuru,
      dayNames,
      guruList,
      kelasList,
      kelasOrderedForDay,
      gridRows,
      processedHariItems,
      processedKelasItems,
      processedGuruItems,
      totalJP,
      // Searchable dropdown states and functions
      kelasDropdownOpen,
      kelasDropdownRef,
      kelasSearch,
      guruDropdownOpen,
      guruDropdownRef,
      guruSearch,
      filteredKelasList,
      filteredGuruList,
      toggleKelasDropdown,
      toggleGuruDropdown,
      selectKelas,
      selectGuru,
      clearKelasSelection,
      clearGuruSelection,
      // Overview tab data
      diagnostics,
      kelasMapelTidakTerpenuhi,
      mapelTanpaGuru,
      kelasOverCapacity,
      deficitCount,
      mapelMap,
      kelasMap,
      formatReason,
      getReasonVariant,
      // Other functions
      switchTab,
      selectHari,
      loadKelasItems,
      loadGuruItems,
      loadAllRawData,
      getKelasName,
      getGuruName,
      getStatusVariant,
      formatDate,
      goBack
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
