<template>
  <div id="app">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <div class="container">
      <div class="layout">
        <aside class="sidebar">
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
          <nav class="nav-menu">
            <router-link to="/daily" class="nav-link">日常</router-link>
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/archive" class="nav-link">归档</router-link>
            <router-link to="/new-article" class="nav-link">发布</router-link>
            <router-link to="/about" class="nav-link">关于</router-link>
          </nav>
          <footer class="footer">
            <p>© My Blog | Since 2024</p>
          </footer>
        </aside>
        <main class="main-content">
          <div class="mobile-header">
            <router-link to="/" class="mobile-logo">Counting Stars💫</router-link>
            <div class="menu-toggle">✕ ☰ Menu</div>
          </div>
          <div class="content-wrapper">
            <router-view></router-view>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isDevelopment: process.env.NODE_ENV === 'development'
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
</style>
