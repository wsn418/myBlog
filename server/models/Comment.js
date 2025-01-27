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
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replyTo: {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    nickname: String
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
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema); 