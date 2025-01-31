<template>
  <div class="daily-list">
    <div class="daily-items">
      <div v-if="isLoading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else>
        <div v-for="item in dailyItems" :key="item.id" class="daily-item">
          <div class="daily-header">
            <el-avatar :size="40" :src="item.avatar || 'https://placeholder.com/40'" />
            <div class="daily-info">
              <div class="daily-author">{{ item.nickname }}</div>
              <div class="daily-time">{{ formatTime(item.createdAt) }}</div>
            </div>
          </div>
          <div class="daily-content">{{ item.content }}</div>
          
          <!-- 添加图片展示区域 -->
          <div v-if="item.images && item.images.length" class="daily-images">
            <el-image
              v-for="(image, index) in item.images"
              :key="index"
              :src="getImageUrl(image)"
              :preview-src-list="getPreviewList(item.images)"
              :initial-index="index"
              preview-teleported
              :hide-on-click-modal="false"
              fit="cover"
              class="daily-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="action-icons">
            <el-button link class="action-btn" @click="toggleComments(item)">
              <el-icon><ChatDotRound /></el-icon>
              <span v-if="item.commentCount" class="comment-badge">{{ item.commentCount }}</span>
            </el-button>
          </div>
          <div class="daily-footer">
            <div v-show="item.showComments" class="comment-section">
              <div class="comment-container">
                <div class="comment-wrapper">
                  <CommentForm 
                    :targetId="item._id"
                    targetType="daily"
                    @submit-success="() => refreshComments(item)"
                  />
                  <CommentList 
                    :targetId="item._id"
                    targetType="daily"
                    :ref="el => { if (el) commentLists[item._id] = el }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="dailyItems.length === 0" class="no-data">
          <el-empty description="暂无动态" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { dailyApi } from '../api'
import { ChatDotRound, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'
import { formatTime } from '../utils/time'

export default {
  name: 'DailyList',
  components: {
    ChatDotRound,
    Picture,
    CommentForm,
    CommentList
  },
  setup() {
    const dailyItems = ref([])
    const isLoading = ref(true)
    const commentLists = reactive({})
    const currentOpenCommentId = ref(null)

    const fetchDailyItems = async () => {
      try {
        isLoading.value = true
        const response = await dailyApi.getList()
        if (response && response.code === 0 && Array.isArray(response.data)) {
          dailyItems.value = response.data.map(item => ({
            ...item,
            showComments: false
          }))
        }
      } catch (error) {
        console.error('获取动态列表失败:', error)
        ElMessage.error(error.message || '获取动态列表失败')
      } finally {
        isLoading.value = false
      }
    }

    const toggleComments = (item) => {
      if (currentOpenCommentId.value === item._id) {
        currentOpenCommentId.value = null
        item.showComments = false
      } else {
        if (currentOpenCommentId.value) {
          const previousItem = dailyItems.value.find(i => i._id === currentOpenCommentId.value)
          if (previousItem) {
            previousItem.showComments = false
          }
        }
        currentOpenCommentId.value = item._id
        item.showComments = true
      }
    }

    const refreshComments = async (item) => {
      const commentList = commentLists[item._id]
      if (commentList) {
        await commentList.fetchComments()
      }
    }

    // 处理预览图片列表
    const getPreviewList = (images) => {
      if (!images || !Array.isArray(images)) return []
      return images.map(img => getImageUrl(img))
    }

    // 图片URL处理函数
    const getImageUrl = (url) => {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      return `${window.location.origin}${url}`
    }

    onMounted(() => {
      fetchDailyItems()
    })

    return {
      dailyItems,
      isLoading,
      formatTime,
      toggleComments,
      refreshComments,
      commentLists,
      currentOpenCommentId,
      getImageUrl,
      getPreviewList
    }
  }
}
</script>

<style scoped>
.daily-list {
  max-width: 630px;
  width: 100%;
  /* min-width: 80%; */
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.daily-items {
  width: 100%;
}

.daily-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.daily-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.daily-info {
  margin-left: 12px;
  flex-grow: 1;
}

.daily-author {
  font-weight: 500;
  font-size: 16px;
  color: #333;
}

.daily-time {
  font-size: 14px;
  color: #999;
  margin-top: 2px;
}

.daily-content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
  color: #333;
  margin-left: 52px;
}

.action-icons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.action-btn {
  position: relative;
  font-size: 18px;
  color: #666;
  padding: 0;
  height: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn:hover {
  color: var(--el-color-primary);
}

.comment-badge {
  position: relative;
  top: 0;
  right: 0;
  background: none;
  color: #999;
  font-size: 14px;
  padding: 0;
  height: auto;
  line-height: normal;
  min-width: auto;
  font-weight: normal;
}

.action-btn:hover .comment-badge {
  color: var(--el-color-primary);
}

.comment-section {
  width: 80%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  width: calc(100% + 30px);
  margin-left: -15px;
  margin-right: -15px;
}

.comment-container {
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.comment-wrapper {
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.loading {
  padding: 20px;
}

.daily-images {
  margin: 12px 0;
  margin-left: 52px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  max-width: 100%;
}

.daily-image {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.daily-image:hover {
  transform: scale(1.02);
}

.daily-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.image-error .el-icon {
  font-size: 20px;
}

/* 添加预览图片相关样式 */
:deep(.el-image-viewer__wrapper) {
  z-index: 2100; /* 确保预览层级足够高 */
}

:deep(.el-image-viewer__close) {
  color: #fff;
}

:deep(.el-image-viewer__actions) {
  opacity: 1;
}

:deep(.el-image-viewer__canvas) {
  user-select: none;
}

:deep(.el-image-viewer__img) {
  background-color: transparent;
}
</style> 