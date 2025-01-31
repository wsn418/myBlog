const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件!'), false)
    }
    cb(null, true)
  }
}).single('image')  // 确保这里的字段名与前端一致

// 图片上传接口
router.post('/image', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      console.error('上传错误:', err)
      return res.status(400).json({
        code: -1,
        message: err.message || '上传失败'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        code: -1,
        message: '没有上传文件'
      })
    }

    // 修改返回的URL格式
    const imageUrl = `/uploads/images/${req.file.filename}`
    console.log('上传成功，文件URL:', imageUrl)  // 添加日志
    res.json({
      code: 0,
      data: {
        url: imageUrl
      },
      message: '上传成功'
    })
  })
})

module.exports = router 