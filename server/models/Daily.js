const mongoose = require('mongoose')

// 检查模型是否已经存在
if (mongoose.models.Daily) {
  module.exports = mongoose.models.Daily
} else {
  const dailySchema = new mongoose.Schema({
    content: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      default: ''
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

  // 添加虚拟字段
  dailySchema.virtual('id').get(function() {
    return this._id.toHexString()
  })

  // 更新时自动更新 updatedAt 字段
  dailySchema.pre('save', function(next) {
    if (this.isModified()) {
      this.updatedAt = new Date()
    }
    next()
  })

  const Daily = mongoose.model('Daily', dailySchema)
  module.exports = Daily
}