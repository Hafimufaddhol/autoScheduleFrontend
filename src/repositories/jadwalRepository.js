import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const jadwalRepository = {
  // Get list of all jadwal (returns array of {periode, status, created_at})
  getAll() {
    return axios.get(`${API_URL}/jadwal`)
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
