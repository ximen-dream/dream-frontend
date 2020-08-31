<template>
  <div class="main">
    <div class="body">
      <div class="left">
        <template>
          <el-table
            :data="tableData"
            style="width: 100%"
          >
            <el-table-column
              label="名称"
            >
              <template slot-scope="scope">
                {{ scope.row.roleName }}
              </template>
            </el-table-column>
            <el-table-column
              label="描述"
            >
              <template slot-scope="scope">
                {{ scope.row.remark }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <div class="right">
        <div><span>名称：</span><el-input v-model="addRole.roleName" style="width: 50%" /></div>
        <div style="margin-top: 20px"><span>描述：</span><el-input v-model="addRole.remark" style="width: 50%" /></div>
        <div style="margin-top: 20px;overflow: hidden">
          <div style="float: left">权限：</div>
          <div style="float: left">
            <el-tree
              ref="addtree"
              :data="menus"
              :default-checked-keys="checkedKeys"
              show-checkbox
              node-key="id"
              :props="defaultProps"
            />
          </div>
        </div>
        <div>
          <el-button
            size="mini"
            type="primary"
            @click="doAdd"
          >添加</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { page, add, deleteRole, findRoleById } from '../../api/system/role'
import { list } from '../../api/system/menu'

export default {
  name: 'Role',
  data() {
    return {
      editRoleId: undefined,
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      menus: [],
      addDrawer: false,
      tableData: [],
      addRole: {}
    }
  },
  mounted() {
    this.page()
    this.menuList()
  },
  methods: {
    page() {
      page().then(res => {
        this.tableData = res.data
      })
    },
    handleEdit(index, row) {
      this.findRoleById(row.roleId)
    },
    findRoleById(roleId) {
      this.editRoleId = roleId
      findRoleById(roleId).then(res => {
        this.checkedKeys = res.data.menuIds.split(',')
      })
    },
    doAdd() {
      const checkedKeys = this.$refs.addtree.getCheckedKeys().concat(this.$refs.addtree.getHalfCheckedKeys())
      const params = {
        menuIds: checkedKeys,
        ...this.addRole
      }
      add(params).then(res => {
        if (res.flag) {
          this.$message.success('添加成功')
          this.page()
          this.menuList()
          this.addRole = []
        } else {
          this.$message.error('添加失败')
        }
      })
    },
    menuList() {
      list().then(res => {
        this.menus = res.data
      })
    },
    handleDelete(index, row) {
      deleteRole(row.roleId).then(res => {
        if (res.flag) {
          this.$message.success('删除成功')
          this.page()
        } else {
          this.$message.error('删除失败')
        }
      })
    }
  }
}
</script>

<style scoped>
  .main {
    background-color: #fff;
    margin: 10px;
  }
  .header,.body {
    margin: 10px;
  }

  .drawer {
    text-align: center;
    margin-top: 100px;
  }
  .drawer div {
    margin-top: 20px;
  }
  .left,.right {
    float: left;
    width: 40%;
  }
  .right {
    margin-left: 200px;
  }
</style>
