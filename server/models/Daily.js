const mongoose = require('mongoose')

const dailySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: v => v.getTime()
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
})

module.exports = mongoose.model('Daily', dailySchema) 