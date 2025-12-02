import { ref, reactive, computed } from 'vue'

const defaultPagination = () => ({
  page: 1,
  page_size: 10,
  total_items: 0,
  total_pages: 1
})

export function useRemoteTable(fetcher, options = {}) {
  if (typeof fetcher !== 'function') {
    throw new Error('useRemoteTable requires a fetcher function')
  }

  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const meta = ref(null)
  const links = ref(null)
  const pagination = ref({ ...defaultPagination(), page_size: options.pageSize || 10 })

  const page = ref(options.page || 1)
  const pageSize = ref(options.pageSize || 10)
  const sortBy = ref(options.sortBy || null)
  const sortOrder = ref(options.sortOrder || null)
  const search = ref(options.search || '')
  const filters = reactive({ ...(options.filters || {}) })

  const normalizePayload = (payload) => {
    if (!payload) return { items: [], meta: null, links: null }
    if (Array.isArray(payload.data)) {
      return { items: payload.data, meta: payload.meta || null, links: payload.links || null }
    }
    if (Array.isArray(payload)) {
      return { items: payload, meta: null, links: null }
    }
    if (Array.isArray(payload.data?.data)) {
      return { items: payload.data.data, meta: payload.data.meta || null, links: payload.data.links || null }
    }
    return { items: [], meta: payload.meta || null, links: payload.links || null }
  }

  const updatePagination = (metaPayload) => {
    if (metaPayload?.pagination) {
      pagination.value = { ...metaPayload.pagination }
      page.value = pagination.value.page
      pageSize.value = pagination.value.page_size
    } else {
      const total = rows.value.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize.value))
      pagination.value = {
        page: page.value,
        page_size: pageSize.value,
        total_items: total,
        total_pages: totalPages
      }
    }
  }

  const totalItems = computed(() => pagination.value.total_items || rows.value.length)
  const totalPages = computed(() => pagination.value.total_pages || 1)
  const startItem = computed(() => {
    if (!totalItems.value) return 0
    return (pagination.value.page - 1) * pagination.value.page_size + 1
  })
  const endItem = computed(() => {
    if (!totalItems.value) return 0
    return Math.min(startItem.value + rows.value.length - 1, totalItems.value)
  })

  const buildParams = () => {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      filters: { ...filters }
    }
    if (search.value?.trim()) {
      params.search = search.value.trim()
    }
    if (sortBy.value) {
      params.sort = sortOrder.value === 'desc' ? `-${sortBy.value}` : sortBy.value
    }
    return params
  }

  const fetchData = async (overrides = {}) => {
    if (overrides.page !== undefined) page.value = overrides.page
    if (overrides.pageSize !== undefined) pageSize.value = overrides.pageSize
    if (overrides.search !== undefined) search.value = overrides.search
    if (overrides.sortBy !== undefined) sortBy.value = overrides.sortBy
    if (overrides.sortOrder !== undefined) sortOrder.value = overrides.sortOrder

    loading.value = true
    error.value = null
    try {
      const params = { ...buildParams(), ...overrides }
      const payload = await fetcher(params)
      const normalized = normalizePayload(payload)
      rows.value = Array.isArray(normalized.items) ? normalized.items : []
      meta.value = normalized.meta
      links.value = normalized.links
      updatePagination(normalized.meta)
    } catch (err) {
      error.value = err
      rows.value = []
      updatePagination(null)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = () => fetchData()
  const setPage = (value) => fetchData({ page: Math.max(1, value) })
  const nextPage = () => {
    if (page.value < totalPages.value) {
      return fetchData({ page: page.value + 1 })
    }
  }
  const previousPage = () => {
    if (page.value > 1) {
      return fetchData({ page: page.value - 1 })
    }
  }
  const setPageSize = (value) => fetchData({ page: 1, pageSize: value })
  const setSearchValue = (value) => fetchData({ page: 1, search: value })
  const setSort = (key, order = 'asc') => fetchData({ page: 1, sortBy: key, sortOrder: order })
  const toggleSort = (key) => {
    if (sortBy.value !== key) {
      return fetchData({ page: 1, sortBy: key, sortOrder: 'asc' })
    }
    if (sortOrder.value === 'asc') {
      return fetchData({ page: 1, sortOrder: 'desc' })
    }
    // reset sort if already desc
    return fetchData({ page: 1, sortBy: null, sortOrder: null })
  }
  const setFilter = (key, value) => {
    filters[key] = value
    return fetchData({ page: 1 })
  }
  const clearFilters = () => {
    Object.keys(filters).forEach((key) => {
      filters[key] = options.filters?.[key] ?? ''
    })
    return fetchData({ page: 1 })
  }

  if (options.autoFetch !== false) {
    fetchData().catch(() => {})
  }

  return {
    rows,
    loading,
    error,
    meta,
    links,
    pagination,
    page,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
    sortBy,
    sortOrder,
    search,
    filters,
    fetchData,
    refresh,
    setPage,
    nextPage,
    previousPage,
    setPageSize,
    setSearchValue,
    setSort,
    toggleSort,
    setFilter,
    clearFilters
  }
}
