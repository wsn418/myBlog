const mongoose = require('mongoose')

const dailySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
})

module.exports = mongoose.model('Daily', dailySchema) 