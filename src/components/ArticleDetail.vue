<template>
  <div class="article-detail" v-if="article">
    <h1>{{ article.title }}</h1>
    <div class="article-meta">
      <span>发布时间：{{ formatDate(article.createdAt) }}</span>
    </div>
    <div class="article-content">
      {{ article.content }}
    </div>
    
    <!-- 评论区域 -->
    <div class="comment-section">
      <h3>评论</h3>
      <CommentForm 
        :targetId="article._id"
        targetType="article"
        @submit-success="fetchComments"
      />
      <CommentList 
        :targetId="article._id"
        targetType="article"
        ref="commentList"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CommentForm from './CommentForm.vue';
import CommentList from './CommentList.vue';

export default {
  name: 'ArticleDetail',
  components: {
    CommentForm,
    CommentList
  },
  data() {
    return {
      article: null
    };
  },
  methods: {
    async fetchArticle() {
      try {
        const id = this.$route.params.id;
        const response = await axios.get(`/api/articles/${id}`);
        this.article = response.data;
      } catch (error) {
        console.error('获取文章详情失败:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN');
    },
    fetchComments() {
      this.$refs.commentList?.fetchComments();
    }
  },
  created() {
    this.fetchArticle();
  }
};
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.article-meta {
  color: #666;
  margin-bottom: 30px;
}

.article-content {
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
}

.comment-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}
</style> 