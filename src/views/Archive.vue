<template>
  <div class="archive-container">
    <div class="archive-header">
      <archive-stats 
        :total="archiveData.total" 
        :wordCount="archiveData.wordCount"
        :tags="archiveData.tags"
        :currentTag="currentTag"
        @tag-click="handleTagClick"
      />
    </div>
    
    <article-calendar 
      :articles="flattenedArticles"
      @show-articles="showArticleDialog"
    />
    
    <div class="archive-content">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div style="padding: 20px">
            <el-skeleton-item variant="p" style="width: 100%; height: 600px" />
          </div>
        </template>
        
        <template #default>
          <archive-timeline 
            :articles="archiveData.archives" 
            :loading="loading"
          />
        </template>
      </el-skeleton>
    </div>

    <!-- 多文章选择弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="选择要查看的文章"
      width="30%"
    >
      <div class="article-list">
        <div
          v-for="article in selectedDayArticles"
          :key="article.id"
          class="article-item"
          @click="viewArticle(article.id)"
        >
          {{ article.title }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ArchiveStats from '../components/archive/ArchiveStats.vue'
import ArchiveTimeline from '../components/archive/ArchiveTimeline.vue'
import ArticleCalendar from '../components/archive/ArticleCalendar.vue'

export default {
  name: 'ArchivePage',
  components: {
    ArchiveStats,
    ArchiveTimeline,
    ArticleCalendar
  },
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = ref(false)
    const currentTag = ref('')
    const dialogVisible = ref(false)
    const selectedDayArticles = ref([])

    const archiveData = computed(() => {
      return store.state?.archive?.archiveData || { 
        total: 0, 
        wordCount: 0,
        tags: [],
        archives: [] 
      }
    })
    
    const flattenedArticles = computed(() => {
      const articles = archiveData.value?.archives?.flatMap(year => year.articles) || []
      console.log('Flattened articles:', articles)
      return articles
    })
    
    const handleTagClick = async (tag) => {
      currentTag.value = tag
      loading.value = true
      try {
        await store.dispatch('archive/fetchArchiveData', { 
          year: new Date().getFullYear(),
          tag
        })
      } catch (error) {
        console.error('标签筛选失败:', error)
      } finally {
        loading.value = false
      }
    }

    const showArticleDialog = (articles) => {
      selectedDayArticles.value = articles
      dialogVisible.value = true
    }

    const viewArticle = (id) => {
      dialogVisible.value = false
      router.push(`/article/${id}`)
    }

    onMounted(async () => {
      try {
        loading.value = true
        await store.dispatch('archive/fetchArchiveData')
      } catch (error) {
        console.error('加载归档数据失败:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      currentTag,
      archiveData,
      handleTagClick,
      dialogVisible,
      selectedDayArticles,
      showArticleDialog,
      viewArticle,
      flattenedArticles
    }
  }
}
</script>

<style scoped>
.archive-container {
  padding: 20px;
  position: relative;
}

.archive-content {
  margin-top: 20px;
  position: relative;
}

@media screen and (max-width: 768px) {
  .archive-container {
    padding: 10px;
  }
}

.article-list {
  max-height: 300px;
  overflow-y: auto;
}

.article-item {
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  background-color: #f5f7fa;
}
</style> 