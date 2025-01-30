<template>
  <div class="change-password">
    <el-card class="password-card">
      <template #header>
        <h3>修改密码</h3>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { changePassword } from '@/api'

defineOptions({
  name: 'AdminChangePasswordPage'
})

const formRef = ref(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    ElMessage.success('密码修改成功')
    formRef.value.resetFields()
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败')
  }
}
</script>

<style scoped>
.change-password {
  padding: 20px;
}

.password-card {
  max-width: 500px;
  margin: 0 auto;
}
</style> 