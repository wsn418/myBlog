import { createRouter, createWebHistory } from 'vue-router';
import ArticleDetail from '@/components/ArticleDetail.vue';
import ArticleForm from '@/components/ArticleForm.vue';
import DailyList from '../components/DailyList.vue';
import DailyForm from '../components/DailyForm.vue';
import ArchivePage from '../views/Archive.vue';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail,
    props: true
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
  },
  {
    path: '/archive',
    name: 'ArchivePage',
    component: ArchivePage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router; 