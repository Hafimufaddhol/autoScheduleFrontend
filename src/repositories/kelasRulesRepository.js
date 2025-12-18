import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const kelasRulesRepository = {
  get(kelasId) {
    return axios.get(`${API_URL}/kelas_rules/${kelasId}`)
  },

  update(kelasId, data) {
    return axios.put(`${API_URL}/kelas_rules/${kelasId}`, data)
  },

  copySlotHarian(payload) {
    return axios.post(`${API_URL}/kelas_rules/copy-slot`, payload)
  }
}

export default kelasRulesRepository
