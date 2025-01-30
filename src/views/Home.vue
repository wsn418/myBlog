<template>
  <div class="home">
    <!-- 欢迎语 -->
    <div class="welcome-text">
      我们一生好像只为了几件事: 奋笔疾书的高考，短暂的春节返乡，挥手离别的不舍，满怀期待的节假日，一周疲惫上班后的双休以及每天下班前的倒计时。
    </div>

    <div class="divider"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- 文章列表 -->
    <div v-else class="article-list">
      <div class="article-row" v-for="(pair, index) in articlePairs" :key="index">
        <div v-for="article in pair" :key="article.id" class="article-item">
          <div class="article-meta">
            <span class="article-date">• {{ article.createdAt }}</span>
            <router-link :to="`/article/${article.id}`" class="article-title">
              {{ article.title }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRecentArticles } from '@/api'

export default {
  name: 'HomePage',
  data() {
    return {
      articles: [],
      loading: true,
      error: null
    }
  },
  computed: {
    articlePairs() {
      const pairs = []
      for (let i = 0; i < this.articles.length; i += 2) {
        pairs.push(this.articles.slice(i, i + 2))
      }
      return pairs
    }
  },
  async created() {
    try {
      this.loading = true
      const response = await getRecentArticles()
      console.log('Received articles:', response.articles)
      this.articles = response.articles
    } catch (error) {
      console.error('Failed to fetch recent articles:', error)
      this.error = '加载文章失败，请稍后重试'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.home {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 30px;
  color: var(--text-secondary);
  text-align: justify;
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.article-item {
  flex: 1;
  min-width: 0;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.article-date {
  font-size: 1rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.article-title {
  font-size: 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-title:hover {
  color: #000;
  border-bottom-style: solid;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.error {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .article-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .article-title {
    white-space: normal;
  }
}
</style> 