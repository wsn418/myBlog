import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // 只有在真正需要登出的情况下才执行登出
      if (error.response.data?.message === '认证失败，请重新登录') {
        localStorage.removeItem('token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api