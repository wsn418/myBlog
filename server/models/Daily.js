const mongoose = require('mongoose')

// 检查模型是否已经存在
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
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      default: 'https://example.com/default-avatar.png'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

  // 添加虚拟字段
  dailySchema.virtual('id').get(function() {
    return this._id.toHexString()
  })

  const Daily = mongoose.model('Daily', dailySchema)
  module.exports = Daily
}