import apiClient from '@/utils/apiClient'

function buildQuery(opts = {}) {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', opts.page)
  if (opts.pageSize) params.set('page_size', opts.pageSize)
  if (opts.search) params.set('search', opts.search)
  if (opts.sort) params.set('sort', Array.isArray(opts.sort) ? opts.sort.join(',') : opts.sort)
  if (opts.filters) {
    Object.entries(opts.filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(`filter[${k}]`, v)
      }
    })
  }
  return params.toString() ? `?${params.toString()}` : ''
}

const jadwalRepository = {
  // Get list of jadwal cards (returns success_list payload)
  getAll(options = {}) {
    const q = buildQuery(options)
    return apiClient.get(`/jadwal${q}`).then(r => r.data)
  },

  // Get specific jadwal by periode (returns full schedule data)
  getById(periode) {
    return apiClient.get(`/jadwal/${periode}`)
  },

  // Get jadwal status only (without items) - for lazy loading
  getStatus(periode) {
    return apiClient.get(`/jadwal/${periode}/status`).then(r => r.data)
  },

  // Get jadwal items with filters - for lazy loading
  // filterType: 'hari' | 'kelas' | 'guru'
  // filterValue: hari_index (0-4) for hari, id for kelas/guru
  getItems(periode, filterType = null, filterValue = null) {
    let url = `/jadwal/${periode}/items`
    const params = new URLSearchParams()
    if (filterType && filterValue !== null && filterValue !== undefined) {
      params.set('filter_type', filterType)
      params.set('filter_value', filterValue)
    }
    const query = params.toString()
    if (query) {
      url += `?${query}`
    }
    return apiClient.get(url).then(r => r.data)
  },

  // Delete a jadwal by periode
  delete(periode) {
    return apiClient.delete(`/jadwal/${periode}`)
  },

  // Trigger create/generate jadwal (future implementation)
  create(periode) {
    return apiClient.post('/jadwal/create', { periode })
  }
}

export default jadwalRepository
