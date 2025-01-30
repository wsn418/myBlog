<template>
  <div class="article-detail">
    <template v-if="article">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <span class="publish-time">发布时间：{{ formatDate(article.createdAt) }}</span>
        <span class="word-count">字数：{{ article.wordCount }}</span>
      </div>
      <div class="article-content">
        <MdPreview :modelValue="article.content" :preview-theme="'github'" />
      </div>
      
      <!-- 简化标签显示区域 -->
      <div class="article-tags" v-if="article.tags?.length">
        <el-tag 
          v-for="tag in article.tags" 
          :key="tag"
          size="small"
          class="tag-item"
          @click="handleTagClick(tag)"
        >
          #{{ tag }}
        </el-tag>
      </div>
      
      <!-- 评论区域 -->
      <div class="article-comments">
        <h3>评论</h3>
        <CommentForm 
          :targetId="article.id"
          targetType="article"
          @submit-success="fetchComments"
        />
        <CommentList 
          :targetId="article.id"
          targetType="article"
          ref="commentList"
        />
      </div>
    </template>
    <el-skeleton v-else :rows="10" animated />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { articleApi } from '@/api'
import CommentForm from './CommentForm.vue'
import CommentList from './CommentList.vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

export default {
  name: 'ArticleDetail',
  components: {
    CommentForm,
    CommentList,
    MdPreview
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const article = ref(null)
    const commentList = ref(null)

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('zh-CN')
    }

    const handleTagClick = (tag) => {
      router.push({
        path: '/archive',
        query: { tag }
      })
    }

    const fetchArticle = async () => {
      try {
        const response = await articleApi.getDetail(route.params.id)
        if (response.code === 0 && response.data) {
          article.value = response.data
        } else {
          throw new Error(response.message || '获取文章失败')
        }
      } catch (error) {
        console.error('获取文章详情失败:', error)
      }
    }

    const fetchComments = () => {
      if (commentList.value) {
        commentList.value.fetchComments()
      }
    }

    onMounted(() => {
      fetchArticle()
    })

    return {
      article,
      commentList,
      formatDate,
      handleTagClick,
      fetchComments
    }
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-title {
  font-size: 28px;
  margin-bottom: 20px;
}

.article-meta {
  color: #666;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}

.article-content {
  line-height: 1.8;
  margin-bottom: 40px;
}

.article-tags {
  margin: 30px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.article-comments {
  margin-top: 40px;
}

.article-comments h3 {
  margin-bottom: 20px;
  font-weight: normal;
  color: #333;
  margin-left: -2em;
}

/* 添加 Markdown 预览样式 */
:deep(.markdown-body) {
  background-color: transparent;
  font-size: 16px !important;
}

:deep(.md-editor-preview) {
  padding: 0 !important;
}

:deep(.markdown-body h1) {
  font-size: 2em !important;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
  margin-bottom: 16px;
}

:deep(.markdown-body h2) {
  font-size: 1.5em !important;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
  margin-bottom: 16px;
}

:deep(.markdown-body h3) {
  font-size: 1.25em !important;
}

:deep(.markdown-body h4) {
  font-size: 1em !important;
}

:deep(.markdown-body p) {
  font-size: 16px !important;
  line-height: 1.8;
  margin-bottom: 16px;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  font-size: 16px !important;
  padding-left: 2em;
  margin-bottom: 16px;
}

:deep(.markdown-body pre) {
  margin: 16px 0;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 14px !important;
}

:deep(.markdown-body code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  background-color: rgba(27,31,35,0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 14px !important;
}

:deep(.markdown-body blockquote) {
  margin: 16px 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}
</style> 