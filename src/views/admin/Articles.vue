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
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button 
            link
            type="primary" 
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button 
            link
            type="danger" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ArticlesPage',
  setup() {
    const router = useRouter()
    const articles = ref([])
    const loading = ref(false)

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
    const handleEdit = (article) => {
      // 确保使用正确的 ID 字段
      const articleId = article._id || article.id
      if (!articleId) {
        ElMessage.error('无效的文章ID')
        return
      }
      router.push(`/admin/articles/edit/${articleId}`)
    }

    // 删除文章
    const handleDelete = async (article) => {
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
        
        const response = await articleApi.delete(article._id)
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

    onMounted(() => {
      fetchArticles()
    })

    return {
      articles,
      loading,
      handleCreate,
      handleEdit,
      handleDelete
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
</style> 