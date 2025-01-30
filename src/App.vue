<template>
  <div v-if="isInitializing" class="initial-loading">
    <div class="loading-content">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
  <template v-else>
    <!-- 根据路由判断使用哪个布局 -->
    <div v-if="isAdminRoute" class="admin-container">
      <router-view></router-view>
    </div>
    <div v-else class="app-container">
      <nav class="nav-menu">
        <div class="site-info">
          <router-link to="/" class="logo">
            Counting<br>
            Stars💫
          </router-link>
          <p class="slogan">
            🌩️🌩️🌩️莫思身外无穷事，<br>
            且尽生前有限杯。
          </p>
        </div>
        <router-link to="/daily" class="nav-link">日常</router-link>
        <!-- <router-link to="/" class="nav-link">首页</router-link> -->
        <router-link to="/archive" class="nav-link">归档</router-link>
        <!-- <router-link to="/new-article" class="nav-link">发布</router-link> -->
        <router-link to="/about" class="nav-link">关于</router-link>
        <footer class="footer">
          <p>© My Blog | Since 2024</p>
        </footer>
      </nav>
      
      <main class="main-content">
        <div class="mobile-header">
          <router-link to="/" class="mobile-logo">Counting Stars💫</router-link>
          <div class="menu-toggle">✕ ☰ Menu</div>
        </div>
        <router-view></router-view>
      </main>
      <el-button
        class="admin-entry"
        type="text"
        @click="goToAdmin"
      >
        后台管理
      </el-button>
    </div>
  </template>
  <GlobalLoading ref="loadingRef" />
</template>

<script>
import { computed, ref, provide, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlobalLoading from '@/components/GlobalLoading.vue'
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    GlobalLoading,
    Loading
  },
  data() {
    return {
      isDevelopment: process.env.NODE_ENV === 'development'
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loadingRef = ref(null)
    const isInitializing = ref(true)

    const isAdminRoute = computed(() => route.path.startsWith('/admin'))

    // 提供全局加载方法
    provide('globalLoading', {
      show: () => loadingRef.value?.show(),
      hide: () => loadingRef.value?.hide()
    })

    const goToAdmin = () => {
      router.push('/admin')
    }

    // 初始化检查
    onMounted(() => {
      const token = localStorage.getItem('token')
      if (isAdminRoute.value && !token && route.path !== '/admin/login') {
        router.push('/admin/login')
      }
      // 延迟一小段时间再隐藏加载状态，确保路由已经准备好
      setTimeout(() => {
        isInitializing.value = false
      }, 100)
    })

    return {
      isAdminRoute,
      goToAdmin,
      loadingRef,
      isInitializing
    }
  }
}
</script>

<style>
/* 字体引入 */
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
@import url('//cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css');

/* 全局字体设置 */
:root {
  --main-font: 'LXGW WenKai Screen', 'Noto Serif SC', serif;
  --logo-font: 'Quicksand', sans-serif;
  /* --font-serif: "Noto Serif SC", "Source Han Serif SC", serif; */
  --font-sans: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --sidebar-width: 300px;
  --content-max-width: 650px;
  --total-max-width: 1200px;
  --bg-color: rgb(241, 236, 229);
  --dot-color: rgba(0, 0, 0, 0.08);
  --text-primary: rgb(0, 0, 0);
  --text-secondary: rgba(0, 0, 0, 0.85);
  --text-tertiary: rgba(0, 0, 0, 0.65);
}

/* 确保正文使用霞鹜文楷屏幕版 */
#app {
  font-family: var(--main-font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: var(--bg-color);
  background-image: 
    radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -12px -12px;
  background-attachment: fixed;
}

/* 确保中文标题使用思源宋体 */
h1, h2, h3, .slogan {
  font-family: var(--font-serif);
}

/* logo样式 */
.logo, .mobile-logo {
  font-family: var(--logo-font) !important;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  text-decoration: none;
  margin-bottom: 20px;
  display: block;
  line-height: 1.2;  /* 减小行高使两行更紧凑 */
}

.logo {
  font-size: 2.4rem;
  text-align: right;
}

.mobile-logo {
  font-size: 1.8rem;  /* 移动端稍微小一点 */
}

/* 英文文本使用 Quicksand */
.english,
*[lang="en"] {
  font-family: 'Quicksand', sans-serif !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

p {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  unicode-bidi: isolate;
}

html, body {
  min-height: 100vh;
}

body {
  line-height: 1.6;
  color: var(--text-primary);
  font-size: 16px;
  min-height: 100vh;
}

.container {
  max-width: var(--total-max-width);
  margin: 0 auto;
  padding: 0 20px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.sidebar {
  width: var(--sidebar-width);
  padding: 40px;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 2;
}

.site-info {
  margin-bottom: 40px;
  text-align: right;
}

.slogan {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-top: 20px;
  font-style: italic;
  text-align: right;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
  padding: 3px 0;
}

.nav-link:hover {
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: calc(var(--total-max-width) - var(--sidebar-width));
  position: relative;
  z-index: 2;
}

.content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
}

.footer {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin-top: auto;
}

.mobile-header {
  display: none;
}

@media (max-width: 1240px) {
  .container {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-content {
    max-width: 100%;
  }

  .content-wrapper {
    padding: 20px;
  }

  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 2;
  }

  .menu-toggle {
    cursor: pointer;
    color: var(--text-secondary);
  }
}

a {
  color: var(--text-primary);
  text-decoration: none;
  padding-bottom: 2px;
}

button {
  cursor: pointer;
}

.font-test {
  padding: 20px;
  margin: 20px;
  border: 1px solid #ccc;
}

/* 字体测试样式 */
.font-test h1 {
  /* 这里可以快速切换不同字体进行测试 */
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-2/AlibabaPuHuiTi-2-55-Regular.otf') format('opentype');
}

/* 专门为英文设置字体 */
p:lang(en), 
.english {
  font-family: 'Quicksand', var(--main-font);
}

.app-container {
  display: flex;
  min-height: 100vh;
  max-width: 1400px;  /* 限制最大宽度 */
  margin: 0 auto;     /* 居中显示 */
}

.nav-menu {
  width: 40%;        /* 导航栏占 40% */
  max-width: 400px;  /* 限制最大宽度 */
  padding: 40px;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;    /* 防止导航栏被压缩 */
}

.main-content {
  flex: 1;           /* 主内容区域占剩余空间 */
  min-width: 0;      /* 防止内容溢出 */
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  display: none;
}

@media screen and (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .nav-menu {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 20px;
    position: static;
  }

  .main-content {
    padding: 20px;
  }

  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.admin-entry {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

/* 后台布局样式 */
.admin-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.initial-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-content .el-icon {
  font-size: 32px;
  color: #409eff;
}

.loading-content span {
  font-size: 14px;
  color: #606266;
}
</style>
