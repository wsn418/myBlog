<template>
  <div class="daily-form">
    <div class="user-info">
      <el-avatar :size="40" src="https://placeholder.com/40" class="user-avatar" />
      <span class="post-time">{{ postTime }}</span>
    </div>
    <div class="form-container">
      <el-form :model="form" class="daily-input-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="昵称" required>
              <el-input v-model="form.nickname" placeholder="必填" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="邮箱" required>
              <el-input v-model="form.email" placeholder="必填" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="网址">
              <el-input v-model="form.website" placeholder="选填" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的想法..."
            :maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <div class="action-buttons">
            <el-button circle>
              <el-icon><Emoji /></el-icon>
            </el-button>
            <el-button circle>
              <el-icon><Picture /></el-icon>
            </el-button>
            <el-button type="primary" class="send-button" @click="submitDaily" :loading="isSubmitting">
              发送
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dailyApi } from '../api'
import { Picture, Emoji } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DailyForm',
  components: {
    Picture,
    Emoji
  },
  setup() {
    const router = useRouter()
    const isSubmitting = ref(false)
    const form = ref({
      nickname: '',
      email: '',
      website: '',
      content: ''
    })

    const postTime = computed(() => {
      const now = new Date()
      return `${now.getHours()}小时前`
    })

    const submitDaily = async () => {
      if (!form.value.content.trim() || !form.value.nickname.trim() || !form.value.email.trim() || isSubmitting.value) return

      isSubmitting.value = true
      try {
        await dailyApi.create({
          content: form.value.content,
          nickname: form.value.nickname,
          email: form.value.email,
          website: form.value.website
        })
        router.push('/daily')
      } catch (error) {
        console.error('发布动态失败:', error)
        ElMessage.error('发布失败，请稍后重试')
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      form,
      isSubmitting,
      submitDaily,
      postTime
    }
  }
}
</script>

<style scoped>
.daily-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar {
  margin-right: 10px;
}

.post-time {
  color: #999;
  font-size: 14px;
}

.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.daily-input-form {
  width: 100%;
}

.form-actions {
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.send-button {
  margin-left: auto;
}

:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-textarea__inner) {
  min-height: 120px !important;
  resize: none;
}
</style> 