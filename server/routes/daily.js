const express = require('express')
const router = express.Router()
const Daily = require('../models/Daily')

// 获取动态列表
router.get('/', async (req, res) => {
  try {
    const dailyList = await Daily.find()
      .sort({ createdAt: -1 })
      .lean()
    res.json({
      code: 0,
      data: dailyList
    })
  } catch (error) {
    console.error('获取动态列表失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取列表失败',
      error: error.message
    })
  }
})

// 发布新动态
router.post('/', async (req, res) => {
  try {
    const { content, nickname, email } = req.body
    
    // 从QQ邮箱获取头像
    let avatar = ''
    if (email.endsWith('@qq.com')) {
      const qq = email.split('@')[0]
      avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
    }
    
    const daily = new Daily({
      content,
      nickname,
      email,
      avatar: avatar || 'https://example.com/default-avatar.png',
      createdAt: new Date()  // 使用服务器当前时间
    })
    
    await daily.save()
    
    res.json({
      code: 0,
      data: daily,
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

module.exports = router 