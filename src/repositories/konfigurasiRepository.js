import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const konfigurasiRepository = {
  get() {
    return axios.get(`${API_URL}/konfigurasi`)
  },

  update(data) {
    return axios.put(`${API_URL}/konfigurasi`, data)
  }
}

export default konfigurasiRepository
