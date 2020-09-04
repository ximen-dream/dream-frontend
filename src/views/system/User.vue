<template>
  <div class="main">
    <div class="header">
      <el-select v-model="queryParams.searchType" class="searchType" placeholder="请选择">
        <el-option
          v-for="item in searchTypes"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input v-model="queryParams.searchKey" class="searchKey" placeholder="请输入内容" />
      <el-button class="seachButton" type="primary" @click="search">查询</el-button>
      <el-button class="addButton" type="primary" @click="addUserDrawer">添加用户</el-button>
    </div>
    <div class="body">
      <template>
        <el-table
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            label="姓名"
          >
            <template slot-scope="scope">
              {{ scope.row.username }}
            </template>
          </el-table-column>
          <el-table-column
            label="邮箱"
          >
            <template slot-scope="scope">
              {{ scope.row.email }}
            </template>
          </el-table-column>
          <el-table-column
            label="角色"
          >
            <template slot-scope="scope">
              {{ scope.row.roleName }}
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
          >
            <template slot-scope="scope">
              {{ moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
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
    <div>
      <template>
        <el-pagination
          :current-page.sync="queryParams.pageNumber"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="100"
          layout="sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </div>
    <user-add :drawer="addDrawer" @close="addDrawerClose" @submitSuccess="addSuccess"/>
    <user-edit :drawer="editDrawer" @close="editDrawerClose" :user="editUser" @submitSuccess="editSuccess"/>
  </div>
</template>

<script>
import { page, update, deleteUser } from '@/api/system/user'
import { page as roleList } from '@/api/system/role'
import moment from 'moment'
import UserAdd from './components/UserAdd'
import UserEdit from './components/UserEdit'
export default {
  name: 'User',
  components: {
    UserAdd,
    UserEdit
  },
  data() {
    return {
      addDrawer: false,
      editDrawer: false,
      roleOptions: [],
      roleIds: [],
      editUser: {},
      addUser: {},
      total: 0,
      searchTypes: [
        { value: 1, label: '用户名' },
        { value: 2, label: '邮箱' }
      ],
      queryParams: {
        searchType: 1,
        searchKey: undefined,
        pageNumber: 1,
        pageSize: 10
      },
      tableData: []
    }
  },
  mounted() {
    this.page()
    this.roleList()
  },
  methods: {
    moment,
    addDrawerClose() {
      this.addDrawer = false
    },
    editDrawerClose() {
      this.editDrawer = false
    },
    // 添加成功
    addSuccess() {
      this.addDrawer = false
      this.page()
    },
    // eslint-disable-next-line vue/no-dupe-keys
    handleDelete(index, row) {
      deleteUser(row.userId).then(res => {
        if (res.flag) {
          this.$message.success('删除成功')
          this.page()
        } else {
          this.$message.error('删除失败')
        }
      })
    },
    addUserDrawer() {
      this.addDrawer = true
      this.roleList()
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.page()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNumber = val
      this.page()
    },
    page() {
      page(this.queryParams).then(res => {
        this.total = res.data.total
        this.tableData = res.data.rows
      })
    },
    search() {
      this.page()
    },
    handleEdit(index, row) {
      this.editUser = row
      this.editUser.roleIds = row.roleId.split(',').map(item => parseInt(item))
      this.editDrawer = true
    },
    roleList() {
      roleList().then(res => {
        this.roleOptions = res.data.map(item => {
          return { value: item.roleId, label: item.roleName }
        })
      })
    },
    // 保存用户
    doUpdate() {
      this.editUser.roleId = this.roleIds.join(',')
      update(this.editUser).then(res => {
        if (res.flag) {
          this.$message.success('更新成功')
          this.drawer = false
          this.page()
        } else {
          this.$message.error('更新失败')
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
 .searchType {
   margin-left: 20px;
   width: 100px;
 }
 .searchKey {
   margin-left: 20px;
   width: 200px;
 }
  .seachButton {
    margin-left: 20px;
  }
  .addButton {
    float: right;
    margin-right: 100px;
  }
  .editUser {
    text-align: center;
    margin-top: 100px;
  }
  .editUser div {
    margin-top: 20px;
  }
</style>
