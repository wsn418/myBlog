<template>
  <div class="article-edit">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    </div>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>
      
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或输入标签"
        >
          <el-option
            v-for="tag in tags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="内容" prop="content">
        <MdEditor
          v-model="form.content"
          language="zh-CN"
          :toolbars="toolbars"
          preview-theme="github"
          style="height: 500px"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '保存' : '发布' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '@/api'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

export default {
  name: 'ArticleEdit',
  components: {
    MdEditor
  },
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const router = useRouter()
    const formRef = ref(null)
    const tags = ref([])
    
    const form = ref({
      title: '',
      content: '',
      tags: []
    })
    
    const rules = {
      title: [
        { required: true, message: '请输入标题', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入内容', trigger: 'blur' }
      ]
    }

    // 编辑器工具栏配置
    const toolbars = [
      'bold',
      'underline',
      'italic',
      '-',
      'title',
      'strikeThrough',
      'sub',
      'sup',
      'quote',
      'unorderedList',
      'orderedList',
      'task',
      '-',
      'codeRow',
      'code',
      'link',
      'image',
      'table',
      'mermaid',
      'katex',
      '-',
      'revoke',
      'next',
      'save',
      '=',
      'pageFullscreen',
      'fullscreen',
      'preview',
      'htmlPreview',
      'catalog'
    ]
    
    const isEdit = computed(() => Boolean(props.id))
    
    // 获取文章详情
    const fetchArticle = async () => {
      try {
        const response = await articleApi.getDetail(props.id)
        if (response.code === 0) {
          const { title, content, tags } = response.data
          form.value = { title, content, tags }
        }
      } catch (error) {
        console.error('获取文章详情失败:', error)
        ElMessage.error('获取文章详情失败')
      }
    }
    
    // 获取所有标签
    const fetchTags = async () => {
      try {
        const response = await articleApi.getTags()
        if (response.code === 0) {
          tags.value = response.data
        }
      } catch (error) {
        console.error('获取标签列表失败:', error)
      }
    }
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        const api = isEdit.value ? 
          () => articleApi.update(props.id, form.value) :
          () => articleApi.create(form.value)
          
        const response = await api()
        if (response.code === 0) {
          ElMessage.success(isEdit.value ? '保存成功' : '发布成功')
          router.push('/admin/articles')
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(error.message || '提交失败')
      }
    }
    
    const handleCancel = () => {
      router.back()
    }
    
    onMounted(async () => {
      await fetchTags()
      if (isEdit.value) {
        await fetchArticle()
      }
    })
    
    return {
      form,
      formRef,
      rules,
      tags,
      isEdit,
      toolbars,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.article-edit {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-weight: 500;
}

:deep(.md-editor) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style> 