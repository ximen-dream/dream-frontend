<template>
  <el-dialog title="编辑" :visible.sync="visible" style="width: 70%;margin: 0px auto" @close="cancle">
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
      <el-button @click="cancle">取 消</el-button>
      <el-button type="primary" @click="submitHandle('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { update } from '@/api/job/job'

export default {
  name: 'Edit',
  props: {
    job: {
      type: Object,
      default() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        beanName: '',
        methodName: '',
        params: '',
        cronExpression: '',
        remark: ''
      },
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
    this.form = JSON.parse(JSON.stringify(this.job))
  },
  methods: {
    cancle() {
      this.visible = false
      this.$emit('cancel')
    },
    submitHandle(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const jobId = this.form.jobId
          update(jobId, this.form)
            .then(res => {
              this.$message.success('修改成功')
              this.$emit('submit')
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
