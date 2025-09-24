<template>
    <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th v-for="col in columns" :key="col.key" scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        @click="$emit('sort', { key: col.key })">
                        {{ col.label }}
                    </th>
                    <th v-if="showActions" scope="col"
                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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

                    <td v-if="showActions" class="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button class="text-cyan-600 hover:text-cyan-900" @click="$emit('edit', row)">
                            Edit
                        </button>
                        <button class="text-red-600 hover:text-red-900" @click="$emit('delete', row)">
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="showPagination && totalPages > 1"
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
    totalItems: { type: Number, default: 0 },   // 🔥 jumlah total data
    pageSize: { type: Number, default: 10 },
})
</script>