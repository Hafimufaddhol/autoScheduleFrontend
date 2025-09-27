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
      class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Icon (left) -->
    <i 
      v-if="icon && !loading" 
      :class="['-ml-1 mr-2 h-5 w-5', icon]" 
    />

    <!-- Button content -->
    <span v-if="!loading">{{ label }}</span>
    <span v-else>{{ loadingText }}</span>

    <!-- Icon (right) -->
    <i 
      v-if="iconRight && !loading" 
      :class="['ml-2 h-5 w-5', iconRight]" 
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  label: { type: String, default: 'Button' },
  loadingText: { type: String, default: 'Loading...' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  icon: { type: String, default: null }, // pakai class fontawesome
  iconRight: { type: String, default: null }
})

// Emits
const emit = defineEmits(['click'])

// Computed
const buttonClasses = computed(() => {
  const baseClasses = [
    'text-white',
    'bg-cyan-600',
    'hover:bg-cyan-700',
    'focus:ring-4',
    'focus:ring-cyan-200',
    'font-medium',
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-lg',
    'text-sm',
    'px-3',
    'py-2',
    'text-center',
    'transition-colors',
    'duration-200'
  ]

  const widthClasses = props.fullWidth ? 'w-full' : 'sm:w-auto'

  const disabledClasses = props.disabled || props.loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer'

  return [...baseClasses, widthClasses, disabledClasses].join(' ')
})

// Methods
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
