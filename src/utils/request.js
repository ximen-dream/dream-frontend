import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import { refresh } from '@/api/auth'
import store from '@/store'
import router from '@/router'
import db from '@/utils/localstorage'
import { getToken, getRefreshToken, getExpireTime } from '@/utils/auth-ls'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

const refresh_service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
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
  console.log('conf', config)
  const res = await refresh({ refresh_token: refreshToken, grant_type: 'refresh_token' })
  if (res.status === success) {
    store.commit('user/SET_ACCESSTOKEN', res.data.access_token)
    store.commit('user/SET_REFRESHTOKEN', res.data.refresh_token)
    const current = new Date()
    const expireTime = current.setTime(current.getTime() + 1000 * res.data.expires_in)
    store.commit('user/SET_EXPIRETIME', expireTime)
    // eslint-disable-next-line require-atomic-updates
    config.headers['Authorization'] = 'bearer ' + getToken()
  }
  return config
}
const messageDuration = 5 * 1000
// response interceptor
// response interceptor
service.interceptors.response.use((config) => {
  return config.data
}, (error) => {
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
          db.clear()
          MessageBox.alert('登录已过期，请重新登录', '温馨提示', {
            confirmButtonText: '确定',
            showClose: false,
            callback: action => {
              router.push('/login')
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
})

export {
  service as request,
  refresh_service
}
