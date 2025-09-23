<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome back! Here's what's happening with your projects today.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="stat in stats" :key="stat.title" class="hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div :class="stat.iconBg" class="w-8 h-8 rounded-md flex items-center justify-center">
              <component :is="stat.icon" :class="stat.iconColor" class="w-5 h-5" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            <p v-if="stat.change" :class="stat.changeColor" class="text-sm">
              {{ stat.change }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue Chart -->
      <Card title="Revenue Overview" subtitle="Monthly revenue for the past 12 months">
        <div class="h-64">
          <LineChart :data="revenueData" :options="chartOptions" />
        </div>
      </Card>

      <!-- Sales Chart -->
      <Card title="Sales by Category" subtitle="Product sales distribution">
        <div class="h-64">
          <BarChart :data="salesData" :options="chartOptions" />
        </div>
      </Card>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Orders -->
      <Card title="Recent Orders" class="lg:col-span-2">
        <Table
          :data="recentOrders"
          :columns="orderColumns"
          :loading="loading"
          show-actions
          @edit="handleEditOrder"
          @delete="handleDeleteOrder"
        >
          <template #cell-status="{ value }">
            <Badge 
              :variant="getStatusVariant(value)" 
              :label="value"
            />
          </template>
        </Table>
      </Card>

      <!-- Top Customers -->
      <Card title="Top Customers">
        <div class="space-y-4">
          <div 
            v-for="customer in topCustomers" 
            :key="customer.id"
            class="flex items-center space-x-3"
          >
            <img 
              :src="customer.avatar" 
              :alt="customer.name"
              class="w-10 h-10 rounded-full"
            >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ customer.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatCurrency(customer.total) }}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Card, Table, Badge } from '../components/ui'
import { LineChart, BarChart } from '../components/charts'
import { formatCurrency } from '../utils/helpers'

// Reactive data
const loading = ref(false)
const stats = ref([
  {
    title: 'Total Revenue',
    value: '$45,231',
    change: '+20.1% from last month',
    changeColor: 'text-green-600',
    icon: 'CurrencyDollarIcon',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Total Orders',
    value: '2,350',
    change: '+15.3% from last month',
    changeColor: 'text-green-600',
    icon: 'ShoppingBagIcon',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+5.2% from last month',
    changeColor: 'text-green-600',
    icon: 'UsersIcon',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '-2.1% from last month',
    changeColor: 'text-red-600',
    icon: 'ChartBarIcon',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  }
])

const recentOrders = ref([
  {
    id: 1,
    customer: 'John Doe',
    product: 'MacBook Pro',
    amount: 2499,
    status: 'Completed',
    date: '2024-01-15'
  },
  {
    id: 2,
    customer: 'Jane Smith',
    product: 'iPhone 15',
    amount: 999,
    status: 'Pending',
    date: '2024-01-14'
  },
  {
    id: 3,
    customer: 'Bob Johnson',
    product: 'iPad Air',
    amount: 599,
    status: 'Shipped',
    date: '2024-01-13'
  }
])

const topCustomers = ref([
  {
    id: 1,
    name: 'Alice Cooper',
    total: 5420,
    avatar: '/images/users/bonnie-green.png'
  },
  {
    id: 2,
    name: 'David Wilson',
    total: 3890,
    avatar: '/images/users/jese-leos.png'
  },
  {
    id: 3,
    name: 'Sarah Brown',
    total: 3240,
    avatar: '/images/users/roberta-casas.png'
  }
])

const orderColumns = ref([
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'product', label: 'Product', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, formatter: (value) => formatCurrency(value) },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'date', label: 'Date', sortable: true, formatter: (value) => new Date(value).toLocaleDateString() }
])

const revenueData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [{
    label: 'Revenue',
    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const salesData = ref({
  labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
  datasets: [{
    label: 'Sales',
    data: [65, 59, 80, 81, 56],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ]
  }]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

// Methods
const getStatusVariant = (status) => {
  const variants = {
    'Completed': 'success',
    'Pending': 'warning',
    'Shipped': 'info',
    'Cancelled': 'danger'
  }
  return variants[status] || 'default'
}

const handleEditOrder = ({ row }) => {
  console.log('Edit order:', row)
}

const handleDeleteOrder = ({ row }) => {
  console.log('Delete order:', row)
}

// Lifecycle
onMounted(() => {
  // Load dashboard data
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<script>
// Icon components
export const CurrencyDollarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
    </svg>
  `
}

export const ShoppingBagIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
    </svg>
  `
}

export const UsersIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
    </svg>
  `
}

export const ChartBarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  `
}
</script>

