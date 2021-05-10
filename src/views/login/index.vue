<template>
  <div class="login-container" :style="'background-image:url('+ Background +')'">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <!-- 密码 -->
      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <!-- 验证码 -->
      <div class="validatecode">
        <el-form-item prop="code" style="width: 220px;color: #fff">
          <span class="svg-container">
            <svg-icon icon-class="auth" />
          </span>
          <el-input
            ref="code"
            v-model="loginForm.code"
            placeholder="Auth Code"
            name="code"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <img :src="imageCode" alt="codeImage" class="code-image" @click="getCodeImage">
      </div>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>
      <div>
        <template v-for="(l, index) in logo">
          <div :key="index" class="logo-wrapper">
            <img :src="resolveLogo(l.img)" alt="" :class="{ 'radius': l.radius }" @click="socialLogin(l.name)">
          </div>
        </template>
      </div>
    </el-form>
    <el-dialog :title="login.type == 'sign' ? '注册绑定' : '绑定' " :visible.sync="socialFormVisible" width="500px">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item style="background: white" label="用户名" prop="bindUsername">
          <el-input v-model="ruleForm.bindUsername" style="border: 1px solid gainsboro; border-radius: 5px;-webkit-text-fill-color: black" />
        </el-form-item>
        <el-form-item style="background: white" label="密码" prop="bindPassword">
          <el-input v-model="ruleForm.bindPassword" style="border: 1px solid gainsboro; border-radius: 5px;-webkit-text-fill-color: black" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="socialFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="doSocialHandle('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import db from '@/utils/localstorage'
import { getUserInfo, bind, sign } from '../../api/auth'
import Background from '@/assets/images/background.jpg'
import axios from 'axios'
import { socialLoginUrl } from '@/settings'
import { mapMutations } from 'vuex'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('Please enter the user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error('The password can not be less than 3 digits'))
      } else {
        callback()
      }
    }
    const validatecode = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error('Auth code length must equals 4'))
      } else {
        callback()
      }
    }
    return {
      Background: Background,
      ruleForm: {
        bindUsername: '',
        bindPassword: ''
      },
      rules: {
        bindUsername: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        bindPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      socialFormVisible: false,
      login: {
        type: 'up'
      },
      socialLoginUrl: socialLoginUrl,
      page: {
        width: window.screen.width * 0.5,
        height: window.screen.height * 0.5
      },
      logo: [
        { img: 'gitee.png', name: 'gitee', radius: true },
        { img: 'github.png', name: 'github', radius: true },
        { img: 'tencent_cloud.png', name: 'tencent_cloud', radius: true },
        { img: 'qq.png', name: 'qq', radius: false },
        { img: 'dingtalk.png', name: 'dingtalk', radius: true },
        { img: 'microsoft.png', name: 'microsoft', radius: false },
        { img: 'weixin.png', name: 'wechat', radius: false }
      ],
      authUser: null,
      imageCode: undefined,
      codeUrl: `${process.env.VUE_APP_BASE_API}auth/captcha`,
      loginForm: {
        username: 'dream',
        password: 'damoncai',
        code: '',
        key: '123'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'blur', validator: validatecode }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    db.clear()
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
    this.getCodeImage()
  },
  destroyed() {
    window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    ...mapMutations(['SET_ACCESSTOKEN', 'SET_REFRESHTOKEN', 'SET_EXPIRETIME', 'SET_USER']),
    socialLogin(oauthType) {
      const url = `${this.socialLoginUrl}/${oauthType}/login`
      window.open(url, 'newWindow', `resizable=yes, height=${this.page.height}, width=${this.page.width}, top=10%, left=10%, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no`)
      window.addEventListener('message', this.resolveSocialLogin, false)
    },
    resolveLogo(logo) {
      return require(`@/assets/logo/${logo}`)
    },
    doSocialHandle(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const params = {
            bindUsername: this.ruleForm.bindUsername,
            bindPassword: this.ruleForm.bindPassword,
            ...this.authUser
          }
          params.token = null
          if (this.login.type === 'sign') { // 登录绑定
            sign(params).then(res => {
              this.saveToken(res.data)
              this.$router.push('/')
            })
          } else { // 绑定
            bind(params).then(res => {
              this.saveToken(res.data)
              this.$router.push('/')
            }).catch(err => console.log('bind err: ', err))
          }
        }
      })
    },
    saveToken(data) {
      this.$store.commit('user/SET_ACCESSTOKEN', data.access_token)
      this.$store.commit('user/SET_REFRESHTOKEN', data.refresh_token)
      const current = new Date()
      const expireTime = current.setTime(current.getTime() + 1000 * data.expires_in)
      this.$store.commit('user/SET_EXPIRETIME', expireTime)
    },
    getCodeImage() {
      this.loginForm.code = ''
      axios({
        method: 'GET',
        url: `${this.codeUrl}?key=123`,
        responseType: 'arraybuffer'
      }).then(res => {
        return 'data:image/png;base64,' + btoa(
          new Uint8Array(res.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
      }).then((res) => {
        this.imageCode = res
      }).catch((e) => {
        if (e.toString().indexOf('429') !== -1) {
          this.$message({
            message: this.$t('tips.tooManyRequest'),
            type: 'error'
          })
        } else {
          this.$message({
            message: this.$t('tips.getCodeImageFailed'),
            type: 'error'
          })
        }
      })
    },
    resolveSocialLogin(e) {
      const data = e.data
      if (data.message === 'not_bind') {
        console.log('not_bind', e)
        this.login.type = 'bind'
        const authUser = data.data
        this.authUser = authUser
        console.log('authuser', this.authUser)
        this.$confirm(`该${authUser.source},未绑定账户`, '提示', {
          confirmButtonText: '注册用户',
          cancelButtonText: '绑定用户',
          type: 'warning'
        }).then(() => {
          this.login.type = 'sign'
          this.socialFormVisible = true
        }).catch(() => {
          this.login.type = 'bind'
          this.socialFormVisible = true
        })
      } else if (data.message === 'social_login_success') {
        this.saveToken(data.data)
        this.$router.push('/')
        // _this.getUserDetailInfo()
        // _this.loginSuccessCallback()
      } else {
        // do nothing
      }
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin: function() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then((res) => {
              this.loading = false
              this.getUserDetailInfo()
              // this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            })
            .catch((e) => {
              this.loading = false
              this.getCodeImage()
              // this.$message.error(e.message)
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getUserDetailInfo() {
      getUserInfo().then((r) => {
        this.SET_USER(r.principal)
        this.$message({
          message: '获取用户信息',
          type: 'success'
        })
        this.loading = false
        this.$router.push('/')
      }).catch((error) => {
        this.$message({
          message: '操作失败',
          type: 'error'
        })
        console.error(error)
        this.loading = false
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 40px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
  .validatecode {
    position: relative;
    width: 450px;
  }
  .validatecode img {
    position: absolute;
    right: 100px;
    top: 4px;
  }
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.login-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .login-form {
    position: absolute;
    right: 15px;
    bottom: 250px;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $light_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}

.logo-wrapper {
  display: inline-block;
  margin: 10px 0;
  img {
    width: 1.9rem;
    display: inline-block;
    margin: .8rem .8rem -.8rem .8rem;
    cursor: pointer;
    &.radius {
      border-radius: 50%;
    }
  }
}
</style>
