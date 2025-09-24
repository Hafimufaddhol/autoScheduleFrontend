import { ref, computed, reactive } from 'vue'

export function useTable(initialData = [], options = {}) {
  // Default options
  const defaultOptions = {
    pageSize: 10,
    sortBy: null,
    sortOrder: 'asc',
    searchQuery: '',
    searchFields: [],
    filters: {},
    loading: false
  }
  
  const config = { ...defaultOptions, ...options }
  
  // State
  const data = ref(initialData)
  const currentPage = ref(1)
  const sortBy = ref(config.sortBy)
  const sortOrder = ref(config.sortOrder)
  const searchQuery = ref(config.searchQuery)
  const searchFields = ref(config.searchFields)
  const filters = reactive(config.filters)
  const loading = ref(config.loading)
  const selectedRows = ref([])
  const pageSize = ref(config.pageSize)

  
  // Computed
  const filteredData = computed(() => {
    let result = [...data.value]
    
    // Apply search
    if (searchQuery.value && searchFields.value.length > 0) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item => {
        return searchFields.value.some(field => {
          const value = getNestedValue(item, field)
          return value && value.toString().toLowerCase().includes(query)
        })
      })
    }
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        result = result.filter(item => {
          const value = getNestedValue(item, key)
          if (Array.isArray(filters[key])) {
            return filters[key].includes(value)
          }
          return value === filters[key]
        })
      }
    })
    
    return result
  })
  
  const sortedData = computed(() => {
    if (!sortBy.value) return filteredData.value
    
    return [...filteredData.value].sort((a, b) => {
      const aVal = getNestedValue(a, sortBy.value)
      const bVal = getNestedValue(b, sortBy.value)
      
      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  })
  
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedData.value.slice(start, end)
  })
  
  const totalPages = computed(() => {
    return Math.ceil(sortedData.value.length / pageSize.value)
  })
  const totalItems = computed(() => {
    return sortedData.value.length
  })
  
  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })
  
  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })
  
  const startItem = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1
  })
  
  const endItem = computed(() => {
    return Math.min(currentPage.value * pageSize.value, totalItems.value)
  })

  const isAllSelected = computed(() => {
    return selectedRows.value.length === paginatedData.value.length && paginatedData.value.length > 0
  })
  
  const isIndeterminate = computed(() => {
    return selectedRows.value.length > 0 && selectedRows.value.length < paginatedData.value.length
  })
  
  // Methods
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  const setData = (newData) => {
    data.value = newData
    currentPage.value = 1
  }
  
  const addItem = (item) => {
    data.value.push(item)
  }
  
  const updateItem = (index, item) => {
    if (index >= 0 && index < data.value.length) {
      data.value[index] = { ...data.value[index], ...item }
    }
  }
  
  const removeItem = (index) => {
    if (index >= 0 && index < data.value.length) {
      data.value.splice(index, 1)
    }
  }
  
  const sort = (field) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
    currentPage.value = 1
  }
  
  const search = (query) => {
    searchQuery.value = query
    currentPage.value = 1
  }
  
  const setFilter = (field, value) => {
    filters[field] = value
    currentPage.value = 1
  }
  
  const clearFilters = () => {
    Object.keys(filters).forEach(key => {
      filters[key] = null
    })
    currentPage.value = 1
  }
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }
  
  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }
  
  const selectRow = (row) => {
    const index = selectedRows.value.findIndex(item => item.id === row.id)
    if (index === -1) {
      selectedRows.value.push(row)
    }
  }
  
  const deselectRow = (row) => {
    const index = selectedRows.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      selectedRows.value.splice(index, 1)
    }
  }
  
  const toggleRowSelection = (row) => {
    const index = selectedRows.value.findIndex(item => item.id === row.id)
    if (index === -1) {
      selectRow(row)
    } else {
      deselectRow(row)
    }
  }
  
  const selectAll = () => {
    selectedRows.value = [...paginatedData.value]
  }
  
  const deselectAll = () => {
    selectedRows.value = []
  }
  
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      deselectAll()
    } else {
      selectAll()
    }
  }
  
  const setLoading = (loadingState) => {
    loading.value = loadingState
  }
  
  const refresh = () => {
    currentPage.value = 1
    selectedRows.value = []
  }
  
  const reset = () => {
    data.value = initialData
    currentPage.value = 1
    sortBy.value = config.sortBy
    sortOrder.value = config.sortOrder
    searchQuery.value = config.searchQuery
    selectedRows.value = []
    Object.keys(filters).forEach(key => {
      filters[key] = null
    })
  }

  const setPageSize = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }
  
  
  return {
    // State
    data,
    currentPage,
    sortBy,
    sortOrder,
    searchQuery,
    searchFields,
    filters,
    loading,
    selectedRows,
    pageSize,
    
    // Computed
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
    isAllSelected,
    isIndeterminate,
    
    // Methods
    setData,
    addItem,
    updateItem,
    removeItem,
    sort,
    search,
    setFilter,
    clearFilters,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    selectRow,
    deselectRow,
    toggleRowSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    setLoading,
    refresh,
    reset
  }
}

