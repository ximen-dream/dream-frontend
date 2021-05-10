import { request } from '@/utils/request'
import server from './index'

const module = `${server}/menu`

const api = {
  list: `${module}`,
  add: `${module}`,
  delete: `${module}`,
  update: `${module}`,
  routersAndPermissions: `${module}/routersAndPermissions`
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

// 添加
export function add(data) {
  return request({
    url: api.add,
    method: 'post',
    data
  })
}

// 删除
export function deleteById(id) {
  return request({
    url: `${api.delete}/${id}`,
    method: 'delete'
  })
}
// 更新
export function update(id, data) {
  return request({
    url: `${api.update}/${id}`,
    method: 'put',
    data
  })
}

// 路由权限
export function routersAndPermissions() {
  return request({
    url: api.routersAndPermissions,
    method: 'get'
  })
}

