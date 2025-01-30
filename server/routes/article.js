const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

// 获取最近6篇文章 - 移到最前面
router.get('/recent', async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title createdAt tags')
      .lean()

    // 格式化数据
    const formattedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      tags: article.tags || [],
      createdAt: new Date(article.createdAt).toISOString().split('T')[0]
    }))

    console.log('Sending recent articles:', formattedArticles)
    res.json({
      code: 0,
      data: formattedArticles
    })
  } catch (error) {
    console.error('Error fetching recent articles:', error)
    res.status(500).json({
      code: -1,
      message: '获取最近文章失败'
    })
  }
})

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .lean()
    
    // 格式化数据
    const formattedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      tags: article.tags || [],
      wordCount: article.wordCount || 0,
      createdAt: new Date(article.createdAt).toISOString(),
      updatedAt: new Date(article.updatedAt).toISOString()
    }))
    
    res.json({
      code: 0,
      data: formattedArticles
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
router.get('/:id', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    
    const article = await Article.findById(req.params.id).lean()
    if (!article) {
      return res.status(404).json({
        code: -1,
        message: '文章不存在'
      })
    }
    
    // 格式化数据
    const formattedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      tags: article.tags || [],
      wordCount: article.wordCount || 0,
      createdAt: new Date(article.createdAt).toISOString(),
      updatedAt: new Date(article.updatedAt).toISOString()
    }
    
    res.json({
      code: 0,
      data: formattedArticle
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取文章详情失败'
    })
  }
})

// 发布新文章
router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body
    
    // 创建新文章，字数会通过 pre('save') 中间件自动计算
    const article = new Article({
      title,
      content,
      tags
    })
    
    await article.save()
    
    // 返回格式化的文章数据
    const formattedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      tags: article.tags || [],
      wordCount: article.wordCount,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }
    
    res.status(201).json({
      code: 0,
      data: formattedArticle,
      message: '文章发布成功'
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({
      code: -1,
      message: '创建文章失败',
      error: error.message
    })
  }
})

// 更新文章
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body
    
    // 查找并更新文章，字数会通过 pre('save') 中间件自动计算
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
    
    // 返回格式化的文章数据
    const formattedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      tags: article.tags || [],
      wordCount: article.wordCount,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }
    
    res.json({
      code: 0,
      data: formattedArticle,
      message: '文章更新成功'
    })
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({
      code: -1,
      message: '更新文章失败',
      error: error.message
    })
  }
})

// 获取标签统计
router.get('/tags', async (req, res) => {
  try {
    const articles = await Article.find().select('tags')
    const tagMap = {}
    
    articles.forEach(article => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          if (tag) {
            tagMap[tag] = (tagMap[tag] || 0) + 1
          }
        })
      }
    })
    
    const tags = Object.entries(tagMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count)
    
    res.json({ tags })
  } catch (error) {
    console.error('获取标签统计失败:', error)
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

module.exports = router 