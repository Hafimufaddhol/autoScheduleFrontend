<template>
    <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 ">
            <thead class="bg-gray-100">
                <tr>
                    <th v-for="col in columns" :key="col.key" scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide cursor-pointer select-none"
                        @click="$emit('sort', { key: col.key })">
                        <div class="flex items-center space-x-1">
                            <span>{{ col.label }}</span>
                            <!-- Ikon Sort -->
                            <i v-if="sortKey === col.key" :class="[
                                sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down',
                                'text-gray-600 text-xs'
                            ]"></i>
                            <i v-else class="fas fa-sort text-gray-400 text-xs"></i>
                        </div>
                    </th>


                    <th v-if="showActions" scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide cursor-pointer">
                        Action
                    </th>
                </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
                <!-- Loading state -->
                <tr v-if="loading">
                    <td colspan="100%" class="px-6 py-4 text-center text-gray-500">
                        Loading...
                    </td>
                </tr>

                <!-- Empty state -->
                <tr v-else-if="!data.length">
                    <td colspan="100%" class="px-6 py-4 text-center text-gray-500">
                        No data available
                    </td>
                </tr>

                <!-- Data rows -->
                <tr v-for="row in data" :key="row.id" class="hover:bg-gray-50">
                    <td v-for="col in columns" :key="col.key" class="px-6 py-4 text-sm text-gray-900">
                        <!-- Scoped slot untuk custom cell -->
                        <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                            <!-- fallback -->
                            {{ row[col.key] }}
                        </slot>
                    </td>

                    <td v-if="showActions" class="p-4 whitespace-nowrap space-x-2 text-right">
                        <!-- Edit Button -->
                        <button type="button" @click="$emit('edit', row)"
                            class="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200 font-medium rounded-lg text-base inline-flex items-center justify-center px-4 py-3">
                            <i class="fas fa-edit"></i>
                        </button>

                        <!-- Delete Button -->
                        <button type="button" @click="$emit('delete', row)"
                            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center justify-center px-4 py-3">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>



                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div 
            class="bg-transparent sticky sm:flex items-center w-full sm:justify-between bottom-0 right-0 border-t border-gray-200 p-4">
            <!-- Info -->
            <div class="flex items-center mb-4 sm:mb-0">
                <span class="text-sm font-normal text-gray-500">
                    Menampilkan
                    <span class="text-gray-900 font-semibold">
                        {{ (currentPage - 1) * pageSize + 1 }}
                    </span>
                    -
                    <span class="text-gray-900 font-semibold">
                        {{ Math.min(currentPage * pageSize, totalItems) }}
                    </span>
                    dari
                    <span class="text-gray-900 font-semibold">{{ totalItems }}</span>
                </span>
            </div>

            <!-- Page size selector -->
            <div class="flex items-center space-x-3">
                <label class="text-sm text-gray-600">Jumlah baris:</label>
                <select :value="pageSize" @change="$emit('update:pageSize', +$event.target.value)"
                    class="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex items-center space-x-1">
                <button @click="$emit('prev-page')" :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Previous
                </button>

                <!-- Nomor halaman -->
                <button v-for="page in totalPages" :key="page" @click="$emit('go-to-page', page)" :class="[
                    'px-3 py-2 rounded-lg text-sm border',
                    page === currentPage
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-white hover:bg-gray-100',
                ]">
                    {{ page }}
                </button>

                <button @click="$emit('next-page')" :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>

    </div>
</template>

<script setup>


defineProps({
    data: { type: Array, required: true },
    columns: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    showActions: { type: Boolean, default: false },
    showPagination: { type: Boolean, default: false },
    currentPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    totalItems: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    sortKey: { type: String, default: null },   // 🔥 tambahan
    sortOrder: { type: String, default: null }, // 🔥 tambahan
})

</script>