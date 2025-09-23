import { ref, computed } from 'vue'

// Global sidebar state
const isOpen = ref(false)
const isMobile = ref(false)

export function useSidebar() {
  // Computed
  const sidebarClasses = computed(() => {
    return {
      'lg:translate-x-0': !isMobile.value,
      'translate-x-0': isOpen.value && isMobile.value,
      '-translate-x-full': !isOpen.value && isMobile.value
    }
  })

  const backdropClasses = computed(() => {
    return {
      'opacity-50': isOpen.value && isMobile.value,
      'opacity-0': !isOpen.value || !isMobile.value,
      'pointer-events-auto': isOpen.value && isMobile.value,
      'pointer-events-none': !isOpen.value || !isMobile.value
    }
  })

  // Methods
  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const setMobile = (mobile) => {
    isMobile.value = mobile
    if (!mobile) {
      isOpen.value = false
    }
  }

  // Check if mobile on mount and resize
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024 // lg breakpoint
  }

  // Auto-close on mobile when route changes
  const handleRouteChange = () => {
    if (isMobile.value) {
      close()
    }
  }

  return {
    // State
    isOpen: computed(() => isOpen.value),
    isMobile: computed(() => isMobile.value),
    
    // Computed classes
    sidebarClasses,
    backdropClasses,
    
    // Methods
    open,
    close,
    toggle,
    setMobile,
    checkMobile,
    handleRouteChange
  }
}

