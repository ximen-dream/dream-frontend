import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  name: 'System',
  alwaysShow: true,
  meta: {
    title: '系统管理',
    icon: 'el-icon-setting'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/User'), // Parent router-view
      name: 'user',
      meta: { title: '用户管理', icon: 'el-icon-user' }
    },
    {
      path: 'role',
      component: () => import('@/views/system/Role'), // Parent router-view
      name: 'role',
      meta: { title: '角色管理', icon: 'el-icon-s-order' }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/Menu'), // Parent router-view
      name: 'menu',
      meta: { title: '权限管理', icon: 'el-icon-s-custom' }
    }
  ]
}

export default systemRouter
