<template>
  <div class="article-form">
    <h2>发布新文章</h2>
    <el-form :model="form" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>
      
      <el-form-item label="内容">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="10"
          placeholder="请输入文章内容"
        />
      </el-form-item>
      
      <el-form-item label="标签">
        <div class="tags-input">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          
          <el-input
            v-if="inputVisible"
            ref="tagInput"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          
          <el-button
            v-else
            class="add-tag-button"
            size="small"
            @click="showInput"
          >
            + 添加标签
          </el-button>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">发布文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '@/api'
import { ElMessage } from 'element-plus'

export default {
  name: 'ArticleForm',
  setup() {
    const router = useRouter()
    const form = reactive({
      title: '',
      content: '',
      tags: []
    })
    
    const inputVisible = ref(false)
    const inputValue = ref('')
    const tagInput = ref(null)

    const showInput = () => {
      inputVisible.value = true
      nextTick(() => {
        tagInput.value.focus()
      })
    }

    const handleInputConfirm = () => {
      if (inputValue.value) {
        if (!form.tags.includes(inputValue.value)) {
          form.tags.push(inputValue.value)
        }
      }
      inputVisible.value = false
      inputValue.value = ''
    }

    const removeTag = (tag) => {
      form.tags = form.tags.filter(t => t !== tag)
    }

    const submitForm = async () => {
      try {
        if (!form.title.trim() || !form.content.trim()) {
          ElMessage.warning('标题和内容不能为空')
          return
        }
        
        await articleApi.create({
          title: form.title.trim(),
          content: form.content.trim(),
          tags: form.tags
        })
        
        ElMessage.success('发布成功')
        router.push('/')
      } catch (error) {
        console.error('发布文章失败:', error)
        ElMessage.error('发布失败')
      }
    }

    return {
      form,
      inputVisible,
      inputValue,
      tagInput,
      showInput,
      handleInputConfirm,
      removeTag,
      submitForm
    }
  }
}
</script>

<style scoped>
.article-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-item {
  margin-right: 0;
}

.tag-input {
  width: 100px;
}

.add-tag-button {
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
}
</style> 