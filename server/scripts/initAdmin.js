const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

async function initAdmin() {
  try {
    console.log('正在连接数据库...');
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('数据库连接成功');
    
    // 检查是否已存在管理员账户
    const adminExists = await User.findOne({ role: 'super_admin' });
    
    if (!adminExists) {
      // 创建超级管理员账户
      await User.create({
        username: 'wsn418',
        password: 'nn584878',
        role: 'super_admin'
      });
      
      console.log('超级管理员账户创建成功！');
      console.log('用户名: wsn418');
      console.log('密码: nn584878');
    } else {
      // 如果已存在，则更新账户信息
      await User.findOneAndUpdate(
        { role: 'super_admin' },
        {
          username: 'wsn418',
          password: 'nn584878'
        },
        { new: true }
      );
      console.log('超级管理员账户已更新');
      console.log('用户名: wsn418');
      console.log('密码: nn584878');
    }
  } catch (error) {
    console.error('初始化管理员账户失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

initAdmin(); 