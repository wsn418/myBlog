const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

// 导入路由
const dailyRoutes = require('./routes/daily')
const articleRoutes = require('./routes/article')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/myblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('数据库连接成功')
}).catch(err => {
  console.error('数据库连接失败:', err)
})

// 注册路由
app.use('/api/daily', dailyRoutes)
app.use('/api/articles', articleRoutes)

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err.stack)
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 处理 404
app.use((req, res) => {
  res.status(404).json({ message: `找不到路径1: ${req.url}` })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
}) 