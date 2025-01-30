const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')

// 导入路由
const dailyRoutes = require('./routes/daily')
const articleRoutes = require('./routes/article')
const commentRoutes = require('./routes/comment')
const archiveRoutes = require('./routes/archive')
const adminRoutes = require('./routes/admin')

const app = express()

// 连接数据库
connectDB()
  .then(() => {
    console.log('数据库连接成功')
  })
  .catch(err => {
    console.error('数据库连接失败:', err)
    process.exit(1)
  })

// CORS 配置
app.use(cors({
  origin: 'http://localhost:8080', // 只允许前端开发服务器
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}))

// 其他中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// 添加全局缓存控制中间件
app.use((req, res, next) => {
  // 禁用所有 GET 请求的缓存
  if (req.method === 'GET') {
    res.set('Cache-Control', 'no-store')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
  }
  next()
})

// 注册路由
app.use('/api/articles', articleRoutes)
app.use('/api/daily', dailyRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/archive', archiveRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '服务器运行正常',
    time: new Date().toISOString()
  });
})

// 未匹配路由日志
app.use((req, res, next) => {
  console.log(`未匹配的路由: ${req.method} ${req.url}`)
  next()
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: -1,
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  })
})

// CORS 错误处理
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    res.status(403).json({
      code: -1,
      message: '不允许的跨域请求'
    })
  } else {
    next(err)
  }
})

// 处理 404
app.use((req, res) => {
  res.status(404).json({ message: `找不到路径: ${req.url}` })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
})

module.exports = app 