import { login, logout, getUserInfo } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import db from '@/utils/localstorage'

const state = {
  token: getToken(),
  avatar: '',
  introduction: '',
  roles: [],
  user: db.get('USER'),
  accessToken: db.get('ACCESS_TOKEN'),
  refreshToken: db.get('REFRESH_TOKEN'),
  expireTime: db.get('EXPIRE_TIME', 0)
}

const mutations = {
  SET_USER(state, val) {
    db.save('USER', val)
    state.user = val
  },
  SET_ACCESSTOKEN(state, val) {
    db.save('ACCESS_TOKEN', val)
    state.accessToken = val
  },
  SET_REFRESHTOKEN(state, val) {
    db.save('REFRESH_TOKEN', val)
    state.refreshToken = val
  },
  SET_EXPIRETIME(state, val) {
    db.save('EXPIRE_TIME', val)
    state.expireTime = val
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const params = { ...userInfo, grant_type: 'password' }
    return new Promise((resolve, reject) => {
      login(params).then(response => {
        commit('SET_ACCESSTOKEN', response.access_token)
        commit('SET_REFRESHTOKEN', response.refresh_token)
        const current = new Date()
        const expireTime = current.setTime(current.getTime() + 1000 * response.expires_in)
        commit('SET_EXPIRETIME', expireTime)
        resolve(response)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(response => {
        console.log('userInfo: ', response)
        if (!response) {
          reject('Verification failed, please Login again.')
        }

        const roles = ['admin', 'dada']
        const { avatar, introduction } = response
        response.roles = roles

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', 'damon')
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        // removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
