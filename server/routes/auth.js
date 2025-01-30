const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// 登录接口
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { username, password } = req.body;

    // 输入验证
    if (!username || !password) {
      return res.status(400).json({
        code: -1,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({
        code: -1,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch ? 'yes' : 'no');

    if (!isMatch) {
      return res.status(401).json({
        code: -1,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        username: user.username
      },
      'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Generated token:', token);

    // 返回用户信息和token
    res.json({
      code: 0,
      data: {
        token,
        userInfo: {
          id: user._id,
          username: user.username,
          role: user.role,
          lastLogin: user.lastLogin
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取当前用户信息
router.get('/user/info', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid auth header format');
      return res.status(401).json({
        code: -1,
        message: '未授权或 token 格式错误'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token found');
      return res.status(401).json({
        code: -1,
        message: 'token 不能为空'
      });
    }

    try {
      const decoded = jwt.verify(token, 'your-jwt-secret-key');
      console.log('Decoded token:', decoded);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({
          code: -1,
          message: '用户不存在'
        });
      }

      res.json({
        code: 0,
        data: {
          id: user._id,
          username: user.username,
          role: user.role,
          lastLogin: user.lastLogin
        }
      });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        code: -1,
        message: 'token 无效或已过期',
        error: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 修改密码
router.put('/user/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: -1,
        message: '未授权'
      });
    }

    const decoded = jwt.verify(token, 'your-jwt-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        code: -1,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        code: -1,
        message: '原密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      code: 0,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 