<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">
        <h1>Counting Stars</h1>
        <p>后台管理系统</p>
      </div>
      <el-card class="login-card" shadow="never">
        <form @submit.prevent="handleLogin" autocomplete="on">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            label-position="top"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username"
                placeholder="用户名"
                name="username"
                autocomplete="username"
                clearable
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                name="password"
                autocomplete="current-password"
                show-password
                clearable
                :prefix-icon="Lock"
                size="large"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="submit"
                :loading="loading"
                class="login-button"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </form>
      </el-card>
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} Counting Stars. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

// 添加组件名称定义
defineOptions({
  name: 'AdminLoginPage'
})

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const response = await login(loginForm)
    console.log('Login successful:', response)
    
    if (response.code === 0 && response.data.token) {
      // 保存 token
      localStorage.setItem('token', response.data.token)
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      throw new Error(response.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: 
    radial-gradient(#e5e7eb 1px, transparent 1px),
    radial-gradient(#e5e7eb 1px, transparent 1px);
  background-position: 0 0, 25px 25px;
  background-size: 50px 50px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 40px;
}

.login-title h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
  font-family: var(--logo-font);
}

.login-title p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.login-card :deep(.el-card__body) {
  padding: 30px;
}

.login-card :deep(.el-form-item__label) {
  padding-bottom: 8px;
}

.login-card :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 4px;
  margin-top: 10px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: #909399;
  font-size: 14px;
}

@media screen and (max-width: 480px) {
  .login-box {
    padding: 20px;
  }
  
  .login-title h1 {
    font-size: 24px;
  }
  
  .login-title p {
    font-size: 14px;
  }
  
  .login-card :deep(.el-card__body) {
    padding: 20px;
  }
}

/* 添加动画效果 */
.login-box {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 