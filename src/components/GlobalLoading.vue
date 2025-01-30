<template>
  <Transition name="fade">
    <div v-show="visible" class="global-loading">
      <div class="loading-spinner">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'
import { ref } from 'vue'

const visible = ref(false)

// 导出方法供外部调用
defineExpose({
  show: () => visible.value = true,
  hide: () => visible.value = false
})
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loading-spinner .el-icon {
  font-size: 32px;
}

.loading-spinner span {
  font-size: 14px;
  color: #606266;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 