import apiClient from '@/utils/apiClient'
import pinia from '@/stores'
import { useReferenceCacheStore } from '@/stores/referenceCache'

/**
 * Fetch reference data dengan ETag caching
 * Jika server return 304 (Not Modified), gunakan data dari cache
 * 
 * @param {string} endpoint - API endpoint (e.g., '/guru/reference')
 * @param {string} cacheKey - Key untuk menyimpan cache (e.g., 'guru')
 * @returns {Promise<Array>} - Reference data array
 */
export async function fetchReferenceWithCache(endpoint, cacheKey) {
  const cacheStore = useReferenceCacheStore(pinia)
  const cachedETag = cacheStore.getETag(cacheKey)
  
  const headers = {}
  if (cachedETag) {
    headers['If-None-Match'] = cachedETag
  }

  try {
    const response = await apiClient.get(endpoint, { 
      headers,
      validateStatus: (status) => status === 200 || status === 304
    })

    // Server return 304 Not Modified - use cached data
    if (response.status === 304) {
      const cached = cacheStore.getCached(cacheKey)
      if (cached?.data) {
        return cached.data
      }
      // Cache hilang, fetch ulang tanpa ETag
      const freshResponse = await apiClient.get(endpoint)
      const freshData = freshResponse.data?.data || []
      const freshETag = freshResponse.headers?.etag
      if (freshETag) {
        cacheStore.setCache(cacheKey, freshData, freshETag)
      }
      return freshData
    }

    // Server return 200 - new data
    const data = response.data?.data || []
    const newETag = response.headers?.etag
    
    if (newETag) {
      cacheStore.setCache(cacheKey, data, newETag)
    }

    return data
  } catch (error) {
    // Jika error, coba gunakan cached data sebagai fallback
    const cached = cacheStore.getCached(cacheKey)
    if (cached?.data) {
      console.warn(`Failed to fetch ${endpoint}, using cached data:`, error)
      return cached.data
    }
    throw error
  }
}

/**
 * Invalidate cache setelah mutasi (create/update/delete)
 * @param {string} cacheKey - Key untuk invalidate
 */
export function invalidateReferenceCache(cacheKey) {
  const cacheStore = useReferenceCacheStore(pinia)
  cacheStore.invalidate(cacheKey)
}

/**
 * Invalidate semua reference cache
 */
export function invalidateAllReferenceCache() {
  const cacheStore = useReferenceCacheStore(pinia)
  cacheStore.invalidateAll()
}

// Cache keys constants
export const CACHE_KEYS = {
  GURU: 'guru',
  KELAS: 'kelas',
  MAPEL: 'mapel'
}
