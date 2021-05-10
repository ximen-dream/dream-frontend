<template>
  <div>
    <el-drawer
      title="添加用户"
      :visible.sync="drawer"
      :with-header="false"
      @close="colse"
    >
      <div class="drawer">
        <div class="addTitle"><h3>修改用户</h3></div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="addUserForm">
          <el-form-item label="用户名" prop="username" class="username">
            <el-input v-model="ruleForm.username" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email" class="email">
            <el-input v-model="ruleForm.email" />
          </el-form-item>
          <el-form-item label="角色" prop="role" class="role">
            <el-select v-model="ruleForm.role" multiple placeholder="请选择角色">
              <el-option v-for="item in roleOptions" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { checkEmailIsExist, update } from '@/api/system/user'
import { page as roleList } from '@/api/system/role'
export default {
  name: 'UserEdit',
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    const validEmail = (rule, value, callback) => {
      if (this.user.email === value) {
        callback()
        return
      }
      checkEmailIsExist({ email: value }).then(() => callback()).catch(() => callback('邮箱已存在'))
    }
    return {
      roleOptions: [],
      ruleForm: {
        roleId: undefined,
        username: '',
        email: '',
        role: []
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
          { validator: validEmail, trigger: 'blur' }
        ],
        role: [
          { type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    user(newVal) {
      this.ruleForm.username = newVal.username
      this.ruleForm.email = newVal.email
      this.ruleForm.role = newVal.roleIds
    }
  },
  mounted() {
    this.roleList()
  },
  methods: {
    colse() {
      this.$emit('close')
    },
    roleList() {
      roleList().then(res => {
        this.roleOptions = res.data.map(item => {
          return { value: item.roleId, label: item.roleName }
        })
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.ruleForm.roleId = this.ruleForm.role.join(',')
          this.ruleForm.userId = this.user.userId
          update(this.ruleForm).then(res => {
            if (res.flag) {
              this.$message.success('修改成功')
              this.resetForm('ruleForm')
              this.$emit('submitSuccess')
            } else {
              this.$message.error('修改失败')
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
  .drawer {
    width: 70%;
    margin: 0px auto;
  }
  .addTitle {
    text-align: center;
    margin-top: 80px;
    margin-bottom: 80px;
  }
  .role {
    width: 100%;
  }
  .el-form-item {
    margin-top: 40px;
  }
</style>
