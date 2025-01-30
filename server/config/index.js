module.exports = {
  mongoURI: 'mongodb://localhost:27017/myblog',  // MongoDB 连接字符串
  jwtSecret: 'your-jwt-secret-key',  // JWT 密钥
  jwtExpire: '24h',  // Token 过期时间
  port: process.env.PORT || 3000  // 服务器端口
}; 