module.exports = {
  mongoURI: 'mongodb://localhost:27017/myblog',  // MongoDB 连接字符串
  JWT_SECRET: 'your-jwt-secret-key',  // 确保这个密钥和生成 token 时使用的一致
  jwtExpire: '24h',  // Token 过期时间
  port: process.env.PORT || 3000  // 服务器端口
}; 