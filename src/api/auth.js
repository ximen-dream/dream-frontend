import request from '@/utils/request'
import qs from 'qs'

const server = 'auth'

/**
 * 验证码
 * @param key
 * @returns {AxiosPromise}
 */
export function captcha(key) {
  return request({
    url: `${server}/captcha?key=${key}`,
    method: 'get',
    responseType: 'arraybuffer'
  })
}

/**
 * 获取token
 * @param data
 * @returns {AxiosPromise}
 */
export function login(data) {
  return request({
    url: `${server}/oauth/token`,
    method: 'post',
    data: qs.stringify(data),
    headers: {
      'Authorization': 'Basic Y2xvdWQ6MTIz'
    }
  })
}

/**
 * 刷新token
 * @param data
 * @returns {AxiosPromise}
 */
export function refresh(data) {
  return request({
    url: `${server}/oauth/token`,
    method: 'post',
    data: qs.stringify(data),
    headers: {
      'Authorization': 'Basic Y2xvdWQ6MTIz'
    }
  })
}

/**
 * 获取用户信息
 * @returns {AxiosPromise}
 */
export function getUserInfo() {
  return request({
    url: `${server}/user`,
    method: 'get'
  })
}

