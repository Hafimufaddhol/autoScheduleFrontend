<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Users</h1>
        <p class="mt-2 text-gray-600">
          Manage your team members and their account permissions.
        </p>
      </div>
      <button
        @click="openAddUserModal"
        class="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        ➕ Add user
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-col md:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for users..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <select
        v-model="roleFilter"
        class="px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>
      <select
        v-model="statusFilter"
        class="px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    <!-- Table -->
    <MyTable
      :data="filteredUsers"
      :columns="userColumns"
      :loading="loading"
      :show-pagination="true"
      :page-size="5"
      show-actions
      selectable
      v-model="selected"
      @edit="handleEditUser"
      @delete="handleDeleteUser"
      @sort="handleSort"
    >
      <!-- Custom cell: user -->
      <template #cell-user="{ row }">
        <div class="flex items-center">
          <!-- <img
            :src="row.avatar"
            :alt="row.name"
            class="w-10 h-10 rounded-full"
          /> -->
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">{{ row.name }}</p>
            <p class="text-sm text-gray-500">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <!-- Custom cell: status -->
      <template #cell-status="{ value }">
        <span
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="{
            'bg-green-100 text-green-700': value === 'active',
            'bg-yellow-100 text-yellow-700': value === 'pending',
            'bg-red-100 text-red-700': value === 'inactive',
          }"
        >
          {{ value }}
        </span>
      </template>
    </MyTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MyTable from "@/components/ui/table2.vue";

const users = ref([]);
const loading = ref(false);
const selected = ref([]);
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");

const userColumns = [
  { key: "user", label: "User", sortable: true },
  { key: "position", label: "Position", sortable: true },
  { key: "country", label: "Country", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

// load dummy users
onMounted(() => {
  loadUsers();
});

const loadUsers = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  users.value = [
  {
    id: 1,
    name: "Neil Sims",
    email: "neil.sims@windster.com",
    position: "Front-end developer",
    country: "United States",
    status: "active",
    role: "admin",
  },
  {
    id: 2,
    name: "Roberta Casas",
    email: "roberta.casas@windster.com",
    position: "Designer",
    country: "Spain",
    status: "inactive",
    role: "user",
  },
  {
    id: 3,
    name: "Michael Gough",
    email: "michael.gough@windster.com",
    position: "React developer",
    country: "United Kingdom",
    status: "pending",
    role: "moderator",
  },
  {
    id: 4,
    name: "Angela Gray",
    email: "angela.gray@windster.com",
    position: "Project Manager",
    country: "Canada",
    status: "active",
    role: "admin",
  },
  {
    id: 5,
    name: "Brandon Lee",
    email: "brandon.lee@windster.com",
    position: "Backend developer",
    country: "Singapore",
    status: "inactive",
    role: "user",
  },
  {
    id: 6,
    name: "Sophia Turner",
    email: "sophia.turner@windster.com",
    position: "UI/UX Designer",
    country: "Australia",
    status: "pending",
    role: "moderator",
  },
  {
    id: 7,
    name: "James Wilson",
    email: "james.wilson@windster.com",
    position: "Fullstack developer",
    country: "United States",
    status: "active",
    role: "user",
  },
  {
    id: 8,
    name: "Maria Gonzalez",
    email: "maria.gonzalez@windster.com",
    position: "Data Analyst",
    country: "Mexico",
    status: "inactive",
    role: "moderator",
  },
  {
    id: 9,
    name: "David Brown",
    email: "david.brown@windster.com",
    position: "DevOps Engineer",
    country: "United Kingdom",
    status: "pending",
    role: "admin",
  },
  {
    id: 10,
    name: "Emma Watson",
    email: "emma.watson@windster.com",
    position: "QA Engineer",
    country: "France",
    status: "active",
    role: "user",
  },
  {
    id: 11,
    name: "Liam Johnson",
    email: "liam.johnson@windster.com",
    position: "Mobile Developer",
    country: "Germany",
    status: "inactive",
    role: "moderator",
  },
  {
    id: 12,
    name: "Olivia Martinez",
    email: "olivia.martinez@windster.com",
    position: "Product Owner",
    country: "Brazil",
    status: "active",
    role: "admin",
  },
  {
    id: 13,
    name: "Noah Davis",
    email: "noah.davis@windster.com",
    position: "System Architect",
    country: "Italy",
    status: "pending",
    role: "user",
  },
  {
    id: 14,
    name: "Ava Thompson",
    email: "ava.thompson@windster.com",
    position: "Business Analyst",
    country: "Sweden",
    status: "active",
    role: "moderator",
  },
  {
    id: 15,
    name: "Ethan Clark",
    email: "ethan.clark@windster.com",
    position: "Security Engineer",
    country: "Netherlands",
    status: "inactive",
    role: "user",
  },
  {
    id: 16,
    name: "Isabella Lewis",
    email: "isabella.lewis@windster.com",
    position: "AI Engineer",
    country: "Japan",
    status: "active",
    role: "admin",
  },
  {
    id: 17,
    name: "Mason Walker",
    email: "mason.walker@windster.com",
    position: "Blockchain Developer",
    country: "Switzerland",
    status: "pending",
    role: "moderator",
  },
  {
    id: 18,
    name: "Mia Scott",
    email: "mia.scott@windster.com",
    position: "Marketing Specialist",
    country: "Argentina",
    status: "active",
    role: "user",
  },
  {
    id: 19,
    name: "Lucas Young",
    email: "lucas.young@windster.com",
    position: "Support Engineer",
    country: "South Korea",
    status: "inactive",
    role: "moderator",
  },
  {
    id: 20,
    name: "Charlotte King",
    email: "charlotte.king@windster.com",
    position: "Cloud Engineer",
    country: "India",
    status: "active",
    role: "admin",
  },
  ];
  loading.value = false;
};

// filters
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = roleFilter.value ? u.role === roleFilter.value : true;
    const matchesStatus = statusFilter.value ? u.status === statusFilter.value : true;
    return matchesSearch && matchesRole && matchesStatus;
  });
});

// actions
const handleSort = ({ key, order }) => {
  console.log("Sort:", key, order);
};
const openAddUserModal = () => {
  console.log("Open add user modal");
};
const handleEditUser = (row) => {
  console.log("Edit user:", row);
};
const handleDeleteUser = (row) => {
  console.log("Delete user:", row);
};
</script>
