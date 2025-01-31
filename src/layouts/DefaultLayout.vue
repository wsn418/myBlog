<template>
  <div class="default-layout">
    <header>
      <!-- 头部内容 -->
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer>
      <!-- 删除以下后台管理入口代码 -->
      <!-- <div class="admin-entry">
        <router-link to="/admin/login">后台管理</router-link>
      </div> -->
    </footer>
  </div>
</template>

<style scoped>
/* 删除相关样式 */
/* .admin-entry {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
} */
</style> 