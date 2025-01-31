<template>
  <div class="articles-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="标题搜索">
          <el-input v-model="searchForm.keyword" placeholder="请输入标题关键词" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="action-card">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <el-button type="primary" @click="handleCreate">写文章</el-button>
        </div>
      </template>

      <!-- 列表 -->
      <el-table
        v-loading="loading"
        :data="articles"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(row)"
              >删除</el-button>
              <el-button 
                size="small" 
                type="info" 
                @click="handleComments(row)"
              >评论</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

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

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi, commentApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/date'
import { formatTime } from '@/utils/time'

const router = useRouter()
const articles = ref([])
const loading = ref(false)

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索相关
const searchForm = ref({
  keyword: '',
  dateRange: []
})

// 选择相关
const selectedRows = ref([])

// 评论管理相关
const commentDialogVisible = ref(false)
const comments = ref([])
const commentsLoading = ref(false)
const currentArticle = ref(null)

// 添加分页和搜索相关的处理函数
const handleSearch = () => {
  page.value = 1
  fetchArticles()
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    dateRange: []
  }
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchArticles()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchArticles()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      startDate: searchForm.value.dateRange?.[0],
      endDate: searchForm.value.dateRange?.[1]
    }
    const response = await articleApi.getList(params)
    console.log('Article list response:', response)
    
    // 如果后端直接返回数组
    if (Array.isArray(response)) {
      articles.value = response.map(article => ({
        ...article,
        id: article._id || article.id
      }))
      total.value = response.length
      return
    }
    
    // 如果后端返回标准格式
    if (response.code === 0) {
      if (Array.isArray(response.data)) {
        articles.value = response.data.map(article => ({
          ...article,
          id: article._id || article.id
        }))
        total.value = response.data.length
      } else if (response.data?.list) {
        articles.value = response.data.list.map(article => ({
          ...article,
          id: article._id || article.id
        }))
        total.value = response.data.total || response.data.list.length
      }
    } else {
      throw new Error(response.message || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error(error.message || '获取文章列表失败')
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
  const articleId = article._id || article.id
  if (!articleId) {
    ElMessage.error('无效的文章ID')
    return
  }
  router.push(`/admin/articles/edit/${articleId}`)
}

// 删除文章
const handleDelete = async (article) => {
  const articleId = article._id || article.id
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
  await fetchComments(article._id || article.id)
}

// 获取评论列表
const fetchComments = async (articleId) => {
  commentsLoading.value = true
  try {
    const res = await commentApi.getList({
      targetId: articleId,
      targetType: 'article'
    })
    if (res.code === 0) {
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

// 删除评论
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
    
    const res = await commentApi.delete(commentId)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      await fetchComments(currentArticle.value.id)
    } else {
      throw new Error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.articles-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
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