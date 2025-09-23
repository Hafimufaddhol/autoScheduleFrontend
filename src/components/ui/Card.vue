<template>
  <div :class="cardClasses">
    <!-- Card Header -->
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
        
        <!-- Header Actions -->
        <div v-if="$slots.headerActions" class="flex items-center space-x-2">
          <slot name="headerActions"></slot>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div :class="bodyClasses">
      <slot></slot>
    </div>

    <!-- Card Footer -->
    <div v-if="showFooter" :class="footerClasses">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
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
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'flat'].includes(value)
  },
  size: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  },
  
  // Interactive
  clickable: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// Computed
const cardClasses = computed(() => {
  const baseClasses = ['rounded-lg', 'transition-all', 'duration-200']
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    flat: 'bg-gray-50 border border-gray-200'
  }
  
  // Size classes
  const sizeClasses = {
    full: 'w-full',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }
  
  // Interactive classes
  const interactiveClasses = []
  if (props.clickable) {
    interactiveClasses.push('cursor-pointer hover:shadow-md')
  }
  if (props.hoverable) {
    interactiveClasses.push('hover:shadow-lg hover:-translate-y-1')
  }
  
  return [
    ...baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    ...interactiveClasses
  ].join(' ')
})

const headerClasses = computed(() => {
  const baseClasses = ['border-b', 'border-gray-200']
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-4 py-3',
    default: 'px-6 py-4',
    lg: 'px-8 py-6'
  }
  
  return [
    ...baseClasses,
    paddingClasses[props.padding]
  ].join(' ')
})

const bodyClasses = computed(() => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  return paddingClasses[props.padding]
})

const footerClasses = computed(() => {
  const baseClasses = ['border-t', 'border-gray-200']
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-4 py-3',
    default: 'px-6 py-4',
    lg: 'px-8 py-6'
  }
  
  return [
    ...baseClasses,
    paddingClasses[props.padding]
  ].join(' ')
})

// Methods
const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

