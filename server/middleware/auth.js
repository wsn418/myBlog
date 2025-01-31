const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: -1,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({
      code: -1,
      message: '认证失败，请重新登录',
      error: error.message,
      type: error.name
    });
  }
};

module.exports = auth; 