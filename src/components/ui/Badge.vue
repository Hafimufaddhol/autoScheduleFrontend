<template>
  <span :class="badgeClasses">
    <!-- Left Icon -->
    <component 
      v-if="leftIcon" 
      :is="leftIcon" 
      class="w-3 h-3 mr-1"
    />
    
    <!-- Badge Content -->
    <slot>{{ label }}</slot>
    
    <!-- Right Icon -->
    <component 
      v-if="rightIcon" 
      :is="rightIcon" 
      class="w-3 h-3 ml-1"
    />
    
    <!-- Close Button -->
    <button
      v-if="dismissible"
      @click="handleDismiss"
      class="ml-1 inline-flex items-center justify-center w-4 h-4 text-current rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50"
    >
      <span class="sr-only">Dismiss</span>
      <XIcon class="w-3 h-3" />
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Content
  label: {
    type: String,
    default: ''
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'success', 'danger', 
      'warning', 'info', 'light', 'dark', 'outline'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Icons
  leftIcon: {
    type: [String, Object],
    default: null
  },
  rightIcon: {
    type: [String, Object],
    default: null
  },
  
  // Behavior
  dismissible: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['dismiss'])

// Computed
const badgeClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'font-medium',
    'transition-colors',
    'duration-200'
  ]
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }
  
  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-800 text-white',
    outline: 'border border-gray-300 text-gray-700 bg-white'
  }
  
  // Rounded classes
  const roundedClasses = props.rounded ? 'rounded-full' : 'rounded'
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    roundedClasses
  ].join(' ')
})

// Methods
const handleDismiss = () => {
  emit('dismiss')
}
</script>

<script>
// Icon component
export const XIcon = {
  template: `
    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
    </svg>
  `
}
</script>

