const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const Daily = require('../models/Daily')

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    // 获取文章统计
    const articleCount = await Article.countDocuments()
    
    // 获取日常动态统计
    const dailyCount = await Daily.countDocuments()
    
    // 获取标签统计
    const articles = await Article.find().select('tags')
    const tagSet = new Set()
    articles.forEach(article => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          if (tag) tagSet.add(tag)
        })
      }
    })
    const tagCount = tagSet.size
    
    // 获取总字数
    const totalWords = await Article.aggregate([
      {
        $group: {
          _id: null,
          total: { 
            $sum: '$wordCount'  // 使用预计算的字数字段
          }
        }
      }
    ])

    // 如果没有文章，返回0
    const wordCount = totalWords[0]?.total || 0
    
    console.log('Stats:', {
      articleCount,
      dailyCount,
      tagCount,
      wordCount
    })

    res.json({
      code: 0,
      data: {
        articleCount,
        dailyCount,
        tagCount,
        totalWords: wordCount
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取统计数据失败'
    })
  }
})

module.exports = router 