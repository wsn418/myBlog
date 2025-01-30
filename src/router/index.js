import { createRouter, createWebHistory } from 'vue-router';
import ArticleDetail from '@/components/ArticleDetail.vue';
import ArticleForm from '@/components/ArticleForm.vue';
import DailyList from '../components/DailyList.vue';
import DailyForm from '../components/DailyForm.vue';
import ArchivePage from '../views/Archive.vue';
import Home from '@/views/Home.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ 
  showSpinner: false,  // 不显示加载圈
  minimum: 0.1,        // 降低最小百分比
  trickleSpeed: 200,   // 加快进度条速度
  speed: 300          // 减少动画时间
});

// 预加载后台路由
const AdminLayout = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Layout.vue');
const AdminDashboard = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Dashboard.vue');
const AdminArticles = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Articles.vue');
const AdminDaily = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Daily.vue');
const AdminTags = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Tags.vue');
const AdminLogin = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Login.vue');

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
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: AdminArticles
      },
      {
        path: 'articles/create',
        name: 'CreateArticle',
        component: () => import('@/views/admin/ArticleEdit.vue')
      },
      {
        path: 'articles/edit/:id',
        name: 'EditArticle',
        component: () => import('@/views/admin/ArticleEdit.vue'),
        props: true
      },
      {
        path: 'daily',
        name: 'AdminDaily',
        component: AdminDaily
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: AdminTags
      },
      {
        path: 'change-password',
        name: 'AdminChangePassword',
        component: () => import('@/views/admin/ChangePassword.vue')
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 只对后台路由显示加载状态
  if (to.path.startsWith('/admin')) {
    NProgress.start()
  }

  // 检查后台路由权限
  if (to.path.startsWith('/admin')) {
    const token = localStorage.getItem('token')
    if (!token && to.path !== '/admin/login') {
      next('/admin/login')
      return
    }
    
    if (token && to.path === '/admin/login') {
      next('/admin/dashboard')
      return
    }
  }
  
  next()
});

// 全局后置守卫
router.afterEach((to) => {
  if (to.path.startsWith('/admin')) {
    NProgress.done()
  }
});

export default router; 