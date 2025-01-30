<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <el-header class="admin-header">
      <div class="header-left">
        <el-icon class="menu-toggle" @click="toggleMenu"><Menu /></el-icon>
        <h1 class="site-title">
          <span class="title-text">Counting Stars</span>
          <span class="subtitle">后台管理系统</span>
        </h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="user-dropdown">
            <el-avatar :size="28" :src="defaultAvatar" />
            <span class="username">{{ userInfo?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword">
                <el-icon><Key /></el-icon>修改密码
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="main-container">
      <!-- 左侧菜单 -->
      <el-aside 
        :class="['admin-aside', { 'menu-collapsed': isMenuCollapsed }]"
        :width="isMenuCollapsed ? '64px' : '220px'"
      >
        <el-menu
          :router="true"
          :default-active="route.path"
          class="admin-menu"
          :collapse="isMenuCollapsed"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataBoard /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          <el-menu-item index="/admin/articles">
            <el-icon><Document /></el-icon>
            <template #title>文章管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/daily">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>日常管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <el-icon><Collection /></el-icon>
            <template #title>标签管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main :class="['admin-main', { 'main-expanded': isMenuCollapsed }]">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/api'
import { ElMessage } from 'element-plus'
import {
  Menu,
  DataBoard,
  Document,
  ChatDotRound,
  Collection,
  ArrowDown,
  Key,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const defaultAvatar = 'https://example.com/default-avatar.png'
const isMenuCollapsed = ref(window.innerWidth <= 768)

const userInfo = computed(() => {
  const token = localStorage.getItem('token')
  return token ? JSON.parse(atob(token.split('.')[1])) : null
})

const toggleMenu = () => {
  isMenuCollapsed.value = !isMenuCollapsed.value
}

const handleCommand = (command) => {
  switch (command) {
    case 'changePassword':
      router.push('/admin/change-password')
      break
    case 'logout':
      logout()
      break
  }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    isMenuCollapsed.value = true
  }
})

// 检查登录状态
const checkAuth = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/admin/login')
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f6f8fa;
}

.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-toggle:hover {
  background-color: #f5f7fa;
}

.site-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 20px;
  color: #1a1a1a;
  font-family: var(--logo-font);
}

.subtitle {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

@media screen and (max-width: 768px) {
  .subtitle {
    display: none;
  }
  
  .title-text {
    font-size: 18px;
  }
  
  .username {
    display: none;
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-container {
  padding-top: 60px;
  display: flex;
}

.admin-aside {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  background: #fff;
  box-shadow: 1px 0 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  transition: all 0.3s;
}

.menu-collapsed {
  width: 64px !important;
}

.admin-menu {
  border-right: none;
  padding-top: 8px;
}

.admin-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  padding: 0 16px;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background: #ecf5ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.admin-main {
  margin-left: 220px;
  padding: 20px;
  min-height: calc(100vh - 60px);
  transition: all 0.3s;
}

.main-expanded {
  margin-left: 64px;
}

@media screen and (max-width: 768px) {
  .admin-main {
    margin-left: 64px;
    padding: 16px;
  }
  
  .admin-menu :deep(.el-menu-item) {
    padding: 0 20px;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 