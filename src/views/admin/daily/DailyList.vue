<template>
  <div class="daily-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="内容搜索">
          <el-input v-model="searchForm.keyword" placeholder="请输入内容关键词" />
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
          <span>日常列表</span>
          <el-button type="primary" @click="handleAdd">新增日常</el-button>
        </div>
      </template>

      <!-- 列表 -->
      <el-table
        v-loading="loading"
        :data="dailyList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.location">
              <el-icon><Location /></el-icon>
              {{ row.location }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="imageCount" label="图片数" width="80" />
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
                @click="handleDelete(row.id)"
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增日常' : '编辑日常'"
      width="60%"
    >
      <daily-form
        ref="formRef"
        :form-data="formData"
        @submit="handleSubmit"
        @cancel="dialogVisible = false"
      />
    </el-dialog>

    <!-- 评论管理对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="`评论管理 - ${currentDaily?.content?.substring(0, 20)}...`"
      width="70%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="comment-table-wrapper">
        <el-table
          :data="comments"
          v-loading="commentsLoading"
          row-key="_id"
          height="500"
          :max-height="500"
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
              {{ formatDate(row.createdAt) }}
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
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDailyList, deleteDaily, createDaily, updateDaily } from '@/api'
import { commentApi } from '@/api'  // 添加评论API导入
import DailyForm from './components/DailyForm.vue'
import { formatDate } from '@/utils/date'
import { Location } from '@element-plus/icons-vue'

// 状态定义
const loading = ref(false)
const dailyList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formData = ref({})
const searchForm = ref({
  keyword: '',
  dateRange: []
})
const selectedRows = ref([])

// 评论管理相关
const commentDialogVisible = ref(false)
const comments = ref([])
const commentsLoading = ref(false)
const currentDaily = ref(null)

// 监听对话框关闭
watch(commentDialogVisible, (val) => {
  if (!val) {
    // 对话框关闭时清空数据
    comments.value = []
    currentDaily.value = null
  }
})

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      startDate: searchForm.value.dateRange?.[0],
      endDate: searchForm.value.dateRange?.[1]
    }
    const res = await getDailyList(params)
    if (res.data.code === 0) {
      dailyList.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.message || '获取列表失败')
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    dateRange: []
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchData()
}

// 选择处理
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 新增/编辑处理
const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = {}
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  formData.value = {
    ...row,
    _id: row._id || row.id,  // 确保两种 ID 都存在
    id: row._id || row.id
  }
  dialogVisible.value = true
}

const handleSubmit = async (data) => {
  try {
    if (dialogType.value === 'add') {
      await createDaily(data)
    } else {
      // 确保使用正确的 id
      const id = data._id || data.id
      if (!id) {
        throw new Error('无效的ID')
      }
      // 移除多余的 ID 字段，避免冲突
      const submitData = { ...data }
      delete submitData._id
      delete submitData.id
      await updateDaily(id, submitData)
    }
    dialogVisible.value = false
    await fetchData()
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除处理
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该日常吗？')
    // 确保使用正确的 id
    const dailyId = typeof id === 'object' ? (id._id || id.id) : id
    if (!dailyId) {
      throw new Error('无效的ID')
    }
    await deleteDaily(dailyId)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 处理评论按钮点击
const handleComments = async (row) => {
  currentDaily.value = row
  commentDialogVisible.value = true
  await nextTick() // 等待 DOM 更新
  await fetchComments(row.id)
}

// 获取评论列表
const fetchComments = async (dailyId) => {
  commentsLoading.value = true
  try {
    const res = await commentApi.getList({
      targetId: dailyId,
      targetType: 'daily'
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
    
    await commentApi.delete(commentId)
    ElMessage.success('删除成功')
    await fetchComments(currentDaily.value.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.daily-list {
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
/* 添加表格内容样式 */
.el-table {
  margin-top: 20px;
}
.el-tag {
  margin-right: 5px;
}

.daily-preview {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.daily-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
}

.daily-time {
  font-size: 12px;
  color: #999;
}

/* 调整评论列表在对话框中的样式 */
:deep(.comment-list) {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
}

.reply-prefix {
  color: #1890ff;
  margin-right: 4px;
}

.comment-table-wrapper {
  width: 100%;
  height: 500px;
}

.el-dialog :deep(.el-dialog__body) {
  padding: 20px;
  height: calc(100% - 100px);  /* 减去头部和底部的高度 */
  overflow: hidden;  /* 改为 hidden */
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.image-error .el-icon {
  font-size: 24px;
}

/* 调整表格内图片的显示 */
:deep(.el-table__cell) {
  vertical-align: middle;
}
</style>
