<template>
    <div
      class="flex items-center p-4 mb-4 text-sm rounded-lg"
      :class="alertClasses"
      role="alert"
    >
      <svg
        class="shrink-0 inline w-4 h-4 me-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3
             1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1
             0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
        />
      </svg>
      <span class="sr-only">Info</span>
      <div>
        <span v-if="title" class="font-medium">{{ title }}</span>
        {{ message }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  
  const props = defineProps({
    type: {
      type: String,
      default: "info", // info, success, danger, warning, dark
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
  });
  
  const alertClasses = computed(() => {
    switch (props.type) {
      case "info":
        return "text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400";
      case "danger":
        return "text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400";
      case "success":
        return "text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400";
      case "warning":
        return "text-yellow-800 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300";
      case "dark":
        return "text-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400";
    }
  });
  </script>
  