import { useUserStore } from '@/stores/user'

export const permission = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value } = binding
    
    if (value && !userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
} 