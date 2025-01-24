<template>
  <div class="article-list">
    <div class="articles">
      <div v-for="article in articles" :key="article._id" class="article-item" @click="viewArticle(article._id)">
        <div class="article-date">• {{ formatDate(article.createdAt) }}</div>
        <h2 class="article-title">{{ article.title }}</h2>
      </div>
    </div>
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="page-btn">← 上一页</button>
      <span class="page-number">{{ currentPage }}</span>
      <button :disabled="!hasNextPage" @click="changePage(currentPage + 1)" class="page-btn">下一页 →</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ArticleList',
  data() {
    return {
      articles: [],
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false
    };
  },
  methods: {
    async fetchArticles() {
      try {
        const response = await axios.get(`/api/articles?page=${this.currentPage}&pageSize=${this.pageSize}`);
        this.articles = response.data.articles;
        this.hasNextPage = response.data.hasNextPage;
      } catch (error) {
        console.error('获取文章列表失败:', error);
      }
    },
    viewArticle(id) {
      this.$router.push(`/article/${id}`);
    },
    changePage(page) {
      this.currentPage = page;
      this.fetchArticles();
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  created() {
    this.fetchArticles();
  }
};
</script>

<style scoped>
.article-list {
  width: 100%;
  max-width: var(--content-max-width);
  padding: 0 20px;
}

.articles {
  margin-bottom: 40px;
}

.article-item {
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px 0;
}

.article-item:hover {
  padding-left: 10px;
}

.article-date {
  font-family: var(--font-serif);
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 0.2rem;
}

.article-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: #333;
  font-weight: normal;
  margin: 0;
  line-height: 1.6;
}

.article-item:hover .article-title {
  color: #000;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 3rem;
  font-family: var(--font-serif);
  padding-bottom: 40px;
}

.page-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  color: #666;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  font-family: var(--font-serif);
}

.page-btn:hover:not(:disabled) {
  color: #000;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-number {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .article-list {
    padding: 0 10px;
  }
}
</style> 