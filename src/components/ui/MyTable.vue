<template>
    <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 ">
            <thead class="bg-gray-100">
                <tr>
                    <th v-for="col in columns" :key="col.key" scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wide select-none"
                        :class="col.sortable === false ? 'cursor-default text-gray-700' : 'cursor-pointer'"
                        @click="handleColumnClick(col)">
                        <div class="flex items-center space-x-1">
                            <span>{{ col.label }}</span>
                            <!-- Ikon Sort -->
                            <template v-if="col.sortable !== false">
                                <i v-if="sortKey === col.key" :class="[
                                    sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down',
                                    'text-gray-600 text-xs'
                                ]"></i>
                                <i v-else class="fas fa-sort text-gray-400 text-xs"></i>
                            </template>
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
                        <button type="button" @click="emit('edit', row)"
                            class="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200 font-medium rounded-lg text-base inline-flex items-center justify-center px-4 py-3">
                            <i class="fas fa-edit"></i>
                        </button>

                        <!-- Delete Button -->
                        <button type="button" @click="emit('delete', row)"
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
            <div class="flex items-center space-x-3 relative" ref="pageSizeMenuRef">
                <label class="text-sm text-gray-600">Jumlah baris:</label>
                <div class="relative">
                    <button type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        @click.stop="togglePageSizeMenu">
                        {{ pageSize }}
                        <i class="fa-solid fa-chevron-down text-xs"></i>
                    </button>
                    <transition name="fade">
                        <div v-if="pageSizeMenuOpen"
                            class="absolute right-0 bottom-full z-20 mb-2 w-36 origin-bottom-right rounded-lg border border-gray-200 bg-white p-1 shadow-xl">
                            <button v-for="option in pageSizeOptions" :key="option" type="button"
                                class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                                @click.stop="selectPageSize(option)">
                                <span>{{ option }} baris</span>
                                <i v-if="pageSize === option" class="fa-solid fa-check text-cyan-600"></i>
                            </button>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex items-center space-x-1">
                <button @click="emit('prev-page')" :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Previous
                </button>

                <!-- Nomor halaman -->
                <button v-for="page in totalPages" :key="page" @click="emit('go-to-page', page)" :class="[
                    'px-3 py-2 rounded-lg text-sm border',
                    page === currentPage
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-white hover:bg-gray-100',
                ]">
                    {{ page }}
                </button>

                <button @click="emit('next-page')" :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['sort', 'edit', 'delete', 'prev-page', 'next-page', 'go-to-page', 'update:pageSize'])

const handleColumnClick = (col) => {
    if (col.sortable === false) return
    emit('sort', { key: col.key })
}

const pageSizeOptions = [5, 10, 50, 100]
const pageSizeMenuOpen = ref(false)
const pageSizeMenuRef = ref(null)

const togglePageSizeMenu = () => {
    pageSizeMenuOpen.value = !pageSizeMenuOpen.value
}

const closePageSizeMenu = () => {
    pageSizeMenuOpen.value = false
}

const selectPageSize = (value) => {
    emit('update:pageSize', value)
    closePageSizeMenu()
}

const handleClickOutside = (event) => {
    if (!pageSizeMenuRef.value) return
    if (!pageSizeMenuRef.value.contains(event.target)) {
        closePageSizeMenu()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(4px);
}
</style>