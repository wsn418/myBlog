<template>
  <div class="comment-list">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <template v-else>
      <div v-if="comments.length > 0" class="comments">
        <div v-for="comment in comments" :key="comment._id" class="comment-item">
          <div class="comment-header">
            <el-avatar :size="40" :src="comment.avatar" />
            <div class="comment-info">
              <div class="nickname">{{ comment.nickname }}</div>
              <div class="time">{{ formatTime(comment.createdAt) }}</div>
            </div>
            <div class="comment-actions">
              <el-button 
                type="text" 
                @click="showReplyForm(comment._id)"
              >
                回复
              </el-button>
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>

          <comment-form
            v-if="activeReplyId === comment._id && !activeReplyParentId"
            :target-id="targetId"
            :target-type="targetType"
            :parent-id="comment._id"
            :reply-to="activeReplyTo"
            @submit-success="handleReplySuccess"
            @cancel-reply="cancelReply"
          />

          <div v-if="comment.replies?.length" class="reply-list">
            <div v-for="reply in comment.replies" :key="reply._id" class="reply-item">
              <div class="reply-header">
                <el-avatar :size="32" :src="reply.avatar" />
                <div class="reply-info">
                  <div class="nickname">{{ reply.nickname }}</div>
                  <div class="time">{{ formatTime(reply.createdAt) }}</div>
                </div>
              </div>
              <div class="reply-content">
                <template v-if="reply.parentId && reply.replyTo">
                  <span class="reply-at">@{{ reply.replyTo.nickname }}</span>
                  {{ reply.content }}
                </template>
                <template v-else>
                  {{ reply.content }}
                </template>
              </div>
              <div class="reply-actions">
                <el-button 
                  type="text" 
                  @click="showReplyForm(comment._id, reply)"
                >
                  回复
                </el-button>
              </div>

              <comment-form
                v-if="activeReplyId === comment._id && activeReplyParentId === reply._id"
                :target-id="targetId"
                :target-type="targetType"
                :parent-id="comment._id"
                :reply-to="activeReplyTo"
                @submit-success="handleReplySuccess"
                @cancel-reply="cancelReply"
                class="nested-reply-form"
              />
            </div>
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
import CommentForm from './CommentForm.vue';
import { formatTime } from '../utils/time';

export default {
  name: 'CommentList',
  components: {
    CommentForm
  },
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
    const activeReplyId = ref(null);
    const activeReplyParentId = ref(null);
    const activeReplyTo = ref(null);

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

    const showReplyForm = (commentId, reply = null) => {
      activeReplyId.value = commentId;
      if (reply) {
        activeReplyParentId.value = reply._id;
        activeReplyTo.value = {
          nickname: reply.nickname,
          commentId: reply._id
        };
      } else {
        activeReplyParentId.value = null;
        activeReplyTo.value = {
          nickname: comments.value.find(c => c._id === commentId)?.nickname,
          commentId: commentId
        };
      }
    };

    const cancelReply = () => {
      activeReplyId.value = null;
      activeReplyParentId.value = null;
      activeReplyTo.value = null;
    };

    const handleReplySuccess = () => {
      cancelReply();
      fetchComments();
    };

    // 在组件挂载时获取评论列表
    onMounted(() => {
      fetchComments();
    });

    // 暴露方法给父组件
    return {
      comments,
      loading,
      activeReplyId,
      activeReplyParentId,
      activeReplyTo,
      fetchComments,
      showReplyForm,
      cancelReply,
      handleReplySuccess,
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
  gap: 24px;
}

.comment-item {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.comment-header, .reply-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-info, .reply-info {
  flex: 1;
}

.nickname {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.comment-content, .reply-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin: 8px 0;
  word-break: break-all;
  margin-left: 52px;
}

.comment-actions, .reply-actions {
  margin-top: 8px;
  margin-left: 52px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-button--text) {
  padding: 0;
  height: auto;
  font-size: 12px;
  color: #1890ff;
  margin-right: 8px;
}

:deep(.el-button--text:hover) {
  color: #40a9ff;
}

.reply-list {
  margin-top: 16px;
  margin-left: 52px;
  padding-left: 24px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.nested-reply-form {
  margin-top: 12px;
  margin-left: 32px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.reply-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.reply-info {
  flex: 1;
}

.reply-content {
  margin-left: 44px;
}

.reply-at {
  color: #1890ff;
  margin-right: 4px;
  font-weight: 500;
}

.reply-actions {
  margin-left: 44px;
  margin-right: 8px;
}

.loading, .no-comments {
  text-align: center;
  padding: 24px;
  color: #999;
}

.delete-btn {
  color: #ff4d4f;
  margin-left: 8px;
}

.delete-btn:hover {
  color: #ff7875;
}
</style> 