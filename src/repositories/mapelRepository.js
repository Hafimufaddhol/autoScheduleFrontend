import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const mapelRepository = {
  getAll() {
    return axios.get(`${API_URL}/mapel`)
  },

  getById(id) {
    return axios.get(`${API_URL}/mapel/${id}`)
  },

  create(data) {
    return axios.post(`${API_URL}/mapel`, data)
  },

  update(id, data) {
    return axios.put(`${API_URL}/mapel/${id}`, data)
  },

  delete(id) {
    return axios.delete(`${API_URL}/mapel/${id}`)
  }
}

export default mapelRepository
