<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="内容" prop="content">
      <el-input
        v-model="form.content"
        type="textarea"
        :rows="4"
        placeholder="请输入日常内容"
      />
    </el-form-item>

    <el-form-item label="图片">
      <el-upload
        v-model:file-list="fileList"
        action="/api/upload/image"
        list-type="picture-card"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :on-remove="handleRemove"
        :multiple="true"
        accept=".jpg,.jpeg,.png,.gif"
        name="image"
      >
        <el-icon><Plus /></el-icon>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 jpg/png/gif 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>
    </el-form-item>

    <el-form-item label="位置">
      <el-switch
        v-model="form.enableLocation"
        active-text="携带位置信息"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createDaily, updateDaily } from '@/api'

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const form = ref({
  content: '',
  images: [],
  enableLocation: false,
  location: ''
})
const fileList = ref([])

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 获取上传请求头
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 监听表单数据变化
watch(() => props.formData, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      _id: newVal._id || newVal.id,
      id: newVal._id || newVal.id
    }
    fileList.value = newVal.images?.map(url => ({
      url,
      name: url.split('/').pop()
    })) || []
  }
}, { immediate: true, deep: true })

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 上传相关处理
const handleUploadSuccess = (response, uploadFile) => {
  console.log('上传响应:', response)
  if (response.code === 0 && response.data?.url) {
    form.value.images = form.value.images || []
    // 添加完整的URL
    const imageUrl = `http://localhost:3000${response.data.url}`
    console.log('图片URL:', imageUrl)
    form.value.images.push(imageUrl)
    uploadFile.url = imageUrl
  } else {
    ElMessage.error('图片上传失败')
    fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
  }
}

const handleUploadError = (error, uploadFile) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败')
  // 从文件列表中移除失败的文件
  fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
}

const handleRemove = (uploadFile) => {
  // 从 images 数组中移除
  if (uploadFile.url) {
    form.value.images = form.value.images.filter(url => url !== uploadFile.url)
  }
  // 从文件列表中移除
  fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
}

// 获取位置信息
const getLocation = () => {
  return new Promise((resolve) => {
    if (!form.value.enableLocation) {
      resolve('')
      return
    }
    
    // 使用 IP-API 获取位置信息
    fetch('http://ip-api.com/json/?lang=zh-CN')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          resolve(`${data.city}, ${data.regionName}`)
        } else {
          resolve('')
        }
      })
      .catch(() => resolve(''))
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取位置信息
        form.value.location = await getLocation()
        
        const submitData = {
          ...form.value,
          _id: form.value._id || form.value.id,
          id: form.value._id || form.value.id
        }

        if (submitData.id) {
          await updateDaily(submitData.id, submitData)
        } else {
          await createDaily(submitData)
        }
        emit('submit', submitData)
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      }
    }
  })
}
</script>

<style scoped>
.el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 