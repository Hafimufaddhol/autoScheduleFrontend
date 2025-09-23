<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Icon (left) -->
    <component 
      v-if="icon && !loading" 
      :is="icon" 
      class="w-5 h-5 mr-2"
    />

    <!-- Button content -->
    <span v-if="!loading">{{ label }}</span>
    <span v-else>{{ loadingText }}</span>

    <!-- Icon (right) -->
    <component 
      v-if="iconRight && !loading" 
      :is="iconRight" 
      class="w-5 h-5 ml-2"
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Content
  label: {
    type: String,
    default: 'Button'
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  
  // Behavior
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'danger', 'warning', 'info', 
      'light', 'dark', 'outline-primary', 'outline-secondary', 
      'outline-success', 'outline-danger', 'outline-warning', 
      'outline-info', 'outline-light', 'outline-dark'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  
  // Icons
  icon: {
    type: [String, Object],
    default: null
  },
  iconRight: {
    type: [String, Object],
    default: null
  }
})

// Emits
const emit = defineEmits(['click'])

// Computed
const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'transition-colors',
    'duration-200'
  ]

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
    light: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
    'outline-primary': 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    'outline-secondary': 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
    'outline-success': 'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500',
    'outline-danger': 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500',
    'outline-warning': 'border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white focus:ring-yellow-500',
    'outline-info': 'border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white focus:ring-cyan-500',
    'outline-light': 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    'outline-dark': 'border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white focus:ring-gray-500'
  }

  // Disabled classes
  const disabledClasses = props.disabled || props.loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer'

  // Full width
  const widthClasses = props.fullWidth ? 'w-full' : ''

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses,
    widthClasses
  ].join(' ')
})

// Methods
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

