<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500">
      <!-- Table Head -->
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th
            v-if="selectable"
            scope="col"
            class="px-6 py-3"
          >
            <input type="checkbox" v-model="selectAll" @change="toggleAll" />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="px-6 py-3 cursor-pointer select-none"
            @click="toggleSort(col)"
          >
            {{ col.label }}
            <span v-if="sort?.key === col.key">
              {{ sort.order === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th v-if="$slots.actions" scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody>
        <tr
          v-if="loading"
          class="bg-white border-b"
        >
          <td :colspan="columns.length + (selectable ? 1 : 0) + ($slots.actions ? 1 : 0)"
              class="px-6 py-4 text-center">
            Loading...
          </td>
        </tr>

        <tr
          v-else-if="!data.length"
          class="bg-white border-b"
        >
          <td :colspan="columns.length + (selectable ? 1 : 0) + ($slots.actions ? 1 : 0)"
              class="px-6 py-4 text-center">
            No data available
          </td>
        </tr>

        <tr
          v-else
          v-for="row in data"
          :key="row.id"
          class="bg-white border-b hover:bg-gray-50"
        >
          <td v-if="selectable" class="px-6 py-4">
            <input type="checkbox" v-model="selectedIds" :value="row.id" />
          </td>
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-4"
          >
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav
      v-if="pagination"
      class="flex items-center justify-between p-4"
      aria-label="Table navigation"
    >
      <span class="text-sm font-normal text-gray-500">
        Showing
        <span class="font-semibold text-gray-900">{{ pagination.from }}</span>
        to
        <span class="font-semibold text-gray-900">{{ pagination.to }}</span>
        of
        <span class="font-semibold text-gray-900">{{ pagination.total }}</span>
      </span>
      <ul class="inline-flex items-center -space-x-px">
        <li>
          <button
            class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            :disabled="pagination.currentPage === 1"
            @click="prevPage"
          >
            Previous
          </button>
        </li>
        <li v-for="page in totalPages" :key="page">
          <button
            class="px-3 py-2 leading-tight border border-gray-300"
            :class="page === pagination.currentPage
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
              : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </li>
        <li>
          <button
            class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            :disabled="pagination.currentPage === totalPages"
            @click="nextPage"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null },
  sort: { type: Object, default: null },
  selectable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:sort', 'update:page', 'update:selected'])

const selectedIds = ref([])
const selectAll = ref(false)

watch(selectedIds, (val) => {
  emit('update:selected', val)
  selectAll.value = props.data.length > 0 && val.length === props.data.length
})

const totalPages = computed(() =>
  props.pagination ? Math.ceil(props.pagination.total / props.pagination.perPage) : 1
)

function toggleSort(col) {
  if (!col.sortable) return
  if (props.sort?.key === col.key) {
    emit('update:sort', {
      key: col.key,
      order: props.sort.order === 'asc' ? 'desc' : 'asc'
    })
  } else {
    emit('update:sort', { key: col.key, order: 'asc' })
  }
}

function toggleAll() {
  if (selectAll.value) {
    selectedIds.value = props.data.map((d) => d.id)
  } else {
    selectedIds.value = []
  }
}

function prevPage() {
  if (props.pagination.currentPage > 1) {
    emit('update:page', props.pagination.currentPage - 1)
  }
}

function nextPage() {
  if (props.pagination.currentPage < totalPages.value) {
    emit('update:page', props.pagination.currentPage + 1)
  }
}

function goToPage(page) {
  emit('update:page', page)
}
</script>
