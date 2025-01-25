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
  response => response.data,
  error => {
    console.error('API请求错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const dailyApi = {
  // 获取动态列表
  getList() {
    return api.get('/api/daily')
  },
  // 发布新动态
  create(content) {
    return api.post('/api/daily', { content })
  }
}

export const articleApi = {
  // 获取文章列表
  getList() {
    return api.get('/api/articles')
  },
  // 获取文章详情
  getDetail(id) {
    return api.get(`/api/articles/${id}`)
  },
  // 发布新文章
  create(data) {
    return api.post('/api/articles', data)
  }
}

export const commentApi = {
  // 获取评论列表
  getList(params) {
    return api.get('/api/comments', { params })
  },
  
  // 发表评论
  create(data) {
    return api.post('/api/comments', data)
  }
}

export default api 