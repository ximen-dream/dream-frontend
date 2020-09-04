<template>
    <div>
      <el-drawer
        title="添加用户"
        :visible.sync="drawer"
        :with-header="false"
        @close="close"
      >
        <div class="drawer">
          <div class="addTitle"><h3>添加用户</h3></div>
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="addUserForm" >
            <el-form-item label="用户名" prop="username" class="username">
              <el-input v-model="ruleForm.username"></el-input>
            </el-form-item>
            <el-form-item  label="邮箱" prop="email" class="email">
              <el-input v-model="ruleForm.email"></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="role" class="role">
              <el-select multiple v-model="ruleForm.role" placeholder="请选择角色">
                <el-option v-for="item in roleOptions" :key="item.id" :label="item.label" :value="item.value"/>
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
import { page as roleList } from '@/api/system/role'
import { add } from '@/api/system/user'
export default {
  name: 'UserEdit',
  data() {
    return {
      roleOptions: [],
      ruleForm: {
        username: '',
        email: '',
        role: []
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        role: [
          { type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.roleList()
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    roleList() {
      roleList().then(res => {
        this.roleOptions = res.data.map(item => {
          return { value: item.roleId, label: item.roleName }
        })
      })
    },
    close() {
      this.$emit('close')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.ruleForm.roleId = this.ruleForm.role.join(',')
          add(this.ruleForm).then(res => {
            if (res.flag) {
              this.$message.success('添加成功')
              this.resetForm('ruleForm')
              this.$emit('submitSuccess')
            } else {
              this.$message.error('添加失败')
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
