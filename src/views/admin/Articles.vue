<template>
  <div class="articles-page">
    <div class="page-header">
      <h2>文章管理</h2>
      <el-button type="primary" @click="handleCreate">
        写文章
      </el-button>
    </div>

    <!-- 文章列表 -->
    <el-table
      v-loading="loading"
      :data="articles"
      style="width: 100%"
    >
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <router-link 
            :to="`/article/${row._id || row.id}`"
            class="article-title"
            target="_blank"
          >
            {{ row.title }}
          </router-link>
        </template>
      </el-table-column>
      
      <el-table-column prop="tags" label="标签" width="200">
        <template #default="{ row }">
          <el-tag 
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="wordCount" label="字数" width="100" />
      
      <el-table-column prop="createdAt" label="发布时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row.id)">
            编辑
          </el-button>
          <el-button type="primary" link @click="handleComments(row)">
            评论管理
          </el-button>
          <el-button type="danger" link @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 评论管理对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="`评论管理 - ${currentArticle?.title}`"
      width="70%"
    >
      <el-table
        :data="comments"
        v-loading="commentsLoading"
        row-key="_id"
      >
        <el-table-column prop="nickname" label="评论者" width="120" />
        <el-table-column label="评论内容">
          <template #default="{ row }">
            <div :style="{ paddingLeft: row.parentId ? '40px' : '0' }">
              <span v-if="row.parentId" class="reply-prefix">
                回复 @{{ row.replyTo?.nickname }}：
              </span>
              {{ row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="评论时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="danger" 
              link
              @click="handleDeleteComment(row._id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi, commentApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/time'

export default {
  name: 'ArticlesPage',
  setup() {
    const router = useRouter()
    const articles = ref([])
    const loading = ref(false)

    // 评论管理相关
    const commentDialogVisible = ref(false)
    const comments = ref([])
    const commentsLoading = ref(false)
    const currentArticle = ref(null)

    // 获取文章列表
    const fetchArticles = async () => {
      try {
        loading.value = true
        const response = await articleApi.getList()
        if (response.code === 0) {
          articles.value = response.data.map(article => ({
            ...article,
            _id: article._id || article.id
          }))
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('获取文章列表失败:', error)
        ElMessage.error('获取文章列表失败')
      } finally {
        loading.value = false
      }
    }

    // 创建文章
    const handleCreate = () => {
      router.push('/admin/articles/create')
    }

    // 编辑文章
    const handleEdit = (articleId) => {
      if (!articleId) {
        ElMessage.error('无效的文章ID')
        return
      }
      router.push(`/admin/articles/edit/${articleId}`)
    }

    // 删除文章
    const handleDelete = async (articleId) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这篇文章吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await articleApi.delete(articleId)
        if (response.code === 0) {
          ElMessage.success('删除成功')
          await fetchArticles()
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除文章失败:', error)
          ElMessage.error('删除文章失败')
        }
      }
    }

    // 评论管理
    const handleComments = async (article) => {
      currentArticle.value = article
      commentDialogVisible.value = true
      await fetchComments(article.id)
    }

    const fetchComments = async (articleId) => {
      commentsLoading.value = true
      try {
        const res = await commentApi.getList({
          targetId: articleId,
          targetType: 'article'
        })
        if (res.code === 0) {
          // 将评论列表扁平化，包含父评论和子评论
          const flatComments = []
          res.data.forEach(comment => {
            flatComments.push(comment)
            if (comment.replies?.length) {
              flatComments.push(...comment.replies)
            }
          })
          comments.value = flatComments
        }
      } catch (error) {
        console.error('获取评论列表失败:', error)
        ElMessage.error('获取评论列表失败')
      } finally {
        commentsLoading.value = false
      }
    }

    const handleDeleteComment = async (commentId) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这条评论吗？如果是父评论，其下的所有回复也会被删除。',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await commentApi.delete(commentId)
        ElMessage.success('删除成功')
        await fetchComments(currentArticle.value.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除评论失败:', error)
          ElMessage.error('删除失败，请重试')
        }
      }
    }

    onMounted(() => {
      fetchArticles()
    })

    return {
      articles,
      loading,
      handleCreate,
      handleEdit,
      handleDelete,
      commentDialogVisible,
      comments,
      commentsLoading,
      currentArticle,
      handleComments,
      handleDeleteComment,
      formatTime
    }
  }
}
</script>

<style scoped>
.articles-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-weight: 500;
}

.article-title {
  color: #409eff;
  text-decoration: none;
}

.article-title:hover {
  text-decoration: underline;
}

.tag-item {
  margin-right: 8px;
}

.tag-item:last-child {
  margin-right: 0;
}

.reply-prefix {
  color: #1890ff;
  margin-right: 4px;
}

.el-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}
</style> 