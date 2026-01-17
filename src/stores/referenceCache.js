import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'reference_cache'

/**
 * Store untuk caching reference list (guru, kelas, mapel)
 * dengan ETag-based invalidation
 */
export const useReferenceCacheStore = defineStore('referenceCache', () => {
  // In-memory cache
  const cache = ref({})

  // Load from localStorage on init
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        cache.value = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to load reference cache from localStorage:', e)
      cache.value = {}
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache.value))
    } catch (e) {
      console.warn('Failed to save reference cache to localStorage:', e)
    }
  }

  // Get cached data for a key
  const getCached = (key) => {
    return cache.value[key] || null
  }

  // Get ETag for a key
  const getETag = (key) => {
    return cache.value[key]?.etag || null
  }

  // Set cache data with ETag
  const setCache = (key, data, etag) => {
    cache.value[key] = {
      data,
      etag,
      timestamp: Date.now()
    }
    saveToStorage()
  }

  // Invalidate specific cache
  const invalidate = (key) => {
    if (cache.value[key]) {
      delete cache.value[key]
      saveToStorage()
    }
  }

  // Invalidate all cache
  const invalidateAll = () => {
    cache.value = {}
    saveToStorage()
  }

  // Initialize - load from storage
  loadFromStorage()

  return {
    cache,
    getCached,
    getETag,
    setCache,
    invalidate,
    invalidateAll,
    loadFromStorage
  }
})
