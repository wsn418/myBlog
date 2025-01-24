const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
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