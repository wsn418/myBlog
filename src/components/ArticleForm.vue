<template>
  <div class="article-form">
    <h2>发布新文章</h2>
    <form @submit.prevent="submitArticle">
      <div class="form-group">
        <label for="title">文章标题</label>
        <input
          type="text"
          id="title"
          v-model="article.title"
          required
          placeholder="请输入文章标题"
        >
      </div>
      <div class="form-group">
        <label for="content">文章内容</label>
        <textarea
          id="content"
          v-model="article.content"
          required
          placeholder="请输入文章内容"
          rows="10"
        ></textarea>
      </div>
      <button type="submit" :disabled="submitting">
        {{ submitting ? '发布中...' : '发布文章' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '../api'

export default {
  name: 'ArticleForm',
  setup() {
    const router = useRouter()
    const article = ref({
      title: '',
      content: ''
    })
    const submitting = ref(false)

    const submitArticle = async () => {
      if (!article.value.title.trim() || !article.value.content.trim()) return
      
      submitting.value = true
      try {
        await articleApi.create(article.value)
        router.push('/')
      } catch (error) {
        console.error('发布文章失败:', error)
        alert('发布失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    return {
      article,
      submitting,
      submitArticle
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

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style> 