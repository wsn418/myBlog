const mongoose = require('mongoose')

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

module.exports = mongoose.model('Article', articleSchema) 