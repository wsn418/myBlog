const mongoose = require('mongoose')

async function testConnection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/myblog')
    console.log('数据库连接测试成功')
    
    // 测试创建集合
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('现有集合:', collections.map(c => c.name))
    
  } catch (error) {
    console.error('数据库连接测试失败:', error)
  } finally {
    await mongoose.disconnect()
  }
}

testConnection() 