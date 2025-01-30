<template>
  <div class="archive-timeline">
    <el-empty v-if="!articles.length" description="暂无文章" />
    <div v-else class="timeline-content">
      <div 
        v-for="yearGroup in articles" 
        :key="yearGroup.year"
        :id="'year-' + yearGroup.year"
        class="year-group"
      >
        <div class="year-header">
          {{ yearGroup.year }}年 <sup class="year-count">{{ yearGroup.count }}</sup>
        </div>
        <div class="article-list">
          <div 
            v-for="article in yearGroup.articles" 
            :key="article.id"
            class="article-item"
          >
            <span class="article-date">{{ formatDate(article.createdAt) }}</span>
            <router-link 
              :to="'/article/' + article.id"
              class="article-title"
            >
              {{ article.title }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchiveTimeline',
  props: {
    articles: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    formatDate(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.archive-timeline {
  flex: 1;
  padding: 0;
}

.timeline-content {
  max-width: 800px;
  margin: 0 auto;
}

.year-group {
  margin-bottom: 40px;
}

.year-header {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.year-count {
  font-size: 16px;
  color: #666;
  position: relative;
  top: 2px;
}

.article-list {
  padding-left: 24px;
}

.article-item {
  margin: 12px 0;
  display: flex;
  align-items: baseline;
  line-height: 1.8;
  position: relative;
}

.article-item::before {
  content: '•';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  color: #333;
  line-height: 1;
  height: 8px;
  display: flex;
  align-items: center;
}

.article-date {
  color: #333;
  margin-right: 16px;
  flex-shrink: 0;
  min-width: 95px;
  line-height: 1.2;
}

.article-title {
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  border-bottom: 1px dashed #999;
  padding-bottom: 1px;
  line-height: 1.2;
}

.article-title:hover {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

@media screen and (max-width: 768px) {
  .archive-timeline {
    padding: 0 20px;
  }
  
  .article-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .article-date {
    margin-bottom: 4px;
  }
}
</style> 