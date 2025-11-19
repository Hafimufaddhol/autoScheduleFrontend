import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const kelasRepository = {
  getAll() {
    return axios.get(`${API_URL}/kelas`)
  },

  getById(id) {
    return axios.get(`${API_URL}/kelas/${id}`)
  },

  create(data) {
    return axios.post(`${API_URL}/kelas`, data)
  },

  update(id, data) {
    return axios.put(`${API_URL}/kelas/${id}`, data)
  },

  delete(id) {
    return axios.delete(`${API_URL}/kelas/${id}`)
  }
}

export default kelasRepository
