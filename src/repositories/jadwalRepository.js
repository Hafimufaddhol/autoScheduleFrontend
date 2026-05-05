import apiClient from '@/utils/apiClient'

function buildQuery(opts = {}) {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', opts.page)
  if (opts.pageSize) params.set('page_size', opts.pageSize)
  if (opts.search) params.set('search', Array.isArray(opts.search) ? opts.search.join(',') : opts.search)
  if (opts.sort) params.set('sort', Array.isArray(opts.sort) ? opts.sort.join(',') : opts.sort)
  if (opts.filters) {
    Object.entries(opts.filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(`filter[${k}]`, v)
      }
    })
  }
  return params.toString() ? `?${params.toString()}` : ''
}

const jadwalRepository = {
  // Get list of jadwal cards (returns success_list payload)
  getAll(options = {}) {
    const q = buildQuery(options)
    return apiClient.get(`/jadwal${q}`).then(r => r.data)
  },

  // Get specific jadwal by periode (returns full schedule data)
  getById(periode) {
    return apiClient.get(`/jadwal/${periode}`)
  },

  // Get jadwal status only (without items) - for polling
  getStatus(periode) {
    return apiClient.get(`/jadwal/${periode}/status`).then(r => r.data)
  },

  // Get jadwal items with filters - for lazy loading
  // filterType: 'hari' | 'kelas' | 'guru'
  // filterValue: hari_index (0-4) for hari, id for kelas/guru
  getItems(periode, filterType = null, filterValue = null) {
    let url = `/jadwal/${periode}/items`
    const params = new URLSearchParams()
    if (filterType && filterValue !== null && filterValue !== undefined) {
      params.set('filter_type', filterType)
      params.set('filter_value', filterValue)
    }
    const query = params.toString()
    if (query) {
      url += `?${query}`
    }
    return apiClient.get(url).then(r => r.data)
  },

  // Delete a jadwal by periode
  delete(periode) {
    return apiClient.delete(`/jadwal/${periode}`)
  },

  /**
   * Trigger generate jadwal via Cloud Tasks (fire-and-forget).
   * Backend merespons segera dengan status "pending".
   * Gunakan pollStatus() untuk memantau progres.
   */
  generate(periode) {
    return apiClient.post('/jadwal/generate', { periode }).then(r => r.data)
  },

  /**
   * Poll status jadwal sampai status terminal (ready / failed).
   * @param {string} periode
   * @param {function} onProgress - callback({ status, periode }) tiap tick
   * @param {number} intervalMs - interval polling (default 5 detik)
   * @param {number} maxWaitMs - max tunggu sebelum timeout (default 15 menit)
   * @returns {Promise<{status: string, periode: string}>}
   */
  pollStatus(periode, onProgress = null, intervalMs = 30000, maxWaitMs = 15 * 60 * 1000) {
    const TERMINAL_STATUSES = ['ready', 'failed']
    const startedAt = Date.now()

    return new Promise((resolve, reject) => {
      const tick = async () => {
        try {
          const result = await jadwalRepository.getStatus(periode)
          const status = result?.data?.status ?? result?.status

          if (onProgress) onProgress({ status, periode })

          if (TERMINAL_STATUSES.includes(status)) {
            return resolve({ status, periode })
          }

          if (Date.now() - startedAt > maxWaitMs) {
            return reject(new Error(`Timeout menunggu jadwal ${periode} selesai`))
          }

          setTimeout(tick, intervalMs)
        } catch (err) {
          reject(err)
        }
      }

      setTimeout(tick, intervalMs)
    })
  },

  // Update a single schedule item
  updateItem(periode, itemId, data) {
    return apiClient.put(`/jadwal/${periode}/items/${itemId}`, data).then(r => r.data)
  },

  // Export jadwal as PDF
  // view: 'hari' | 'kelas' | 'guru'
  exportPdf(periode, view = 'hari') {
    return apiClient.get(`/jadwal/${periode}/export-pdf`, {
      params: { view },
      responseType: 'blob',
    })
  }
}

export default jadwalRepository
