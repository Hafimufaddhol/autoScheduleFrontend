import apiClient from '@/utils/apiClient'

const kelasRulesRepository = {
  get(kelasId) {
    return apiClient.get(`/kelas_rules/${kelasId}`)
  },

  update(kelasId, data) {
    return apiClient.put(`/kelas_rules/${kelasId}`, data)
  },

  copySlotHarian(payload) {
    return apiClient.post('/kelas_rules/copy-slot', payload)
  }
}

export default kelasRulesRepository
