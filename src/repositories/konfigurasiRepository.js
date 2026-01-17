import apiClient from '@/utils/apiClient'

const konfigurasiRepository = {
  get() {
    return apiClient.get('/konfigurasi')
  },

  update(data) {
    return apiClient.put('/konfigurasi', data)
  },

  getPaket() {
    return apiClient.get('/konfigurasi/paket').then(r => r.data)
  },

  addPaket(name) {
    return apiClient.post('/konfigurasi/paket', { name }).then(r => r.data)
  },

  deletePaket(name) {
    return apiClient.delete(`/konfigurasi/paket/${encodeURIComponent(name)}`).then(r => r.data)
  }
}

export default konfigurasiRepository
