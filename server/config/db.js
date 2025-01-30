const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/myblog', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 添加错误监听
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // 优雅关闭连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 