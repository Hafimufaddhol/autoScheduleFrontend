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
        v-if="state.isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="onCancel"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop overlay -->
          <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

          <!-- Dialog panel -->
          <Transition
            enter-active-class="transition-all ease-out duration-300"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all ease-in duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-90"
          >
            <div
              v-if="state.isOpen"
              class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              @click.stop
            >
              <!-- Content -->
              <div class="p-6">
                <div class="flex items-start gap-4">
                  <!-- Icon -->
                  <div :class="iconContainerClass">
                    <i :class="iconClass"></i>
                  </div>

                  <!-- Text -->
                  <div class="flex-1 pt-0.5">
                    <h3 class="text-lg font-semibold text-gray-900">{{ state.title }}</h3>
                    <p class="mt-2 text-sm text-gray-600 leading-relaxed">{{ state.message }}</p>
                  </div>
                </div>

                <!-- Buttons -->
                <div class="mt-6 flex justify-end gap-3">
                  <button
                    @click="onCancel"
                    class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    {{ state.cancelText }}
                  </button>
                  <button
                    @click="onConfirm"
                    :class="confirmButtonClass"
                  >
                    {{ state.confirmText }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { state, handleConfirm, handleCancel } = useConfirmDialog()

const iconContainerClass = computed(() => {
  const base = 'flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full'
  const variants = {
    danger: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-cyan-100'
  }
  return `${base} ${variants[state.variant] || variants.danger}`
})

const iconClass = computed(() => {
  const variants = {
    danger: 'fa-solid fa-triangle-exclamation text-red-600 text-xl',
    warning: 'fa-solid fa-exclamation-circle text-amber-600 text-xl',
    info: 'fa-solid fa-info-circle text-cyan-600 text-xl'
  }
  return variants[state.variant] || variants.danger
})

const confirmButtonClass = computed(() => {
  const base = 'px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    info: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'
  }
  return `${base} ${variants[state.variant] || variants.danger}`
})

const onConfirm = () => {
  handleConfirm()
}

const onCancel = () => {
  handleCancel()
}
</script>
