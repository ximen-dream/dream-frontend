import { request } from '@/utils/request'
import server from './index'

const module = `${server}/roleMenu`

const api = {
  findMenuIdsByRoleId: `${module}/findMenuIdsByRoleId`
}

export function findMenuIdsByRoleId(id) {
  return request({
    url: `${api.findMenuIdsByRoleId}/${id}`,
    method: 'get'
  })
}
