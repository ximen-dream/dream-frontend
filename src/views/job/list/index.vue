<template>
  <div style="margin: 10px">
    <div class="header">
      <el-input v-model="queryParams.searchKey" style="width: 10%" clearable placeholder="请输入内容" />
      <el-button style="margin-left: 10px" type="primary" @click="page">查询</el-button>
      <el-button style="margin-left: 10px" class="addButton" type="success" @click="showDialogFormVisible">添加</el-button>
    </div>
    <div class="body" />
    <template>
      <el-table
        :data="tableData"
        style="width: 100%"
        max-height="500"
      >
        <el-table-column
          fixed
          prop="beanName"
          label="Bean名称"
        />
        <el-table-column
          prop="methodName"
          label="方法名称"
        />
        <el-table-column
          prop="params"
          label="参数方法"
        />
        <el-table-column
          prop="cronExpression"
          label="Cron表达式"
        />
        <el-table-column
          prop="remark"
          label="备注"
        />
        <el-table-column
          prop="zip"
          label="状态"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.status == 1 ? 'info' : 'success'">{{ scope.row.status == 1 ? '暂停' : '运行' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
        />
        <el-table-column label="操作" fixed="right" width="350">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              plain
              @click="handleRun(scope.$index, scope.row)"
            >运行</el-button>
            <el-button
              size="mini"
              type="primary"
              plain
              @click="handlePause(scope.$index, scope.row)"
            >暂停</el-button>
            <el-button
              size="mini"
              type="warning"
              plain
              @click="handleResume(scope.$index, scope.row)"
            >重置</el-button>
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-popconfirm
              title="这是一段内容确定删除吗？"
              @onConfirm="handleDelete(scope.$index, scope.row)"
            >
              <el-button
                slot="reference"
                style="margin-left: 5px"
                size="mini"
                type="danger"
                plain
              >删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </template>
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
    <!-- 添加 -->
    <div>
      <el-dialog v-if="dialogFormVisible" title="添加" :visible.sync="dialogFormVisible" style="width: 70%;margin: 0px auto">
        <el-form ref="ruleForm" :model="form" :rules="rules">
          <el-form-item label="Bean名称" prop="beanName" :label-width="formLabelWidth">
            <el-input v-model="form.beanName" />
          </el-form-item>
          <el-form-item label="方法名称" prop="methodName" :label-width="formLabelWidth">
            <el-input v-model="form.methodName" />
          </el-form-item>
          <el-form-item label="方法参数" prop="params" :label-width="formLabelWidth">
            <el-input v-model="form.params" />
          </el-form-item>
          <el-form-item label="Cron表达式" prop="cronExpression" :label-width="formLabelWidth">
            <el-input v-model="form.cronExpression" autocomplete="off" />
          </el-form-item>
          <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
            <el-input v-model="form.remark" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitHandle('ruleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <edit v-if="editVisible" :job="selectedRow" :visible="editVisible" @cancel="editCancel" @submit="editSubmitHandle" />
  </div>
</template>

<script>
import { page, del, add, run, pause, resume } from '@/api/job/job'
import Edit from '@/views/job/list/components/Edit'
export default {
  name: 'Index',
  comments: {
    Edit
  },
  components: { Edit },
  data() {
    return {
      editVisible: false,
      tableData: [],
      total: 0,
      queryParams: {
        pageNumber: 1,
        pageSize: 10,
        searchKey: undefined
      },
      form: {
        beanName: '',
        methodName: '',
        params: '',
        cronExpression: '',
        remark: ''
      },
      selectedRow: {},
      formLabelWidth: '120px',
      dialogFormVisible: false,
      rules: {
        beanName: [
          { required: true, message: '请输入Bean名称', trigger: 'blur' }
        ],
        methodName: [
          { required: true, message: '请输入方法名称', trigger: 'blur' }
        ],
        cronExpression: [
          { required: true, message: '请输入Cron表达式', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.page()
  },
  methods: {
    editCancel() {
      this.closeEditDialogFormVisible()
    },
    showDialogFormVisible() {
      this.dialogFormVisible = true
    },
    closeDialogFormVisible() {
      this.dialogFormVisible = false
    },
    showEditDialogFormVisible() {
      this.editVisible = true
    },
    closeEditDialogFormVisible() {
      this.editVisible = false
    },
    page() {
      page(this.queryParams)
        .then(res => {
          this.total = res.data.total
          this.tableData = res.data.rows
        })
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.page()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNumber = val
      this.page()
    },
    handleEdit(index, row) {
      this.showEditDialogFormVisible()
      this.selectedRow = row
    },
    handleRun(index, row) {
      run(row.jobId)
        .then(() => {
          this.$message.success('运行成功')
          this.page()
        })
    },
    handlePause(index, row) {
      pause(row.jobId)
        .then(() => {
          this.$message.success('暂停成功')
          this.page()
        })
    },
    handleResume(index, row) {
      resume(row.jobId)
        .then(() => {
          this.$message.success('重置成功')
          this.page()
        })
    },
    editSubmitHandle() {
      this.page()
      this.closeEditDialogFormVisible()
    },
    handleDelete(index, row) {
      const jobId = row.jobId
      this.delete(jobId)
    },
    delete(jobId) {
      del(jobId)
        .then(() => {
          this.page()
        })
    },
    submitHandle(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          add(this.form)
            .then(res => {
              this.$message.success('添加成功')
              this.page()
              this.closeDialogFormVisible()
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
