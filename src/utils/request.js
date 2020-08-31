import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import { refresh } from '@/api/auth'
import store from '@/store'
import { getToken, getRefreshToken, getExpireTime } from '@/utils/auth-ls'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// 请求超时时间，10s
// const requestTimeOut = 10 * 1000
const success = 200
// 更换令牌的时间区间
const checkRegion = 5 * 60 * 1000
// 提示信息显示时长
// const messageDuration = 5 * 1000
// request interceptor
service.interceptors.request.use(
  config => {
    let _config = config
    try {
      const expireTime = getExpireTime()
      if (expireTime) {
        debugger
        const left = expireTime - new Date().getTime()
        const refreshToken = getRefreshToken()
        if (left < checkRegion && refreshToken) {
          _config = queryRefreshToken(_config, refreshToken)
        } else {
          if (getToken()) {
            _config.headers['Authorization'] = 'bearer ' + getToken()
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
    return _config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

async function queryRefreshToken(config, refreshToken) {
  refresh({ refresh_token: refreshToken, grant_type: 'refresh_token' })
    .then(res => {
      if (res.status === success) {
        store.commit('user/SET_ACCESSTOKEN', res.data.access_token)
        store.commit('user/SET_REFRESHTOKEN', res.data.refresh_token)
        const current = new Date()
        const expireTime = current.setTime(current.getTime() + 1000 * res.data.expires_in)
        store.commit('user/SET_EXPIRETIME', expireTime)
        config.headers['Authorization'] = 'bearer ' + getToken()
      }
    })
  return config
}

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    console.log(response)
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (response.status !== 200) {
      console.log('!=200')
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    const messageDuration = 3 * 1000
    if (error.response) {
      const errorMessage = error.response.data === null ? '系统内部异常，请联系网站管理员' : error.response.data.message
      switch (error.response.status) {
        case 404:
          Message({
            message: '很抱歉，资源未找到',
            type: 'error',
            duration: messageDuration
          })
          break
        case 403:
          Message({
            message: '很抱歉，您暂无该操作权限',
            type: 'error',
            duration: messageDuration
          })
          break
        case 401:
          Message({
            message: '很抱歉，认证已失效，请重新登录',
            type: 'error',
            duration: messageDuration
          })
          break
        default:
          if (errorMessage === 'refresh token无效') {
            MessageBox.alert('登录已过期，请重新登录', '温馨提示', {
              confirmButtonText: '确定',
              showClose: false,
              callback: action => {
                this.$router.push('/login')
              }
            })
          } else {
            Message({
              message: errorMessage,
              type: 'error',
              duration: messageDuration
            })
          }
          break
      }
    }
    return Promise.reject(error)
  }
)

export default service
