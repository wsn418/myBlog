import { getArchive } from '@/api'

const state = {
  archiveData: {
    total: 0,
    archives: []
  }
}

const mutations = {
  SET_ARCHIVE_DATA(state, data) {
    state.archiveData = data
  }
}

const actions = {
  async fetchArchiveData({ commit }, params = {}) {
    try {
      const data = await getArchive(params)
      commit('SET_ARCHIVE_DATA', data)
    } catch (error) {
      console.error('获取归档数据失败:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 