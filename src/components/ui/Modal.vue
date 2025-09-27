<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <!-- Backdrop overlay -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <!-- Modal panel -->
          <Transition
            enter-active-class="transition-all ease-out duration-300"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition-all ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="isOpen"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div v-if="showHeader" :class="headerClasses">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 v-if="title" class="text-lg font-semibold text-gray-900">
                      {{ title }}
                    </h3>
                    <p v-if="subtitle" class="text-sm text-gray-600 mt-1">
                      {{ subtitle }}
                    </p>
                  </div>
                  
                  <!-- Close button -->
                  <button
                    v-if="showCloseButton"
                    @click="close"
                    class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
                  >
                    <span class="sr-only">Close</span>
                    <XIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div :class="bodyClasses">
                <slot></slot>
              </div>

              <!-- Footer -->
              <div v-if="showFooter" :class="footerClasses">
                <slot name="footer">
                  <!-- Default footer buttons -->
                  <div class="flex justify-end space-x-3">
                    <button
                      v-if="showCancelButton"
                      @click="close"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {{ cancelText }}
                    </button>
                    <button
                      v-if="showConfirmButton"
                      @click="confirm"
                      :class="confirmButtonClasses"
                    >
                      {{ confirmText }}
                    </button>
                  </div>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'
import { onUnmounted } from 'vue'

// Props
const props = defineProps({
  // State
  isOpen: {
    type: Boolean,
    default: false
  },
  
  // Content
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  
  // Layout
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  
  // Footer buttons
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  
  // Styling
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger', 'warning', 'success'].includes(value)
  },
  
  // Behavior
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  },
  preventScroll: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['close', 'confirm', 'open'])

// Computed
const modalClasses = computed(() => {
  const baseClasses = [
    'relative',
    'bg-white',
    'rounded-lg',
    'shadow-xl',
    'transform',
    'transition-all'
  ]
  
  // Size classes
  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full max-w-full mx-4'
  }
  
  return [
    ...baseClasses,
    sizeClasses[props.size]
  ].join(' ')
})

const headerClasses = computed(() => {
  const baseClasses = ['px-6', 'py-4', 'border-b', 'border-gray-200']
  
  if (props.variant === 'danger') {
    baseClasses.push('bg-red-50', 'border-red-200')
  } else if (props.variant === 'warning') {
    baseClasses.push('bg-yellow-50', 'border-yellow-200')
  } else if (props.variant === 'success') {
    baseClasses.push('bg-green-50', 'border-green-200')
  }
  
  return baseClasses.join(' ')
})

const bodyClasses = computed(() => {
  return 'px-6 py-4'
})

const footerClasses = computed(() => {
  const baseClasses = ['px-6', 'py-4', 'border-t', 'border-gray-200']
  
  if (props.variant === 'danger') {
    baseClasses.push('bg-red-50', 'border-red-200')
  } else if (props.variant === 'warning') {
    baseClasses.push('bg-yellow-50', 'border-yellow-200')
  } else if (props.variant === 'success') {
    baseClasses.push('bg-green-50', 'border-green-200')
  }
  
  return baseClasses.join(' ')
})

const confirmButtonClasses = computed(() => {
  const baseClasses = [
    'px-4',
    'py-2',
    'text-sm',
    'font-medium',
    'text-white',
    'rounded-md',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2'
  ]
  
  const variantClasses = {
    default: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  }
  
  return [
    ...baseClasses,
    variantClasses[props.variant]
  ].join(' ')
})

// Methods
const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    emit('open')
    
    // Add escape key listener
    if (props.closeOnEscape) {
      document.addEventListener('keydown', handleEscape)
    }
    
    // Prevent body scroll
    if (props.preventScroll) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscape)
    
    // Restore body scroll
    if (props.preventScroll) {
      document.body.style.overflow = ''
    }
  }
})

// Cleanup on unmount


onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (props.preventScroll) {
    document.body.style.overflow = ''
  }
})
</script>

<script>
// Icon component
export const XIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  `
}
</script>

