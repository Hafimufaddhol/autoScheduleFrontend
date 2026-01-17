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

const kelasRepository = {
  getAll(options = {}) {
    const q = buildQuery(options)
    return apiClient.get(`/kelas${q}`).then(r => r.data)
  },

  getReference() {
    return apiClient.get('/kelas/reference').then(r => r.data)
  },

  getById(id) {
    return apiClient.get(`/kelas/${id}`).then(r => r.data)
  },

  create(data) {
    return apiClient.post('/kelas', data).then(r => r.data)
  },

  update(id, data) {
    return apiClient.put(`/kelas/${id}`, data).then(r => r.data)
  },

  delete(id) {
    return apiClient.delete(`/kelas/${id}`).then(r => r.data)
  }
}

export default kelasRepository
