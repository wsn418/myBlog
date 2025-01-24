<template>
  <div class="comment-form">
    <div class="form-container">
      <div class="avatar">
        <el-icon v-if="!avatarUrl" class="default-avatar"><UserFilled /></el-icon>
        <img v-else :src="avatarUrl" alt="头像" />
      </div>
      <div class="form-content">
        <div class="input-fields">
          <el-input v-model="nickname" placeholder="必填" class="input-item" required>
            <template #prepend>昵称</template>
          </el-input>
          <el-input v-model="email" placeholder="必填" class="input-item" required @blur="handleEmailBlur">
            <template #prepend>邮箱</template>
          </el-input>
          <el-input v-model="website" placeholder="选填" class="input-item">
            <template #prepend>网址</template>
          </el-input>
        </div>
        
        <div class="editor-wrapper">
          <el-input
            v-model="content"
            type="textarea"
            :rows="4"
            placeholder="说点什么吧..."
            resize="none"
            class="comment-textarea"
          />
          
          <div class="toolbar">
            <div class="left-tools">
              <el-button class="tool-btn emoji-btn" @click="showEmojiPicker = !showEmojiPicker">
                😊
              </el-button>
              <el-upload
                action="/api/upload"    
                :show-file-list="false"
                :on-success="handleImageSuccess"
                accept="image/*"
                class="upload-btn"
              >
                <el-button class="tool-btn">
                  <el-icon class="tool-icon"><PictureFilled /></el-icon>
                </el-button>
              </el-upload>
            </div>
            <div class="right-tools">
              <span class="word-count">{{ content.length }}/500</span>
              <el-button type="primary" class="submit-btn" @click="submitComment">发送</el-button>
            </div>
          </div>
          
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div v-for="emoji in emojiList" :key="emoji" @click="insertEmoji(emoji)" class="emoji-item">
              {{ emoji }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { PictureFilled, UserFilled } from '@element-plus/icons-vue';

export default {
  name: 'CommentForm',
  components: {
    // FaceSmilingFilled,
    PictureFilled,
    UserFilled
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
  emits: ['submit-success'],
  setup(props, { emit }) {
    const nickname = ref('');
    const email = ref('');
    const website = ref('');
    const content = ref('');
    const avatarUrl = ref(''); // 初始化为空字符串
    const showEmojiPicker = ref(false);

    const emojiList = ['😀', '😂', '🤣', '😊', '😍', '🤔', '😎', '😭', '👍', '❤️'];

    // 检查是否为QQ邮箱并获取头像
    const handleEmailBlur = async () => {
      const qqMailRegex = /^[1-9][0-9]{4,}@qq\.com$/;
      if (qqMailRegex.test(email.value)) {
        const qq = email.value.split('@')[0];
        avatarUrl.value = `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
      } else {
        avatarUrl.value = '';
      }
    };

    const insertEmoji = (emoji) => {
      content.value += emoji;
      showEmojiPicker.value = false;
    };

    const handleImageSuccess = (res) => {
      const imageUrl = res.url;
      content.value += `![图片](${imageUrl})`;
    };

    const submitComment = async () => {
      if (!nickname.value || !email.value || !content.value) {
        ElMessage.error('请填写必填项！');
        return;
      }

      if (content.value.length > 500) {
        ElMessage.error('评论内容不能超过500字！');
        return;
      }

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetId: props.targetId,
            targetType: props.targetType,
            nickname: nickname.value,
            email: email.value,
            website: website.value,
            content: content.value,
            avatar: avatarUrl.value
          }),
        });

        if (response.ok) {
          ElMessage.success('评论发送成功！');
          emit('submit-success');
          // 清空表单
          nickname.value = '';
          email.value = '';
          website.value = '';
          content.value = '';
        } else {
          throw new Error('评论发送失败');
        }
      } catch (error) {
        ElMessage.error('评论发送失败，请稍后重试');
      }
    };

    return {
      nickname,
      email,
      website,
      content,
      avatarUrl,
      showEmojiPicker,
      emojiList,
      handleEmailBlur,
      insertEmoji,
      handleImageSuccess,
      submitComment
    };
  }
};
</script>

<style scoped>
.comment-form {
  background: #fff;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.form-container {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  align-items: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.default-avatar {
  font-size: 20px;
  color: #909399;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.form-content {
  flex: 1;
  min-width: 0;
}

.input-fields {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
  flex-wrap: wrap;  /* 添加自动换行 */
}

.input-item {
  flex: 1;
  min-width: 200px;  /* 设置最小宽度，触发换行 */
  margin-bottom: 8px;  /* 换行后的间距 */
}

.input-item :deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  border-radius: 0 4px 4px 0;
  padding-left: 12px;
}

.input-item :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0;
  border-radius: 4px;
}

.input-item :deep(.el-input-group__prepend) {
  /* background-color: transparent;
  border: 1px solid #dcdfe6;
  border-right: none;
  padding: 0 12px; */
  /* color: #606266; */
  /* border-radius: 4px 0 0 4px; */
  color: rgba(0,0,0);
}
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}

.editor-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.comment-textarea {
  margin-bottom: 8px;
}

.comment-textarea :deep(.el-textarea__inner) {
  min-height: 100px !important;
  resize: none;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  border-radius: 4px;
}

.comment-textarea :deep(.el-textarea__wrapper) {
  box-shadow: none;
  padding: 0;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-tools {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 6px;
  height: 28px;
  width: 28px;
  border: none;
  background: transparent;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tool-btn:hover {
  background-color: #f5f7fa;  /* 添加悬停效果 */
  border-radius: 4px;
}

.tool-icon {
  font-size: 16px;
  color: #333;
}

.right-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count {
  font-size: 12px;
  color: #999;
}

.submit-btn {
  height: 28px;
  padding: 0 16px;
}

.emoji-picker {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 200px; /* 添加固定宽度 */
}

.emoji-item {
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background: #f5f7fa;
}

.upload-btn {
  display: inline-block;
}

.upload-btn :deep(.el-upload) {
  display: block;
}

.emoji-btn {
  font-size: 16px;
  line-height: 1;
  padding-top: 4px;
  filter: grayscale(100%);
  color: #333;
}
</style> 