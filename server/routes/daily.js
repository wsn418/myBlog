const express = require('express')
const router = express.Router()
const Daily = require('../models/Daily')

// 获取动态列表
router.get('/', async (req, res) => {
  try {
    const dailyItems = await Daily.find()
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(dailyItems)
  } catch (error) {
    console.error('获取动态列表失败:', error)
    res.status(500).json({ message: '获取动态列表失败' })
  }
})

// 发布新动态
router.post('/', async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '动态内容不能为空' })
    }

    const daily = new Daily({
      content: content.trim()
    })

    await daily.save()
    res.status(201).json(daily)
  } catch (error) {
    console.error('发布动态失败:', error)
    res.status(500).json({ message: '发布动态失败' })
  }
})

module.exports = router 