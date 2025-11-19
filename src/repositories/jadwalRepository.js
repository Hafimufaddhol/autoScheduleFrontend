import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const jadwalRepository = {
  getAll() {
    return axios.get(`${API_URL}/jadwal`)
  },

  triggerCreate(periode) {
    return axios.post(`${API_URL}/jadwal/create`, { periode })
  },

  getStatus(periode) {
    return axios.get(`${API_URL}/jadwal/${periode}`)
  }
}

export default jadwalRepository
