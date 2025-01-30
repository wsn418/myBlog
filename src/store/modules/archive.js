import { getArchive } from '@/api'

export default {
  namespaced: true,
  
  state: {
    archiveData: {
      total: 0,
      wordCount: 0,
      tags: [],
      archives: []
    }
  },
  
  mutations: {
    SET_ARCHIVE_DATA(state, data) {
      state.archiveData = data
    }
  },
  
  actions: {
    async fetchArchiveData({ commit }, params) {
      try {
        const data = await getArchive(params)
        commit('SET_ARCHIVE_DATA', data)
      } catch (error) {
        console.error('Failed to fetch archive data:', error)
        throw error
      }
    }
  }
} 