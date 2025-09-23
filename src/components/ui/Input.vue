<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="inputId" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div 
        v-if="leftIcon" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component :is="leftIcon" class="h-5 w-5 text-gray-400" />
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keyup="handleKeyup"
        @keydown="handleKeydown"
      />

      <!-- Right Icon -->
      <div 
        v-if="rightIcon || showPasswordToggle" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <!-- Password Toggle -->
        <button
          v-if="showPasswordToggle"
          type="button"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="togglePasswordVisibility"
        >
          <component 
            :is="passwordVisible ? 'EyeOffIcon' : 'EyeIcon'" 
            class="h-5 w-5" 
          />
        </button>

        <!-- Right Icon -->
        <component 
          v-else-if="rightIcon" 
          :is="rightIcon" 
          class="h-5 w-5 text-gray-400" 
        />
      </div>
    </div>

    <!-- Helper Text -->
    <p v-if="helperText" class="mt-1 text-sm text-gray-500">
      {{ helperText }}
    </p>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>

    <!-- Character Count -->
    <p v-if="showCharCount && maxlength" class="mt-1 text-sm text-gray-500 text-right">
      {{ modelValue?.length || 0 }}/{{ maxlength }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// Props
const props = defineProps({
  // Basic props
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  
  // Behavior
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  
  // Validation
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  },
  minlength: {
    type: [String, Number],
    default: null
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  pattern: {
    type: String,
    default: null
  },
  autocomplete: {
    type: String,
    default: null
  },
  
  // Styling
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'underlined'].includes(value)
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
  
  // Features
  showPasswordToggle: {
    type: Boolean,
    default: false
  },
  showCharCount: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'blur',
  'focus',
  'keyup',
  'keydown'
])

// Reactive data
const passwordVisible = ref(false)
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

// Computed
const inputType = computed(() => {
  if (props.showPasswordToggle && props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const inputClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'border',
    'rounded-lg',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    'transition-colors',
    'duration-200'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    filled: 'bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    underlined: 'border-0 border-b-2 border-gray-300 rounded-none focus:ring-0 focus:border-blue-500'
  }

  // State classes
  const stateClasses = props.error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : variantClasses[props.variant]

  // Disabled classes
  const disabledClasses = props.disabled 
    ? 'bg-gray-100 cursor-not-allowed' 
    : 'bg-white'

  // Padding for icons
  const paddingClasses = []
  if (props.leftIcon) paddingClasses.push('pl-10')
  if (props.rightIcon || props.showPasswordToggle) paddingClasses.push('pr-10')

  return [
    ...baseClasses,
    sizeClasses[props.size],
    stateClasses,
    disabledClasses,
    ...paddingClasses
  ].join(' ')
})

// Methods
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleKeyup = (event) => {
  emit('keyup', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}
</script>

<script>
// Icon components
export const EyeIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
  `
}

export const EyeOffIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
    </svg>
  `
}
</script>

