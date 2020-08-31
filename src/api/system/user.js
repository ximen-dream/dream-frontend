import request from '@/utils/request'
import server from './index'
import qs from 'qs'

const module = `${server}/user`

const api = {
  page: `${module}/page`,
  update: `${module}/update`,
  add: `${module}/add`,
  delete: `${module}/delete`
}

/**
 * 刷新token
 * @param data
 * @returns {AxiosPromise}
 */
export function page(data) {
  return request({
    url: `${api.page}/${data.pageNumber}/${data.pageSize}?${qs.stringify(data)}`,
    method: 'get'
  })
}

/**
 * 更新
 * @param data
 * @returns {AxiosPromise}
 */
export function update(data) {
  return request({
    url: api.update,
    method: 'put',
    data
  })
}

/**
 * 添加用户
 * @param data
 * @returns {AxiosPromise}
 */
export function add(data) {
  return request({
    url: api.add,
    method: 'post',
    data
  })
}

/**
 * 删除用户
 * @param data
 * @returns {AxiosPromise}
 */
export function deleteUser(data) {
  return request({
    url: `${api.delete}/${data}`,
    method: 'delete'
  })
}

