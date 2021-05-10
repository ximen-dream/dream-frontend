<template>
  <div>
    <el-drawer
      title="角色修改"
      :visible.sync="drawer"
      :with-header="false"
      @close="close"
    >
      {{ role }}
      <div class="drawer">
        <div class="addTitle"><h3>角色修改</h3></div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="ruleForm.roleName" />
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input v-model="ruleForm.remark" />
          </el-form-item>
          <el-form-item label="权限" prop="permissions">
            <el-tree
              ref="addtree"
              :data="menus"
              :default-checked-keys="checkedKeys"
              show-checkbox
              node-key="id"
              :props="defaultProps"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { list } from '@/api/system/menu'
import { findMenuIdsByRoleId } from '@/api/system/roleMenu'
import { checkRoleNameIsExist, updateRole } from '@/api/system/role'
export default {
  name: 'RoleEdit',
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    role: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    const checkRoleName = (rule, value, callback) => {
      if (value === this.role.roleName) {
        callback()
        return
      }
      checkRoleNameIsExist({ roleName: value }).then(() => callback()).catch(() => callback('角色名称已存在'))
    }
    return {
      menus: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      roleOptions: [],
      ruleForm: {
        roleName: '',
        remark: '',
        role: []
      },
      chooseIcon(icon) {
        this.menu.icon = icon
        this.iconVisible = false
      },
      chooseIcons() {
        this.iconVisible = true
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { validator: checkRoleName, trigger: 'blur' }
        ],
        remark: [
          { required: false }
        ]
      }
    }
  },
  mounted() {
    this.ruleForm.roleName = this.role.roleName
    this.ruleForm.remark = this.role.remark
    this.menuList()
    this.findMenuIdsByRoleId()
  },
  methods: {
    findMenuIdsByRoleId() {
      findMenuIdsByRoleId(this.role.roleId).then(res => {
        this.checkedKeys = res.data
      })
    },
    menuList() {
      list().then(res => {
        this.menus = res.data
      })
    },
    close() {
      this.$emit('close')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const checkedKeys = this.$refs.addtree.getCheckedKeys().concat(this.$refs.addtree.getHalfCheckedKeys())
          const params = {
            ...this.ruleForm,
            menuIds: checkedKeys,
            roleId: this.role.roleId
          }
          updateRole(params).then(res => {
            if (res.flag) {
              this.$message.success('修改成功')
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
