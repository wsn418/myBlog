const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const auth = require('../middleware/auth')

// 获取文章列表
router.get('/', auth, async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .select('title tags createdAt wordCount')
    
    res.json({
      code: 0,
      data: articles,
      message: '获取文章列表成功'
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取文章列表失败'
    })
  }
})

// 获取文章详情
router.get('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) {
      return res.status(404).json({
        code: -1,
        message: '文章不存在'
      })
    }
    
    res.json({
      code: 0,
      data: article,
      message: '获取文章详情成功'
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取文章详情失败'
    })
  }
})

// 创建文章
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body
    const article = new Article({
      title,
      content,
      tags
    })
    
    await article.save()
    res.status(201).json({
      code: 0,
      data: article,
      message: '创建文章成功'
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({
      code: -1,
      message: '创建文章失败'
    })
  }
})

// 更新文章
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body
    const article = await Article.findById(req.params.id)
    
    if (!article) {
      return res.status(404).json({
        code: -1,
        message: '文章不存在'
      })
    }
    
    article.title = title
    article.content = content
    article.tags = tags
    await article.save()
    
    res.json({
      code: 0,
      data: article,
      message: '更新文章成功'
    })
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({
      code: -1,
      message: '更新文章失败'
    })
  }
})

// 删除文章
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id)
    if (!article) {
      return res.status(404).json({
        code: -1,
        message: '文章不存在'
      })
    }
    
    res.json({
      code: 0,
      message: '删除文章成功'
    })
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({
      code: -1,
      message: '删除文章失败'
    })
  }
})

module.exports = router 