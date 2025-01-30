const express = require('express')
const router = express.Router()
const Daily = require('../models/Daily')
const mongoose = require('mongoose')

// 获取动态列表
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    console.log('Fetching daily list - Start')
    
    // 检查数据库连接状态
    console.log('Database connection state:', mongoose.connection.readyState)
    if (!mongoose.connection.readyState) {
      throw new Error('Database not connected')
    }

    // 检查 Daily 模型是否正确注册
    console.log('Daily model:', Daily.modelName)
    
    // 尝试获取一条记录来测试
    const count = await Daily.countDocuments()
    console.log('Total daily records:', count)
    
    const dailyList = await Daily.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    console.log('Query executed successfully')

    // 如果没有数据，返回空数组
    if (!dailyList || dailyList.length === 0) {
      console.log('No daily records found')
      return res.json({
        code: 0,
        data: []
      })
    }

    // 格式化日期
    const formattedList = dailyList.map(item => {
      console.log('Processing item:', item._id)
      try {
        // 安全地处理日期
        let createdAt = item.createdAt
        if (!(createdAt instanceof Date)) {
          createdAt = new Date(createdAt)
        }
        if (isNaN(createdAt.getTime())) {
          console.warn('Invalid date for item:', item._id)
          createdAt = new Date() // 使用当前时间作为后备
        }
        
        return {
          ...item,
          id: item._id,
          createdAt: createdAt.toISOString()
        }
      } catch (err) {
        console.warn('Error processing item:', item._id, err)
        return {
          ...item,
          id: item._id,
          createdAt: new Date().toISOString() // 使用当前时间作为后备
        }
      }
    })

    console.log(`Found ${formattedList.length} daily items`)
    res.json({
      code: 0,
      data: formattedList
    })
  } catch (error) {
    console.error('获取动态列表失败 - 详细错误:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // 检查是否是 MongoDB 错误
    if (error instanceof mongoose.Error) {
      console.error('MongoDB specific error:', {
        errorType: error.constructor.name,
        modelName: error.model?.modelName,
        collection: error.model?.collection?.name
      })
    }
    
    res.status(500).json({
      code: -1,
      message: '获取列表失败',
      error: {
        message: error.message,
        type: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    })
  }
})

// 发布新动态
router.post('/', async (req, res) => {
  try {
    const { content, nickname, email } = req.body
    console.log('Creating new daily with data:', { content, nickname, email })
    
    // 从QQ邮箱获取头像
    let avatar = ''
    if (email && email.endsWith('@qq.com')) {
      const qq = email.split('@')[0]
      avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
    }
    
    const daily = new Daily({
      content,
      nickname,
      email,
      avatar: avatar || 'https://example.com/default-avatar.png'
    })
    
    await daily.save()
    console.log('Daily created successfully:', daily._id)
    
    res.json({
      code: 0,
      data: {
        ...daily.toObject(),
        id: daily._id,
        createdAt: daily.createdAt.toISOString()
      },
      message: '发布成功'
    })
  } catch (error) {
    console.error('发布动态失败:', error)
    res.status(500).json({
      code: -1,
      message: '发布失败',
      error: error.message
    })
  }
})

// 删除动态
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Deleting daily with id:', id)
    
    const result = await Daily.findByIdAndDelete(id)
    if (!result) {
      return res.status(404).json({
        code: -1,
        message: '动态不存在'
      })
    }
    
    console.log('Daily deleted successfully')
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除动态失败:', error)
    res.status(500).json({
      code: -1,
      message: '删除失败',
      error: error.message
    })
  }
})

module.exports = router 