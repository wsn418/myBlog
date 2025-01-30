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

    // 格式化日期
    const formattedArticles = articles.map(article => ({
      ...article,
      id: article._id, // 确保返回 id 字段
      createdAt: new Date(article.createdAt).toISOString().split('T')[0]
    }))

    console.log('Sending recent articles:', formattedArticles) // 添加日志
    res.json({ articles: formattedArticles })
  } catch (error) {
    console.error('Error fetching recent articles:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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
    console.log('Fetching article with id:', req.params.id);  // 添加日志
    const article = await Article.findById(req.params.id)
      .select('title content createdAt updatedAt tags wordCount')  // 确保选择所有需要的字段
      .lean();
      
    if (!article) {
      console.log('Article not found');  // 添加日志
      return res.status(404).json({ message: '文章不存在' });
    }

    console.log('Found article:', article);  // 添加日志
    res.json(article);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ 
      message: '获取文章详情失败',
      error: error.message 
    });
  }
})

// 发布新文章
router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body
    
    // 计算文章字数
    const wordCount = content.length
    
    const article = new Article({
      title,
      content,
      tags,
      wordCount
    })
    
    await article.save()
    res.status(201).json(article)
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({ message: '服务器错误', error: error.message })
  }
})

// 更新文章
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body
    
    // 更新时重新计算字数
    const wordCount = content.length
    
    const article = await Article.findByIdAndUpdate(
      req.params.id, 
      { title, content, tags, wordCount },
      { new: true }
    )
    
    if (!article) {
      return res.status(404).json({ message: '文章不存在' })
    }
    
    res.json(article)
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({ message: '服务器错误', error: error.message })
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