<template>
  <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-wide text-cyan-600">{{ eyebrow }}</p>
      <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
      <p v-if="subtitle" class="mt-2 text-gray-600">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  eyebrow: {
    type: String,
    default: ''
  }
})
</script>
