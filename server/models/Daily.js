const mongoose = require('mongoose')

if (mongoose.models.Daily) {
  module.exports = mongoose.models.Daily
} else {
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
}