<template>
    <div class="p-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Users</h1>
          <p class="mt-2 text-gray-600">Manage your team members and their account permissions.</p>
        </div>
        <Button @click="openAddUserModal" variant="primary">
          <PlusIcon class="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>
  
      <!-- Filters and Search -->
      <Card class="mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search users..."
              left-icon="SearchIcon"
              @input="handleSearch"
            />
          </div>
          <div class="flex gap-2">
            <select 
              v-model="roleFilter" 
              @change="handleRoleFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <select 
              v-model="statusFilter" 
              @change="handleStatusFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>
  
      <!-- Users Table -->
      <Card>
        <Table
          :data="users"
          :columns="userColumns"
          :loading="loading"
          :show-pagination="true"
          :page-size="10"
          show-actions
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @sort="handleSort"
        >
          <!-- Avatar Column -->
          <template #cell-avatar="{ row }">
            <div class="flex items-center">
              <img 
                :src="row.avatar" 
                :alt="row.name"
                class="w-10 h-10 rounded-full"
              >
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ row.name }}</p>
                <p class="text-sm text-gray-500">{{ row.email }}</p>
              </div>
            </div>
          </template>
  
          <!-- Role Column -->
          <template #cell-role="{ value }">
            <Badge 
              :variant="getRoleVariant(value)" 
              :label="capitalize(value)"
            />
          </template>
  
          <!-- Status Column -->
          <template #cell-status="{ value }">
            <Badge 
              :variant="getStatusVariant(value)" 
              :label="capitalize(value)"
            />
          </template>
  
          <!-- Last Login Column -->
          <template #cell-lastLogin="{ value }">
            <span class="text-sm text-gray-500">
              {{ formatRelativeTime(value) }}
            </span>
          </template>
  
          <!-- Actions Column -->
          <template #actions="{ row }">
            <div class="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline-primary"
                @click="handleEditUser({ row })"
              >
                <PencilIcon class="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline-danger"
                @click="handleDeleteUser({ row })"
              >
                <TrashIcon class="w-4 h-4" />
              </Button>
            </div>
          </template>
        </Table>
      </Card>
  
      <!-- Add/Edit User Modal -->
      <Modal
        :is-open="isModalOpen"
        :title="modalTitle"
        :subtitle="modalSubtitle"
        @close="closeModal"
        @confirm="handleSaveUser"
      >
        <form @submit.prevent="handleSaveUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Input
              v-model="userForm.firstName"
              label="First Name"
              placeholder="John"
              :error="errors.firstName"
              required
            />
            <Input
              v-model="userForm.lastName"
              label="Last Name"
              placeholder="Doe"
              :error="errors.lastName"
              required
            />
          </div>
  
          <Input
            v-model="userForm.email"
            type="email"
            label="Email"
            placeholder="john@example.com"
            :error="errors.email"
            required
          />
  
          <Input
            v-model="userForm.phone"
            label="Phone"
            placeholder="+1 (555) 123-4567"
            :error="errors.phone"
          />
  
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                v-model="userForm.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="userForm.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Card, Table, Button, Input, Modal, Badge } from '../../components/ui'
  import { useTable } from '../../composables/useTable'
  import { useModal } from '../../composables/useModal'
  import { formatRelativeTime, capitalize } from '../../utils/helpers'
  
  // Composables
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal('userModal')
  
  // Table composable
  const {
    data: users,
    loading,
    searchQuery,
    filters,
    setData,
    search,
    setFilter,
    clearFilters
  } = useTable([], {
    searchFields: ['name', 'email'],
    pageSize: 10
  })
  
  // Reactive data
  const roleFilter = ref('')
  const statusFilter = ref('')
  const editingUser = ref(null)
  
  const userForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  })
  
  const errors = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  const userColumns = ref([
    { key: 'avatar', label: 'User', sortable: false },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true, formatter: (value) => new Date(value).toLocaleDateString() }
  ])
  
  // Computed
  const modalTitle = computed(() => {
    return editingUser.value ? 'Edit User' : 'Add New User'
  })
  
  const modalSubtitle = computed(() => {
    return editingUser.value ? 'Update user information' : 'Create a new user account'
  })
  
  // Methods
  const loadUsers = async () => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/images/users/bonnie-green.png',
          role: 'admin',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: '/images/users/roberta-casas.png',
          role: 'moderator',
          status: 'active',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          createdAt: new Date('2024-01-02')
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          avatar: '/images/users/jese-leos.png',
          role: 'user',
          status: 'pending',
          lastLogin: null,
          createdAt: new Date('2024-01-03')
        }
      ]
      
      setData(mockUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      loading.value = false
    }
  }
  
  const handleSearch = (query) => {
    search(query)
  }
  
  const handleRoleFilter = () => {
    setFilter('role', roleFilter.value || null)
  }
  
  const handleStatusFilter = () => {
    setFilter('status', statusFilter.value || null)
  }
  
  const handleSort = ({ key, order }) => {
    console.log('Sort by:', key, order)
  }
  
  const openAddUserModal = () => {
    editingUser.value = null
    resetForm()
    openModal()
  }
  
  const handleEditUser = ({ row }) => {
    editingUser.value = row
    userForm.firstName = row.name.split(' ')[0]
    userForm.lastName = row.name.split(' ').slice(1).join(' ')
    userForm.email = row.email
    userForm.phone = row.phone || ''
    userForm.role = row.role
    userForm.status = row.status
    openModal()
  }
  
  const handleDeleteUser = ({ row }) => {
    if (confirm(`Are you sure you want to delete ${row.name}?`)) {
      console.log('Delete user:', row)
      // Implement delete logic
    }
  }
  
  const handleSaveUser = () => {
    if (validateForm()) {
      console.log('Save user:', userForm)
      closeModal()
      resetForm()
      // Implement save logic
    }
  }
  
  const validateForm = () => {
    // Reset errors
    Object.keys(errors).forEach(key => errors[key] = '')
    
    let isValid = true
    
    if (!userForm.firstName.trim()) {
      errors.firstName = 'First name is required'
      isValid = false
    }
    
    if (!userForm.lastName.trim()) {
      errors.lastName = 'Last name is required'
      isValid = false
    }
    
    if (!userForm.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = 'Email is invalid'
      isValid = false
    }
    
    return isValid
  }
  
  const resetForm = () => {
    userForm.firstName = ''
    userForm.lastName = ''
    userForm.email = ''
    userForm.phone = ''
    userForm.role = 'user'
    userForm.status = 'active'
    
    Object.keys(errors).forEach(key => errors[key] = '')
  }
  
  const getRoleVariant = (role) => {
    const variants = {
      'admin': 'danger',
      'moderator': 'warning',
      'user': 'default'
    }
    return variants[role] || 'default'
  }
  
  const getStatusVariant = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'danger',
      'pending': 'warning'
    }
    return variants[status] || 'default'
  }
  
  // Lifecycle
  onMounted(() => {
    loadUsers()
  })
  </script>
  
  <script>
  // Icon components
  export const PlusIcon = {
    template: `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
    `
  }
  
  export const SearchIcon = {
    template: `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    `
  }
  
  export const PencilIcon = {
    template: `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    `
  }
  
  export const TrashIcon = {
    template: `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    `
  }
  </script>
  
  