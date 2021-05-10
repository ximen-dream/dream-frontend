<template>
  <div>
    <el-row type="flex" style="margin: 20px" justify="space-around">
      <el-col :span="12">
        <div class="left" style="width: 90%">
          <el-table
            :data="menus"
            style="width: 100%;margin-bottom: 20px;"
            row-key="id"
            border
            :tree-props="{children: 'children', hasChildren: 'hasChildren2'}"
          >
            <el-table-column
              prop="label"
              label="名称"
              sortable
              width="180"
            />
            <el-table-column
              prop="type"
              label="类型"
              sortable
              width="180"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.type == 1 ? 'primary' : scope.row.type == 2 ? 'success' : 'warning'"
                  disable-transitions
                >{{ scope.row.type == 1 ? '菜单' : scope.row.type == 2 ? '按钮' : 'API' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="path"
              label="路径"
            />
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-popconfirm
                  title="这是一段内容确定删除吗？"
                  @onConfirm="handleDelete(scope.$index, scope.row)"
                >
                  <el-button
                    slot="reference"
                    type="danger"
                  >删除</el-button>
                </el-popconfirm>
                <el-button
                  slot="reference"
                  style="margin-left: 20px"
                  type="warning"
                  @click="edit(scope.$index, scope.row)"
                >修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right" style="width: 70%">
          <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="addUserForm">
            <el-form-item label="上级菜单">
              <el-cascader
                style="width: 100%"
                :options="menusTree"
                :props="{ checkStrictly: true }"
                clearable
                @change="choosedSuperMenuChange"
              />
            </el-form-item>
            <el-form-item label="名称" prop="menuName">
              <el-input v-model="ruleForm.menuName" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-radio-group v-model="ruleForm.type" @change="typeChangeHandle">
                <el-radio label="1">菜单</el-radio>
                <el-radio label="2">按钮</el-radio>
                <el-radio label="3">API</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="isMenu" label="图标" prop="icon">
              <el-input v-model="ruleForm.icon">
                <el-button slot="append" icon="el-icon-brush" style="padding-left: 0;" @click="chooseIcons" />
              </el-input>
            </el-form-item>
            <el-form-item v-if="isMenu" label="URL" prop="path">
              <el-input v-model="ruleForm.path" />
            </el-form-item>
            <el-form-item v-if="isMenu" label="组件" prop="component">
              <el-input v-model="ruleForm.component" />
            </el-form-item>
            <el-form-item label="权限" prop="perms" class="role">
              <el-input v-model="ruleForm.perms" />
            </el-form-item>
            <el-form-item label="序号" prop="orderNum" class="role">
              <el-input-number v-model="ruleForm.orderNum" label="排序" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('ruleForm')">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <menu-edit v-if="editDrawer" :drawer="editDrawer" :menus-tree="menusTree" :menu="editMenu" @close="editDrawerClose" @submitSuccess="editSuccess" />
    <Icons
      :dialog-visible="iconVisible"
      @close="iconVisible = false"
      @choose="chooseIcon"
    />
  </div>
</template>

<script>
import { list, add, deleteById } from '@/api/system/menu'
import MenuEdit from '@/views/system/components/MenuEdit'
import Icons from './components/Icons'
export default {
  name: 'Menu',
  components: {
    MenuEdit,
    Icons
  },
  data() {
    return {
      iconVisible: false,
      editMenu: {},
      editDrawer: false,
      superMenuId: undefined,
      menus: [],
      menusTree: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      ruleForm: {
        menuName: '',
        type: '1',
        icon: '',
        path: '',
        component: '',
        orderNum: 0
      },
      rules: {
        menuName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
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
  mounted() {
    this.menuList()
  },
  methods: {
    chooseIcon(icon) {
      this.ruleForm.icon = icon
      this.iconVisible = false
    },
    // 删除事件
    handleDelete(index, row) {
      this.doDelete(row.id)
    },
    doDelete(id) {
      deleteById(id).then(() => {
        this.$message.success('删除成功')
        this.menuList()
      }).catch(() => {
        this.$message.error('删除失败')
      })
    },
    chooseIcons() {
      this.iconVisible = true
    },
    edit(index, row) {
      this.editMenu = row
      this.editMenu.menuName = row.label
      this.editDrawer = true
    },
    editSuccess() {
      this.editDrawerClose()
      this.menuList()
    },
    menuList() {
      list().then(res => {
        this.menus = res.data
        const valueTtree = res.data
        this.addValue(valueTtree)
        this.menusTree = valueTtree
        console.log(valueTtree)
      })
    },
    choosedSuperMenuChange(e) {
      this.superMenuId = e[0]
    },
    editDrawerClose() {
      this.editDrawer = false
    },
    typeChangeHandle(e) {
      this.isMenu = e === '1'
    },
    addValue(data) {
      data.map(item => {
        item.value = item.id
        if (item.children) {
          this.addValue(item.children)
        }
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.ruleForm.parentId = this.superMenuId
          add(this.ruleForm).then(res => {
            this.$refs[formName].resetFields()
            this.$message.success('添加成功')
            this.menuList()
          }).catch(() => {
            this.$message.error('添加失败')
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
