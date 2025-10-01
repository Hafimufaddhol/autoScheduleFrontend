<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pengguna</h1>
        <p class="mt-2 text-gray-600">Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="sm:flex items-center sm:divide-x sm:divide-gray-100 mb-4 gap-4">
      <!-- Search -->
      <form class="lg:pr-3 w-full sm:w-auto" @submit.prevent>
        <label for="users-search" class="sr-only">Search</label>
        <div class="mt-1 relative lg:w-64 xl:w-96">
          <input v-model="searchQuery" type="text" id="users-search"
            class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="Cari Pengguna" />
        </div>
      </form>

      <!-- Filter: Status -->
      <div class="mt-2 sm:mt-0">
        <select v-model="filters.status"
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 p-2.5">
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Filter: Role -->
      <div class="mt-2 sm:mt-0">
        <select v-model="filters.role"
          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 p-2.5">
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <!-- Buttons -->
      <div class="flex items-center space-x-2 sm:space-x-3 ml-auto mt-3 sm:mt-0">
        <BaseButton 
          icon="fas fa-plus"
          size="lg"
          label="Tambah"
          @click="openAddUser"
        />
      </div>
    </div>

    <!-- Table -->
    <MyTable
      :data="paginatedData"
      :columns="columns"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      v-model:pageSize="pageSize"
      :sort-key="sortBy"
      :sort-order="sortOrder"
      @sort="toggleSort"
      @edit="onEdit"
      @delete="onDelete"
      @prev-page="previousPage"
      @next-page="nextPage"
      @go-to-page="goToPage"
    />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import MyTable from "@/components/ui/MyTable.vue";
import BaseButton from '@/components/ui/BaseButton.vue'
import { apiUser } from "@/repositories/usersRepositories.js";
import { watchEffect } from "vue";
import { useTable } from "@/composables/useTable.js";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "position", label: "Position", sortable: true },
  { key: "country", label: "Country", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "role", label: "Role", sortable: true },
];

const {
  data,
  paginatedData,
  setData,
  searchQuery,
  sortBy,
  sortOrder,
  loading,
  totalPages,
  currentPage,
  goToPage,
  nextPage,
  previousPage,
  pageSize,
  totalItems,
  filters,   // 👉 tambahin ini dari useTable
  setFilter, // kalau mau manual set
  clearFilters
} = useTable([], {
  pageSize: 5,
  searchFields: ["name", "email", "position", "country"],
  filters: { status: "", role: "" }, // default filter
});

watchEffect(() => {
  console.log("📌 Query State =>", {
    search: searchQuery.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    page: currentPage.value,
    pageSize: pageSize.value,
    filters: { ...filters }
  })
})


// Dummy data load
onMounted(async () => {
  const users = await apiUser.fetch();
  setData(users);
});

const toggleSort = ({ key }) => {
  if (sortBy.value === key) {
    if (sortOrder.value === "asc") {
      sortOrder.value = "desc"
    } else if (sortOrder.value === "desc") {
      // 👉 klik ketiga kali reset
      sortBy.value = null
      sortOrder.value = null
    }
  } else {
    sortBy.value = key
    sortOrder.value = "asc"
  }
}


const onEdit = (row) => {
  console.log("Edit", row);
};

const onDelete = (row) => {
  console.log("Delete", row);
};

const openAddUser = () => {
  console.log("Tambah user baru");
};
</script>
