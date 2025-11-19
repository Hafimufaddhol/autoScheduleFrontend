import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const konfigurasiRepository = {
  get() {
    return axios.get(`${API_URL}/konfigurasi`)
  },

  update(data) {
    return axios.put(`${API_URL}/konfigurasi`, data)
  },

  getPaket() {
    return axios.get(`${API_URL}/konfigurasi/paket`).then(r => r.data)
  },

  addPaket(name) {
    return axios.post(`${API_URL}/konfigurasi/paket`, { name }).then(r => r.data)
  },

  deletePaket(name) {
    return axios.delete(`${API_URL}/konfigurasi/paket/${encodeURIComponent(name)}`).then(r => r.data)
  }
}

export default konfigurasiRepository
