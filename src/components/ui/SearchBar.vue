<template>
  <form class="w-full" @submit.prevent="$emit('submit')">
    <label v-if="label" :for="inputId" class="sr-only">{{ label }}</label>
    <div class="flex items-center gap-2">
      <Input
        v-model="valueProxy"
        :id="inputId"
        :placeholder="placeholder"
        :variant="variant"
        :size="size"
        class="flex-1"
      />
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue'
import Input from './Input.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Cari...'
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `search-${Math.random().toString(36).slice(2)}`
  },
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const valueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const inputId = computed(() => props.id)
</script>
