const express = require('express')
const router = express.Router()
const Daily = require('../models/Daily')
const mongoose = require('mongoose')

// 获取日常列表
router.get('/', async (req, res) => {
  try {
    const dailyList = await Daily.aggregate([
      {
        $lookup: {
          from: 'comments',
          let: { dailyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetId', { $toString: '$$dailyId' }] },
                    { $eq: ['$targetType', 'daily'] }
                  ]
                }
              }
            }
          ],
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' },
          id: { $toString: '$_id' }
        }
      },
      {
        $project: {
          _id: 1,
          id: 1,
          content: 1,
          nickname: 1,
          email: 1,
          avatar: 1,
          images: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
          commentCount: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ])

    // 格式化日期，添加错误处理
    const formattedList = dailyList.map(item => {
      try {
        const createdAt = item.createdAt ? new Date(item.createdAt) : new Date()
        const updatedAt = item.updatedAt ? new Date(item.updatedAt) : createdAt

        return {
          ...item,
          createdAt: createdAt instanceof Date && !isNaN(createdAt) 
            ? createdAt.toISOString() 
            : new Date().toISOString(),
          updatedAt: updatedAt instanceof Date && !isNaN(updatedAt)
            ? updatedAt.toISOString()
            : new Date().toISOString()
        }
      } catch (err) {
        console.warn('日期格式化错误:', err, 'item:', item)
        return {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    })

    res.json({
      code: 0,
      data: formattedList
    })
  } catch (error) {
    console.error('获取日常列表失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取日常列表失败'
    })
  }
})

// 发布新动态
router.post('/', async (req, res) => {
  try {
    const { content, nickname, email } = req.body
    console.log('Creating new daily with data:', { content, nickname, email })
    
    // 从QQ邮箱获取头像
    let avatar = ''
    if (email && email.endsWith('@qq.com')) {
      const qq = email.split('@')[0]
      avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
    }
    
    const daily = new Daily({
      content,
      nickname,
      email,
      avatar: avatar || 'https://example.com/default-avatar.png'
    })
    
    await daily.save()
    console.log('Daily created successfully:', daily._id)
    
    res.json({
      code: 0,
      data: {
        ...daily.toObject(),
        id: daily._id,
        createdAt: daily.createdAt.toISOString()
      },
      message: '发布成功'
    })
  } catch (error) {
    console.error('发布动态失败:', error)
    res.status(500).json({
      code: -1,
      message: '发布失败',
      error: error.message
    })
  }
})

// 删除动态
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Deleting daily with id:', id)
    
    const result = await Daily.findByIdAndDelete(id)
    if (!result) {
      return res.status(404).json({
        code: -1,
        message: '动态不存在'
      })
    }
    
    console.log('Daily deleted successfully')
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除动态失败:', error)
    res.status(500).json({
      code: -1,
      message: '删除失败',
      error: error.message
    })
  }
})

module.exports = router 