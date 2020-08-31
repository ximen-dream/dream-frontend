import request from '@/utils/request'
import server from './index'

const module = `${server}/menu`

const api = {
  list: `${module}`
}

/**
 * 刷新token
 * @param data
 * @returns {AxiosPromise}
 */
export function list() {
  return request({
    url: api.list,
    method: 'get'
  })
}
