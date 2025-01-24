const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const skip = (page - 1) * pageSize

    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)

    const total = await Article.countDocuments()
    const hasNextPage = total > skip + articles.length

    res.json({
      articles,
      hasNextPage,
      total
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({ message: '获取文章列表失败' })
  }
})

// 获取单篇文章
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) {
      return res.status(404).json({ message: '文章不存在' })
    }
    res.json(article)
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({ message: '获取文章详情失败' })
  }
})

// 发布新文章
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }

    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      created_at: new Date(),
      updated_at: new Date()
    })

    await article.save()
    res.status(201).json(article)
  } catch (error) {
    console.error('发布文章失败:', error)
    res.status(500).json({ message: '发布文章失败' })
  }
})

module.exports = router 