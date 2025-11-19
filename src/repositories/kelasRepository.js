import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
    return axios.get(`${API_URL}/kelas${q}`).then(r => r.data)
  },

  getById(id) {
    return axios.get(`${API_URL}/kelas/${id}`).then(r => r.data)
  },

  create(data) {
    return axios.post(`${API_URL}/kelas`, data).then(r => r.data)
  },

  update(id, data) {
    return axios.put(`${API_URL}/kelas/${id}`, data).then(r => r.data)
  },

  delete(id) {
    return axios.delete(`${API_URL}/kelas/${id}`).then(r => r.data)
  }
}

export default kelasRepository
