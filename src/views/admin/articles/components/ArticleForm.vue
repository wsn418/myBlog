<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <!-- ... 其他表单项保持不变 ... -->
    
    <el-form-item label="标签" prop="tags">
      <el-select
        v-model="form.tags"
        multiple
        filterable
        allow-create
        default-first-option
        :loading="tagsLoading"
        placeholder="请选择或输入标签"
      >
        <el-option
          v-for="tag in existingTags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </el-form-item>
    
    <!-- ... 其他表单项保持不变 ... -->
  </el-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { articleApi } from '@/api'
import { ElMessage } from 'element-plus'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 表单数据
const form = ref({
  title: '',
  content: '',
  tags: [],
  // ... 其他字段
})

// 标签相关
const existingTags = ref([])
const tagsLoading = ref(false)

// 获取已有标签
const fetchTags = async () => {
  try {
    tagsLoading.value = true
    const response = await articleApi.getAllTags()
    if (response.code === 0) {
      existingTags.value = response.data || []
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    tagsLoading.value = false
  }
}

// 初始化表单数据
const initForm = () => {
  if (props.initialData) {
    form.value = {
      ...props.initialData,
      tags: props.initialData.tags || []
    }
  }
}

onMounted(() => {
  fetchTags()
  initForm()
})

// ... 其他代码保持不变 ...
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style> 