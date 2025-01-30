import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getArchive } from '@/api'

export const useArchiveStore = defineStore('archive', () => {
  const archives = ref([])
  const loading = ref(false)
  const error = ref(null)

  const total = computed(() => archives.value.reduce((sum, year) => sum + year.count, 0))
  
  const yearGroups = computed(() => {
    return archives.value.map(year => ({
      year: year.year,
      count: year.count,
      articles: year.articles
    }))
  })

  async function fetchArchives(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await getArchive(params)
      archives.value = data.archives || []
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch archives:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    archives,
    loading,
    error,
    total,
    yearGroups,
    fetchArchives
  }
}) 