const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const { auth } = require('../middleware/auth')

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

// 获取所有标签列表
router.get('/tags', async (req, res) => {
  try {
    // 使用聚合管道获取所有不重复的标签
    const tags = await Article.aggregate([
      { $unwind: '$tags' },  // 展开标签数组
      { $group: { _id: '$tags' } },  // 按标签分组
      { $sort: { _id: 1 } }  // 按字母顺序排序
    ])
    
    // 提取标签值并返回
    const tagList = tags.map(tag => tag._id)
    
    res.json({
      code: 0,
      data: tagList,
      message: '获取标签列表成功'
    })
  } catch (error) {
    console.error('获取标签列表失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取标签列表失败',
      error: error.message
    })
  }
})

// 获取文章详情
router.get('/:id', async (req, res) => {
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
      data: article
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取文章详情失败',
      error: error.message
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

// 删除文章
router.delete('/:id', async (req, res) => {
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
      message: '删除成功'
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