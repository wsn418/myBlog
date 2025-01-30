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
    try {
      console.log('Fetching article detail for id:', id);  // 添加日志
      const response = await api.get(`/api/articles/${id}`);
      console.log('Article detail response:', response.data);  // 添加日志
      return response.data;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      throw error;
    }
  },
  
  // 发布新文章
  async create(data) {
    const response = await api.post('/api/articles', data)
    return response.data
  },
  
  // 获取标签统计
  async getTags() {
    const response = await api.get('/api/articles/tags')
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

export const getArchive = async (params = {}) => {
  try {
    console.log('Requesting archive with params:', params)
    const { year, tag } = params
    const queryParams = new URLSearchParams()
    
    if (year) queryParams.append('year', year)
    if (tag) queryParams.append('tag', tag)
    
    const url = `/api/archive${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('Archive request URL:', url)
    
    const response = await api.get(url)
    console.log('Archive response:', response.data)
    return response.data
  } catch (error) {
    console.error('获取归档数据失败:', error)
    throw error
  }
}

// 获取最近6篇文章
export async function getRecentArticles() {
  try {
    const response = await api.get('/api/articles/recent')  // 使用 api 实例而不是 axios
    console.log('Recent articles response:', response.data) // 添加日志
    return response.data
  } catch (error) {
    console.error('Error fetching recent articles:', error)
    throw error
  }
}

export default api 