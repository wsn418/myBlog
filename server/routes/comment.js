const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// 获取评论列表
router.get('/', async (req, res) => {
  try {
    const { targetId, targetType } = req.query;
    
    // 获取所有评论
    const allComments = await Comment.find({ 
      targetId, 
      targetType
    }).lean();  // 使用lean()获取纯JavaScript对象

    // 将评论组织成树形结构
    const commentMap = new Map();
    const rootComments = [];

    // 建立映射关系
    allComments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...comment,
        replies: []
      });
    });

    // 组织评论树
    allComments.forEach(comment => {
      if (comment.parentId) {
        // 这是一条回复
        const parentComment = commentMap.get(comment.parentId.toString());
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      } else {
        // 这是一条主评论
        rootComments.push(commentMap.get(comment._id.toString()));
      }
    });

    // 对每个主评论的回复按时间正序排序
    rootComments.forEach(comment => {
      comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    // 主评论按时间倒序排序
    rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      code: 0,
      data: rootComments
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      code: -1,
      message: '获取评论列表失败',
      error: error.message
    });
  }
});

// 发表评论或回复
router.post('/', async (req, res) => {
  try {
    const { 
      targetId, 
      targetType, 
      parentId,
      replyTo,
      nickname, 
      email, 
      website, 
      content 
    } = req.body;
    
    // 从QQ邮箱获取头像
    let avatar = '';
    if (email.endsWith('@qq.com')) {
      const qq = email.split('@')[0];
      avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
    }
    
    const commentData = {
      targetId,
      targetType,
      nickname,
      email,
      website,
      content,
      avatar: avatar || 'https://example.com/default-avatar.png'
    };

    // 如果是回复，添加回复相关信息
    if (parentId) {
      commentData.parentId = new mongoose.Types.ObjectId(parentId);  // 转换为ObjectId
      if (replyTo) {
        commentData.replyTo = {
          commentId: new mongoose.Types.ObjectId(replyTo.commentId),  // 转换为ObjectId
          nickname: replyTo.nickname
        };
      }
    }
    
    const comment = new Comment(commentData);
    await comment.save();
    
    // 返回完整的评论数据
    const savedComment = await Comment.findById(comment._id)
      .select({
        _id: 1,
        targetId: 1,
        targetType: 1,
        parentId: 1,
        replyTo: 1,
        nickname: 1,
        email: 1,
        website: 1,
        content: 1,
        avatar: 1,
        createdAt: 1
      });
    
    res.json({
      code: 0,
      data: savedComment,
      message: parentId ? '回复发表成功' : '评论发表成功'
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({
      code: -1,
      message: '评论发表失败',
      error: error.message
    });
  }
});

// 删除评论
router.delete('/:id', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    // 查找要删除的评论
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        code: -1,
        message: '评论不存在'
      });
    }

    // 如果是父评论，删除所有回复
    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: commentId });
    }

    // 删除评论本身
    await Comment.findByIdAndDelete(commentId);

    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      code: -1,
      message: '删除评论失败',
      error: error.message
    });
  }
});

module.exports = router; 