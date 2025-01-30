const express = require('express')
const router = express.Router()
const Article = require('../models/article')

// 测试路由
router.get('/test', (req, res) => {
  res.json({ message: 'Archive route is working' })
})

// 归档数据路由
router.get('/', async (req, res) => {
  try {
    console.log('Received archive request with query:', req.query)
    const { year, tag } = req.query
    let query = {}
    
    if (year) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31)
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      }
    }

    if (tag) {
      query.tags = tag
    }
    
    console.log('MongoDB query:', query)
    
    const articles = await Article.find(query)
      .select('title content createdAt tags wordCount')
      .sort({ createdAt: -1 })
      .lean()
    
    console.log('Found articles:', articles.length)
    
    // 统计标签和字数
    const tagMap = {}
    let totalWordCount = 0
    
    articles.forEach(article => {
      // 如果没有 wordCount，则计算 content 长度
      if (!article.wordCount && article.content) {
        article.wordCount = article.content.length
      }
      totalWordCount += article.wordCount || 0

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
    
    // 按年份分组，不需要在响应中包含 content
    const archiveMap = {}
    articles.forEach(article => {
      const year = new Date(article.createdAt).getFullYear()
      if (!archiveMap[year]) {
        archiveMap[year] = {
          year,
          count: 0,
          articles: []
        }
      }
      archiveMap[year].articles.push({
        id: article._id,
        title: article.title,
        createdAt: article.createdAt,
        tags: Array.isArray(article.tags) ? article.tags : [],
        wordCount: article.wordCount || 0  // 添加字数信息
      })
      archiveMap[year].count++
    })
    
    const archives = Object.values(archiveMap).sort((a, b) => b.year - a.year)
    
    const response = {
      total: articles.length,
      wordCount: totalWordCount,
      tags,
      archives
    }
    
    console.log('Sending response:', response)
    res.json(response)
  } catch (error) {
    console.error('获取归档数据失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: error.message 
    })
  }
})

module.exports = router 