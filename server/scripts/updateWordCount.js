const mongoose = require('mongoose')
const Article = require('../models/Article')

async function updateWordCount() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/myblog')
    console.log('数据库连接成功')

    const articles = await Article.find()
    console.log(`找到 ${articles.length} 篇文章`)

    for (const article of articles) {
      const text = article.content.replace(/<[^>]*>/g, '')
      
      // 统计中文字符、英文单词和数字
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
      const words = text.match(/[a-zA-Z]+/g) || []
      const numbers = text.match(/\d+/g) || []
      
      article.wordCount = chineseChars.length + words.length + numbers.length
      await article.save()
      console.log(`更新文章 ${article._id} 的字数: ${article.wordCount}`)
    }

    console.log('所有文章字数更新完成')
  } catch (error) {
    console.error('更新字数失败:', error)
  } finally {
    await mongoose.disconnect()
  }
}

updateWordCount()