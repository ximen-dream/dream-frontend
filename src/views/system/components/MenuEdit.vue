<template>
  <div>
    <el-drawer
      title="权限修改"
      :visible.sync="drawer"
      :with-header="false"
      destroy-on-close
      @close="close"
    >
      <div class="drawer">
        <div class="addTitle"><h3>权限修改</h3></div>
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="addUserForm">
          <el-form-item label="上级菜单">
            <el-cascader
              style="width: 100%"
              :options="menusTree"
              :props="{ checkStrictly: true }"
              clearable
            />
          </el-form-item>
          <el-form-item label="名称" prop="menuName">
            <el-input v-model="ruleForm.menuName" />
          </el-form-item>
          <el-form-item label="类型" prop="type" class="email">
            <el-radio-group v-model="ruleForm.type" @change="typeChangeHandle">
              <el-radio label="1">菜单</el-radio>
              <el-radio label="2">按钮</el-radio>
              <el-radio label="3">API</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="ruleForm.type == 1" label="图标" prop="icon">
            <el-input v-model="ruleForm.icon">
              <el-button slot="append" icon="el-icon-brush" style="padding-left: 0;" @click="chooseIcons" />
            </el-input>
          </el-form-item>
          <el-form-item v-if="ruleForm.type == 1" label="URL" prop="path">
            <el-input v-model="ruleForm.path" />
          </el-form-item>
          <el-form-item v-if="ruleForm.type == 1" label="组件" prop="component">
            <el-input v-model="ruleForm.component" />
          </el-form-item>
          <el-form-item label="权限" prop="perms" class="role">
            <el-input v-model="ruleForm.perms" />
          </el-form-item>
          <el-form-item label="权限" prop="orderNum" class="role">
            <el-input-number v-model="ruleForm.orderNum" label="排序" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <Icons
      :dialog-visible="iconVisible"
      @close="iconVisible = false"
      @choose="chooseIcon"
    />
  </div>
</template>

<script>
import { list, update } from '@/api/system/menu'
import { findMenuIdsByRoleId } from '@/api/system/roleMenu'
import Icons from './Icons'
export default {
  name: 'RoleEdit',
  components: {
    Icons
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    menusTree: {
      type: Array,
      default() {
        return []
      }
    },
    menu: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      iconVisible: false,
      menus: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      roleOptions: [],
      ruleForm: {
        menuName: '',
        perms: '',
        icon: '',
        path: '',
        component: '',
        orderNum: 0
      },
      rules: {
        menuName: [
          { required: true, message: '请输入权限名', trigger: 'blur' }
        ],
        perms: [
          { required: true, message: '请输入权限标识' }
        ],
        icon: [
          { required: false }
        ],
        path: [
          { required: false }
        ],
        component: [
          { required: false }
        ]
      },
      isMenu: true
    }
  },
  watch: {
    menu(newVal) {
      this.ruleForm = JSON.parse(JSON.stringify(newVal))
    }
  },
  mounted() {
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
    chooseIcon(icon) {
      this.ruleForm.icon = icon
      this.iconVisible = false
    },
    chooseIcons() {
      this.iconVisible = true
    },
    typeChangeHandle(e) {
      this.isMenu = e === '1'
    },
    close() {
      this.$emit('close')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          update(this.ruleForm.id, this.ruleForm).then(res => {
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
