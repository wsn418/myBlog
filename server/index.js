const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '数据库连接错误:'));
db.once('open', () => {
  console.log('数据库连接成功');
});

// 文章模型
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Article = mongoose.model('Article', articleSchema);

// API路由
// 获取文章列表
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Article.countDocuments();
    const hasNextPage = total > skip + articles.length;

    res.json({
      articles,
      hasNextPage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单篇文章
app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新文章
app.post('/api/articles', async (req, res) => {
  try {
    const article = new Article({
      title: req.body.title,
      content: req.body.content
    });
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;  // 修改为3000端口

// 连接数据库并启动服务器
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('数据库连接成功');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer(); 