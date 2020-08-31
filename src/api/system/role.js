import request from '@/utils/request'
import server from './index'

const module = `${server}/role`

const api = {
  page: `${module}/page`,
  add: `${module}`,
  delete: `${module}`,
  findRoleById: `${module}/findRoleById`,
  update: `${module}`
}

/**
 * @param data
 * @returns {AxiosPromise}
 */
export function page(data) {
  return request({
    url: `${api.page}`,
    method: 'get'
  })
}

/**
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
 * 删除
 * @param data
 * @returns {AxiosPromise}
 */
export function deleteRole(data) {
  return request({
    url: `${api.delete}/${data}`,
    method: 'delete'
  })
}

/**
 * 删除
 * @param data
 * @returns {AxiosPromise}
 */
export function findRoleById(data) {
  return request({
    url: `${api.findRoleById}/${data}`,
    method: 'get'
  })
}

export function updateRole(data) {
  return request({
    url: `${api.update}`,
    method: 'put',
    data
  })
}
