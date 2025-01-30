const mongoose = require('mongoose')
const Article = require('../models/article')

async function updateWordCount() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/myblog', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('数据库连接成功')
    
    const articles = await Article.find({}).select('content wordCount')
    let updated = 0
    let batch = []
    
    for (const article of articles) {
      const newWordCount = article.content.length
      if (article.wordCount !== newWordCount) {
        batch.push({
          updateOne: {
            filter: { _id: article._id },
            update: { $set: { wordCount: newWordCount } }
          }
        })
      }
      
      if (batch.length === 100) {
        await Article.bulkWrite(batch)
        updated += batch.length
        console.log(`已更新 ${updated}/${articles.length} 篇文章`)
        batch = []
      }
    }
    
    if (batch.length > 0) {
      await Article.bulkWrite(batch)
      updated += batch.length
      console.log(`已更新 ${updated}/${articles.length} 篇文章`)
    }
    
    console.log('所有文章字数更新完成')
    process.exit(0)
  } catch (error) {
    console.error('更新字数失败:', error)
    process.exit(1)
  }
}

updateWordCount()