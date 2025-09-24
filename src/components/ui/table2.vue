<template>
    <div class="w-full">
        <!-- Table -->
        <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <!-- <th v-if="selectable" class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="allSelected"
                />
              </th> -->
                        <th v-for="col in columns" :key="col.key"
                            class="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer"
                            @click="handleSort(col)">
                            {{ col.label }}
                            <span v-if="sortKey === col.key">
                                {{ sortOrder === 'asc' ? '▲' : '▼' }}
                            </span>
                        </th>
                        <th v-if="showActions" class="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-if="loading">
                        <td :colspan="columns.length + (showActions ? 1 : 0)" class="px-4 py-6 text-center">
                            Loading...
                        </td>
                    </tr>
                    <tr v-else-if="!data.length">
                        <td :colspan="columns.length + (showActions ? 1 : 0)"
                            class="px-4 py-6 text-center text-gray-500">
                            No data found
                        </td>
                    </tr>
                    <tr v-for="row in paginatedData" :key="row.id" class="hover:bg-gray-50">
                        <!-- <td v-if="selectable" class="px-4 py-2">
                <input type="checkbox" v-model="selectedIds" :value="row.id" />
              </td> -->
                        <td v-for="col in columns" :key="col.key" class="px-4 py-2 text-sm text-gray-800">
                            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                                {{ row[col.key] }}
                            </slot>
                        </td>
                        <td v-if="showActions" class="px-4 py-2 text-sm">
                            <slot name="actions" :row="row">
                                <button class="px-2 py-1 border rounded hover:bg-gray-100 mr-2"
                                    @click="$emit('edit', row)">
                                    ✏️
                                </button>
                                <button class="px-2 py-1 border rounded hover:bg-gray-100 text-red-600"
                                    @click="$emit('delete', row)">
                                    🗑
                                </button>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

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
                    dari <span class="text-gray-900 font-semibold">{{ totalItems }}</span>
                </span>
            </div>

            <!-- Page size selector -->
            <div class="flex items-center space-x-3">
                <label class="text-sm text-gray-600">Jumlah baris:</label>
                <select v-model.number="pageSize"
                    class="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex items-center space-x-1">
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Previous
                </button>

                <!-- Nomor halaman -->
                <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
                    'px-3 py-2 rounded-lg text-sm border',
                    page === currentPage
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-white hover:bg-gray-100',
                ]">
                    {{ page }}
                </button>

                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-lg text-sm border bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    showActions: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    showPagination: { type: Boolean, default: false },
    // pageSize: { type: Number, default: 5 },
});

const pageSize = ref(5); // default rows per page


const emit = defineEmits(["edit", "delete", "sort", "update:modelValue"]);

const selectedIds = ref([]);
const sortKey = ref("");
const sortOrder = ref("asc");
const currentPage = ref(1);

const allSelected = computed(() => {
    return props.data.length && selectedIds.value.length === props.data.length;
});

watch(selectedIds, (val) => {
    emit("update:modelValue", val);
});

watch(pageSize, () => {
    currentPage.value = 1;
});


// sorting
const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey.value === col.key) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
        sortKey.value = col.key;
        sortOrder.value = "asc";
    }
    emit("sort", { key: sortKey.value, order: sortOrder.value });
};

const sortedData = computed(() => {
    if (!sortKey.value) return props.data;
    return [...props.data].sort((a, b) => {
        if (a[sortKey.value] < b[sortKey.value])
            return sortOrder.value === "asc" ? -1 : 1;
        if (a[sortKey.value] > b[sortKey.value])
            return sortOrder.value === "asc" ? 1 : -1;
        return 0;
    });
});

// pagination
const totalPages = computed(() =>
    Math.ceil(sortedData.value.length / pageSize.value)||1
);
const totalItems = computed(() => sortedData.value.length);

const paginatedData = computed(() => {
    if (!props.showPagination) return sortedData.value;
    const start = (currentPage.value - 1) * pageSize.value;
    return sortedData.value.slice(start, start + pageSize.value);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const toggleSelectAll = (e) => {
    if (e.target.checked) {
        selectedIds.value = props.data.map((d) => d.id);
    } else {
        selectedIds.value = [];
    }
};
</script>