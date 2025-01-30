const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  tags: [String],
  wordCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
})

// 在保存前计算字数
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // 移除 HTML 标签，只统计纯文本字数
    const text = this.content.replace(/<[^>]*>/g, '')
    
    // 统计中文字符、英文单词和数字
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
    const words = text.match(/[a-zA-Z]+/g) || []
    const numbers = text.match(/\d+/g) || []
    
    this.wordCount = chineseChars.length + words.length + numbers.length
  }
  next()
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article