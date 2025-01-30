<template>
  <div class="dashboard">
    <div class="stats-grid">
      <el-card class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="stats-icon"><Document /></el-icon>
            <span>文章总数</span>
          </div>
        </template>
        <div class="stats-value">{{ stats.articleCount || 0 }}</div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="stats-icon"><ChatDotRound /></el-icon>
            <span>日常动态</span>
          </div>
        </template>
        <div class="stats-value">{{ stats.dailyCount || 0 }}</div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="stats-icon"><Collection /></el-icon>
            <span>标签总数</span>
          </div>
        </template>
        <div class="stats-value">{{ stats.tagCount || 0 }}</div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="stats-icon"><Reading /></el-icon>
            <span>总字数</span>
          </div>
        </template>
        <div class="stats-value">{{ stats.totalWords || 0 }}</div>
      </el-card>
    </div>

    <div class="chart-section">
      <!-- 这里可以添加图表等其他内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document, ChatDotRound, Collection, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const stats = ref({
  articleCount: 0,
  dailyCount: 0,
  tagCount: 0,
  totalWords: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await fetch('/api/admin/stats')
    const data = await response.json()
    if (data.code === 0) {
      stats.value = data.data
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 组件挂载时获取数据
onMounted(fetchStats)
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #606266;
}

.stats-icon {
  font-size: 20px;
  color: #409eff;
}

.stats-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  padding: 20px 0;
}

.chart-section {
  margin-top: 30px;
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stats-card {
    min-width: 0;
  }
  
  .stats-value {
    font-size: 28px;
    padding: 16px 0;
  }
  
  .card-header {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 