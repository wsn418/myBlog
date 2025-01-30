import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const login = async (loginForm) => {
    const res = await loginApi(loginForm)
    token.value = res.token
    localStorage.setItem('token', res.token)
    await getUserInfoAction()
  }

  const getUserInfoAction = async () => {
    const res = await getUserInfo()
    userInfo.value = res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const hasPermission = (permission) => {
    return userInfo.value?.permissions?.includes(permission)
  }

  return {
    token,
    userInfo,
    login,
    logout,
    getUserInfoAction,
    hasPermission
  }
}) 