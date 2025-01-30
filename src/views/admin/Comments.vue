<template>
  <div class="comments-manage">
    <h2>评论管理</h2>
    
    <el-table :data="comments" style="width: 100%">
      <el-table-column prop="nickname" label="评论者" width="120" />
      <el-table-column prop="content" label="评论内容" />
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
            @click="handleDelete(row._id)"
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
import { commentApi } from '@/api'
import { formatTime } from '@/utils/time'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'CommentsManage',
  setup() {
    const comments = ref([])
    const loading = ref(false)

    const fetchComments = async () => {
      loading.value = true
      try {
        const res = await commentApi.getList()
        if (res.code === 0) {
          comments.value = res.data
        }
      } catch (error) {
        console.error('获取评论列表失败:', error)
        ElMessage.error('获取评论列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleDelete = async (commentId) => {
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
        await fetchComments()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除评论失败:', error)
          ElMessage.error('删除失败，请重试')
        }
      }
    }

    onMounted(() => {
      fetchComments()
    })

    return {
      comments,
      loading,
      handleDelete,
      formatTime
    }
  }
}
</script>

<style scoped>
.comments-manage {
  padding: 20px;
}
</style> 