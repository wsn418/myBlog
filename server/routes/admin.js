const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const Daily = require('../models/Daily')

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store')
    // 获取文章统计
    const articleCount = await Article.countDocuments()
    
    // 获取日常动态统计
    const dailyCount = await Daily.countDocuments()
    
    // 获取标签统计
    const articles = await Article.find().select('tags')
    const tagSet = new Set()
    articles.forEach(article => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          if (tag) tagSet.add(tag)
        })
      }
    })
    const tagCount = tagSet.size
    
    // 获取总字数
    const totalWords = await Article.aggregate([
      {
        $group: {
          _id: null,
          total: { 
            $sum: '$wordCount'  // 使用预计算的字数字段
          }
        }
      }
    ])

    // 如果没有文章，返回0
    const wordCount = totalWords[0]?.total || 0
    
    console.log('Stats:', {
      articleCount,
      dailyCount,
      tagCount,
      wordCount
    })

    res.json({
      code: 0,
      data: {
        articleCount,
        dailyCount,
        tagCount,
        totalWords: wordCount
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({
      code: -1,
      message: '获取统计数据失败'
    })
  }
})

// 日常管理相关路由
router.get('/daily', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    
    // 构建查询条件
    const query = {};
    if (keyword) {
      query.content = new RegExp(keyword, 'i'); // 内容模糊搜索
    }

    // 获取总数
    const total = await Daily.countDocuments(query);

    // 获取分页数据
    const list = await Daily.find(query)
      .sort({ createdAt: -1 }) // 按创建时间倒序
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean(); // 转换为普通对象

    // 处理数据，添加图片数量等信息
    const dailyList = list.map(item => ({
      id: item._id,
      content: item.content,
      mood: item.mood,
      weather: item.weather,
      location: item.location,
      imageCount: item.images ? item.images.length : 0,
      images: item.images || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    res.json({
      code: 0,
      data: {
        list: dailyList,
        total
      },
      message: 'success'
    });
  } catch (error) {
    console.error('获取日常列表失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message || '获取日常列表失败'
    });
  }
});

// 创建日常
router.post('/daily', async (req, res) => {
  try {
    const { content, mood, weather, location, images } = req.body;
    
    // 创建新的日常记录
    const daily = new Daily({
      content,
      mood,
      weather,
      location,
      images: images || []
    });

    await daily.save();

    res.json({
      code: 0,
      data: daily,
      message: '创建成功'
    });
  } catch (error) {
    console.error('创建日常失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message || '创建日常失败'
    });
  }
});

// 更新日常
router.put('/daily/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mood, weather, location, images } = req.body;

    const daily = await Daily.findByIdAndUpdate(
      id,
      {
        content,
        mood,
        weather,
        location,
        images: images || [],
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!daily) {
      return res.status(404).json({
        code: -1,
        message: '日常不存在'
      });
    }

    res.json({
      code: 0,
      data: daily,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新日常失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message || '更新日常失败'
    });
  }
});

// 删除日常
router.delete('/daily/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const daily = await Daily.findByIdAndDelete(id);

    if (!daily) {
      return res.status(404).json({
        code: -1,
        message: '日常不存在'
      });
    }

    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除日常失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message || '删除日常失败'
    });
  }
});

// 批量删除日常
router.delete('/daily/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: -1,
        message: '参数错误'
      });
    }

    await Daily.deleteMany({ _id: { $in: ids } });

    res.json({
      code: 0,
      message: '批量删除成功'
    });
  } catch (error) {
    console.error('批量删除日常失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message || '批量删除日常失败'
    });
  }
});

module.exports = router 