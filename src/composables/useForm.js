import { ref } from 'vue'

export function useForm() {
  const loading = ref(false)
  const errors = ref({})

  const validateField = (field, value, rules) => {
    if (rules.required && !value) {
      errors.value[field] = `${field} is required`
      return false
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.value[field] = `${field} must be at least ${rules.minLength} characters`
      return false
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.value[field] = `${field} must be at most ${rules.maxLength} characters`
      return false
    }

    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.value[field] = 'Invalid email format'
      return false
    }

    delete errors.value[field]
    return true
  }

  const clearErrors = () => {
    errors.value = {}
  }

  return {
    loading,
    errors,
    validateField,
    clearErrors
  }
}
