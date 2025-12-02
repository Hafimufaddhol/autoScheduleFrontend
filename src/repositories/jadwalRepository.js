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

const jadwalRepository = {
  // Get list of jadwal cards (returns success_list payload)
  getAll(options = {}) {
    const q = buildQuery(options)
    return axios.get(`${API_URL}/jadwal${q}`).then(r => r.data)
  },

  // Get specific jadwal by periode (returns full schedule data)
  getById(periode) {
    return axios.get(`${API_URL}/jadwal/${periode}`)
  },

  // Delete a jadwal by periode
  delete(periode) {
    return axios.delete(`${API_URL}/jadwal/${periode}`)
  },

  // Trigger create/generate jadwal (future implementation)
  create(periode) {
    return axios.post(`${API_URL}/jadwal/create`, { periode })
  }
}

export default jadwalRepository
