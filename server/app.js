const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

// 导入路由
const dailyRoutes = require('./routes/daily')
const articleRoutes = require('./routes/article')
const commentRoutes = require('./routes/comment')
const archiveRoutes = require('./routes/archive')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// 注册路由
app.use('/api/articles', articleRoutes)
app.use('/api/daily', dailyRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/archive', archiveRoutes)  // 确保这个路径正确

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/myblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('数据库连接成功')
}).catch(err => {
  console.error('数据库连接失败:', err)
})

// 未匹配路由日志
app.use((req, res, next) => {
  console.log(`未匹配的路由: ${req.method} ${req.url}`)
  next()
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err)
  res.status(500).json({
    code: -1,
    message: '服务器错误',
    error: err.message
  })
})

// 处理 404
app.use((req, res) => {
  res.status(404).json({ message: `找不到路径: ${req.url}` })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
}) 