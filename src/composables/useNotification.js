import { ref } from 'vue'

export function useNotification() {
  const notifications = ref([])

  const notify = (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    notifications.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message, duration) => notify(message, 'success', duration)
  const error = (message, duration) => notify(message, 'error', duration)
  const warning = (message, duration) => notify(message, 'warning', duration)
  const info = (message, duration) => notify(message, 'info', duration)

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    remove
  }
}
