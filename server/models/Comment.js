const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  targetId: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['article', 'daily']
  },
  nickname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  website: String,
  content: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'https://example.com/default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema); 