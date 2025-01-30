import axios from 'axios'

// 设置基础URL
const api = axios.create({
  baseURL: '/api',  // 使用相对路径，通过代理访问后端
  timeout: 15000,   // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  withCredentials: true  // 允许跨域请求携带凭证
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // 添加日志
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request headers:', config.headers); // 添加日志
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Response error:', error);
    if (error.response) {
      // 如果是 token 相关错误，清除 token 并跳转到登录页
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request config error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const dailyApi = {
  // 获取动态列表
  async getList() {
    try {
      const response = await api.get('/daily')
      return response.data  // 返回完整的响应数据
    } catch (error) {
      console.error('获取动态列表失败:', error)
      throw error
    }
  },

  // 发布动态
  async create(data) {
    try {
      const response = await api.post('/daily', data)
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
    try {
      const response = await api.get('/articles')
      return response.data
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    }
  },
  
  // 获取文章详情
  async getDetail(id) {
    try {
      console.log('Fetching article detail for id:', id)
      const response = await api.get(`/articles/${id}`)
      console.log('Article detail response:', response.data)
      return response.data
    } catch (error) {
      console.error('获取文章详情失败:', error)
      throw error
    }
  },
  
  // 发布新文章
  async create(data) {
    const response = await api.post('/articles', data)
    return response.data
  },
  
  // 获取标签统计
  async getTags() {
    const response = await api.get('/articles/tags')
    return response.data
  }
}

export const commentApi = {
  // 获取评论列表
  async getList(params) {
    const response = await api.get('/comments', { params })
    return response.data
  },
  
  // 发表评论
  async create(data) {
    const response = await api.post('/comments', data)
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
    
    const url = `/archive${queryParams.toString() ? '?' + queryParams.toString() : ''}`
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
    const response = await api.get('/articles/recent')
    console.log('Recent articles response:', response.data)
    // 适配新的返回格式
    if (response.data.code === 0) {
      return {
        articles: response.data.data // 直接返回数据数组
      }
    } else {
      throw new Error(response.data.message || '获取文章列表失败')
    }
  } catch (error) {
    console.error('Error fetching recent articles:', error)
    throw error
  }
}

// 登录接口
export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data)
    console.log('Login response:', response.data)
    
    if (response.data.code === 0 && response.data.data?.token) {
      const token = response.data.data.token
      console.log('Saving token:', token)
      localStorage.setItem('token', token)
    }
    return response.data
  } catch (error) {
    console.error('Login error:', error)
    throw error.response?.data || error
  }
}

// 获取用户信息
export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }
    
    const response = await api.get('/auth/user/info')
    return response.data
  } catch (error) {
    console.error('Get user info error:', error)
    throw error.response?.data || error
  }
}

// 修改密码
export const changePassword = (data) => {
  return api.put('/auth/user/password', data)
}

// 登出
export const logout = () => {
  localStorage.removeItem('token')
  window.location.href = '/admin/login'
}

export default api 