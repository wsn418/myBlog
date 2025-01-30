const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: -1,
        message: '未授权或 token 格式错误'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'your-jwt-secret-key');
    
    // 将解码后的用户信息添加到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      code: -1,
      message: 'token 无效或已过期'
    });
  }
};

module.exports = authMiddleware; 