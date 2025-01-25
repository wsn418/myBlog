const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');

// 获取评论列表
router.get('/', async (req, res) => {
  try {
    const { targetId, targetType } = req.query;
    
    const comments = await Comment.find({ 
      targetId, 
      targetType 
    }).sort({ createdAt: -1 });
    
    res.json({
      code: 0,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '获取评论列表失败',
      error: error.message
    });
  }
});

// 发表评论
router.post('/', async (req, res) => {
  try {
    const { targetId, targetType, nickname, email, website, content } = req.body;
    
    // 从QQ邮箱获取头像
    let avatar = '';
    if (email.endsWith('@qq.com')) {
      const qq = email.split('@')[0];
      avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
    }
    
    const comment = new Comment({
      targetId,
      targetType,
      nickname,
      email,
      website,
      content,
      avatar: avatar || 'https://example.com/default-avatar.png'
    });
    
    await comment.save();
    
    res.json({
      code: 0,
      data: comment,
      message: '评论发表成功'
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '评论发表失败',
      error: error.message
    });
  }
});

module.exports = router; 