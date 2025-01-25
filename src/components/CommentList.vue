<template>
  <div class="comment-list">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <template v-else>
      <div v-if="comments.length > 0" class="comments">
        <div v-for="comment in comments" :key="comment._id" class="comment-item">
          <div class="comment-avatar">
            <el-avatar :size="40" :src="comment.avatar" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="nickname">{{ comment.nickname }}</span>
              <span class="time">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <div class="text">{{ comment.content }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-comments">
        暂无评论
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { commentApi } from '../api/index';

export default {
  name: 'CommentList',
  props: {
    targetId: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      required: true,
      validator: value => ['article', 'daily'].includes(value)
    }
  },
  setup(props) {
    const comments = ref([]);
    const loading = ref(false);

    const fetchComments = async () => {
      loading.value = true;
      try {
        const res = await commentApi.getList({
          targetId: props.targetId,
          targetType: props.targetType
        });
        
        if (res.code === 0) {
          comments.value = res.data;
        } else {
          console.error('获取评论失败:', res.message);
        }
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 24) {
        return `${hours}小时前`;
      }
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric'
      });
    };

    // 在组件挂载时获取评论列表
    onMounted(() => {
      fetchComments();
    });

    // 暴露方法给父组件
    return {
      comments,
      loading,
      fetchComments,
      formatTime
    };
  }
};
</script>

<style scoped>
.comment-list {
  margin-top: 20px;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.nickname {
  font-weight: 500;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.text {
  color: #666;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.loading {
  padding: 20px 0;
}
</style> 