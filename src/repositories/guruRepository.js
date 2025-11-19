import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const guruRepository = {
  getAll() {
    return axios.get(`${API_URL}/guru`)
  },

  getById(id) {
    return axios.get(`${API_URL}/guru/${id}`)
  },

  create(data) {
    return axios.post(`${API_URL}/guru`, data)
  },

  update(id, data) {
    return axios.put(`${API_URL}/guru/${id}`, data)
  },

  delete(id) {
    return axios.delete(`${API_URL}/guru/${id}`)
  },

  // Kompetensi management
  getKompetensi(guruId) {
    return axios.get(`${API_URL}/guru/${guruId}/kompetensi`)
  },

  addKompetensi(guruId, mapelId) {
    return axios.post(`${API_URL}/guru/${guruId}/kompetensi`, { mapel_id: mapelId })
  },

  addKompetensiBulk(guruId, items) {
    return axios.post(`${API_URL}/guru/${guruId}/kompetensi`, { items })
  },

  deleteKompetensi(guruId, mapelId) {
    return axios.delete(`${API_URL}/guru/${guruId}/kompetensi/${mapelId}`)
  }
}

export default guruRepository
