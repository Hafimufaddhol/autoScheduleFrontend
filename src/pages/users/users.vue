<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Users</h1>
        <p class="mt-2 text-gray-600">Manage your team members and their account permissions.</p>
      </div>
    </div>

    <!-- Search bar -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search users..."
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
      />
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
import MyTable from "@/components/ui/MyTable.vue";
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
  sort,
  loading,
  totalPages,
  currentPage,
  goToPage,
  nextPage,
  previousPage,
  pageSize,
  totalItems
} = useTable([], {
  pageSize: 5,
  searchFields: ["name", "email", "position", "country"],
});

// Dummy data load
setData([
  { id: 1, name: "Neil Sims", email: "neil.sims@windster.com", position: "Front-end Developer", country: "US", status: "active", role: "admin" },
  { id: 2, name: "Bonnie Green", email: "bonnie.green@windster.com", position: "Designer", country: "UK", status: "inactive", role: "editor" },
  { id: 3, name: "Michael Gough", email: "michael.gough@windster.com", position: "SEO Specialist", country: "Canada", status: "active", role: "viewer" },
  { id: 4, name: "Sarah Johnson", email: "sarah.johnson@windster.com", position: "Backend Developer", country: "Germany", status: "active", role: "admin" },
  { id: 5, name: "James Smith", email: "james.smith@windster.com", position: "Project Manager", country: "Australia", status: "inactive", role: "editor" },
  { id: 6, name: "Emily Davis", email: "emily.davis@windster.com", position: "UI/UX Designer", country: "France", status: "active", role: "viewer" },
  { id: 7, name: "William Brown", email: "william.brown@windster.com", position: "DevOps Engineer", country: "India", status: "active", role: "admin" },
  { id: 8, name: "Olivia Miller", email: "olivia.miller@windster.com", position: "QA Engineer", country: "Japan", status: "inactive", role: "editor" },
  { id: 9, name: "Daniel Wilson", email: "daniel.wilson@windster.com", position: "Mobile Developer", country: "Brazil", status: "active", role: "viewer" },
  { id: 10, name: "Sophia Taylor", email: "sophia.taylor@windster.com", position: "HR Specialist", country: "Singapore", status: "active", role: "editor" },
  { id: 11, name: "Henry Martinez", email: "henry.martinez@windster.com", position: "System Analyst", country: "Mexico", status: "inactive", role: "viewer" },
  { id: 12, name: "Isabella Anderson", email: "isabella.anderson@windster.com", position: "Marketing Specialist", country: "Italy", status: "active", role: "editor" },
  { id: 13, name: "Ethan Thomas", email: "ethan.thomas@windster.com", position: "Database Administrator", country: "Spain", status: "active", role: "admin" },
  { id: 14, name: "Mia Jackson", email: "mia.jackson@windster.com", position: "Content Writer", country: "Netherlands", status: "inactive", role: "viewer" },
  { id: 15, name: "Alexander White", email: "alexander.white@windster.com", position: "Product Owner", country: "Sweden", status: "active", role: "editor" },
  { id: 16, name: "Charlotte Harris", email: "charlotte.harris@windster.com", position: "Cloud Engineer", country: "Norway", status: "active", role: "admin" },
  { id: 17, name: "Benjamin Martin", email: "benjamin.martin@windster.com", position: "Security Specialist", country: "Finland", status: "inactive", role: "editor" },
  { id: 18, name: "Amelia Thompson", email: "amelia.thompson@windster.com", position: "Data Scientist", country: "Switzerland", status: "active", role: "viewer" },
  { id: 19, name: "Lucas Garcia", email: "lucas.garcia@windster.com", position: "Full-stack Developer", country: "Argentina", status: "active", role: "editor" },
  { id: 20, name: "Harper Clark", email: "harper.clark@windster.com", position: "Business Analyst", country: "South Korea", status: "inactive", role: "viewer" },
]);

const toggleSort = ({ key }) => sort(key);

const onEdit = (row) => {
  console.log("Edit", row);
};

const onDelete = (row) => {
  console.log("Delete", row);
};


</script>
