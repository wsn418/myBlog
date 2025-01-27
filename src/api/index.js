import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 直接返回响应数据，不再进行额外处理
    return response
  },
  error => {
    console.error('API请求错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const dailyApi = {
  // 获取动态列表
  async getList() {
    try {
      const response = await api.get('/api/daily')
      return response.data  // 返回完整的响应数据
    } catch (error) {
      console.error('获取动态列表失败:', error)
      throw error
    }
  },

  // 发布动态
  async create(data) {
    try {
      const response = await api.post('/api/daily', data)
      return response.data
    } catch (error) {
      console.error('发布动态失败:', error)
      throw error
    }
  }
}

export const articleApi = {
  // 获取文章列表
  async getList() {
    const response = await api.get('/api/articles')
    return response.data
  },
  
  // 获取文章详情
  async getDetail(id) {
    const response = await api.get(`/api/articles/${id}`)
    return response.data
  },
  
  // 发布新文章
  async create(data) {
    const response = await api.post('/api/articles', data)
    return response.data
  }
}

export const commentApi = {
  // 获取评论列表
  async getList(params) {
    const response = await api.get('/api/comments', { params })
    return response.data
  },
  
  // 发表评论
  async create(data) {
    const response = await api.post('/api/comments', data)
    return response.data
  }
}

export default api 