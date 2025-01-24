import { createRouter, createWebHistory } from 'vue-router';
import ArticleList from '@/components/ArticleList.vue';
import ArticleDetail from '@/components/ArticleDetail.vue';
import ArticleForm from '@/components/ArticleForm.vue';
import DailyList from '../components/DailyList.vue';
import DailyForm from '../components/DailyForm.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ArticleList
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/new-article',
    name: 'NewArticle',
    component: ArticleForm
  },
  {
    path: '/daily',
    name: 'Daily',
    component: DailyList
  },
  {
    path: '/new-daily',
    name: 'NewDaily',
    component: DailyForm
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router; 