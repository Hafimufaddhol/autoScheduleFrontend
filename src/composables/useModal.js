import { computed,ref, reactive } from 'vue'

// Global modal state
const modals = reactive({})

export function useModal(modalId = 'default') {
  // Initialize modal state if not exists
  if (!modals[modalId]) {
    modals[modalId] = {
      isOpen: false,
      data: null,
      loading: false
    }
  }
  
  const modal = modals[modalId]
  
  // Methods
  const open = (data = null) => {
    modal.isOpen = true
    modal.data = data
  }
  
  const close = () => {
    modal.isOpen = false
    modal.data = null
    modal.loading = false
  }
  
  const toggle = (data = null) => {
    if (modal.isOpen) {
      close()
    } else {
      open(data)
    }
  }
  
  const setLoading = (loading) => {
    modal.loading = loading
  }
  
  const setData = (data) => {
    modal.data = data
  }
  
  return {
    // State
    isOpen: computed(() => modal.isOpen),
    data: computed(() => modal.data),
    loading: computed(() => modal.loading),
    
    // Methods
    open,
    close,
    toggle,
    setLoading,
    setData
  }
}

// Global modal manager
export function useModalManager() {
  const openModal = (modalId, data = null) => {
    if (!modals[modalId]) {
      modals[modalId] = {
        isOpen: false,
        data: null,
        loading: false
      }
    }
    modals[modalId].isOpen = true
    modals[modalId].data = data
  }
  
  const closeModal = (modalId) => {
    if (modals[modalId]) {
      modals[modalId].isOpen = false
      modals[modalId].data = null
      modals[modalId].loading = false
    }
  }
  
  const closeAllModals = () => {
    Object.keys(modals).forEach(modalId => {
      closeModal(modalId)
    })
  }
  
  const isModalOpen = (modalId) => {
    return modals[modalId]?.isOpen || false
  }
  
  const getModalData = (modalId) => {
    return modals[modalId]?.data || null
  }
  
  return {
    modals: computed(() => modals),
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData
  }
}

