import { request } from '@/utils/request'
import server from './index'

const module = `${server}/job`

const api = {
  page: `${module}/page`,
  delete: module,
  add: module,
  update: module,
  run: `${module}/run`,
  pause: `${module}/pause`,
  resume: `${module}/resume`
}

// 列表
export function page(params) {
  const { pageNumber, pageSize, searchKey } = params
  return request({
    url: `${api.page}/${pageNumber}/${pageSize}`,
    method: 'get',
    params: { searchKey }
  })
}

// 删除
export function del(ids) {
  return request({
    url: `${api.delete}/${ids}`,
    method: 'delete'
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

// 修改
export function update(id, data) {
  return request({
    url: `${api.update}/${id}`,
    method: 'put',
    data
  })
}

// 运行
export function run(ids) {
  return request({
    url: `${api.run}/${ids}`,
    method: 'get'
  })
}

// 暂停
export function pause(ids) {
  return request({
    url: `${api.pause}/${ids}`,
    method: 'get'
  })
}

// 修改
export function resume(ids) {
  return request({
    url: `${api.resume}/${ids}`,
    method: 'get'
  })
}
