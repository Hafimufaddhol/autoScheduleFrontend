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

const guruRepository = {
  getAll(options = {}) {
    const q = buildQuery(options)
    return apiClient.get(`/guru${q}`).then(r => r.data)
  },

  getReference() {
    return apiClient.get('/guru/reference').then(r => r.data)
  },

  getById(id) {
    return apiClient.get(`/guru/${id}`).then(r => r.data)
  },

  create(data) {
    return apiClient.post('/guru', data).then(r => r.data)
  },

  update(id, data) {
    return apiClient.put(`/guru/${id}`, data).then(r => r.data)
  },

  delete(id) {
    return apiClient.delete(`/guru/${id}`).then(r => r.data)
  },

  // Kompetensi management
  getKompetensi(guruId) {
    return apiClient.get(`/guru/${guruId}/kompetensi`)
  },

  addKompetensi(guruId, mapelId) {
    return apiClient.post(`/guru/${guruId}/kompetensi`, { mapel_id: mapelId })
  },

  addKompetensiBulk(guruId, items) {
    return apiClient.post(`/guru/${guruId}/kompetensi`, { items })
  },

  deleteKompetensi(guruId, mapelId) {
    return apiClient.delete(`/guru/${guruId}/kompetensi/${mapelId}`)
  }
}

export default guruRepository
