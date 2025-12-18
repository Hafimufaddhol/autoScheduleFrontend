import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const RESOURCE = `${API_URL}/kelas-mapel-jp`

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.kelasId) searchParams.set('kelas_id', params.kelasId)
  if (params.mapelId) searchParams.set('mapel_id', params.mapelId)
  if (params.page) searchParams.set('page', params.page)
  if (params.pageSize) searchParams.set('page_size', params.pageSize)
  if (params.legacy) searchParams.set('legacy', params.legacy ? '1' : '0')
  return searchParams.toString() ? `?${searchParams.toString()}` : ''
}

const kelasMapelJpRepository = {
  list(options = {}) {
    const q = buildQuery(options)
    return axios.get(`${RESOURCE}${q}`).then(r => r.data)
  },

  create(data) {
    return axios.post(RESOURCE, data).then(r => r.data)
  },

  update(id, data) {
    return axios.put(`${RESOURCE}/${id}`, data).then(r => r.data)
  },

  delete(id) {
    return axios.delete(`${RESOURCE}/${id}`).then(r => r.data)
  },

  bulkCopy(payload) {
    return axios.post(`${RESOURCE}/bulk/copy`, payload).then(r => r.data)
  },

  autoGenerate(payload) {
    return axios.post(`${RESOURCE}/auto-generate`, payload).then(r => r.data)
  },

  bulkImport(rows) {
    return axios.post(`${RESOURCE}/bulk/import`, { rows }).then(r => r.data)
  }
}

export default kelasMapelJpRepository
