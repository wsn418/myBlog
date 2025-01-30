const mongoose = require('mongoose')

if (mongoose.models.Article) {
  module.exports = mongoose.models.Article
} else {
  const articleSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    wordCount: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    createdAt: {
      type: Date,
      default: Date.now,
      get: v => v.getTime()
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      get: v => v.getTime()
    }
  }, {
    timestamps: true,
    toJSON: { getters: true }
  })

  articleSchema.pre('save', function(next) {
    this.wordCount = this.content.length
    next()
  })

  module.exports = mongoose.model('Article', articleSchema)
}