import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/',
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'bill-processing',
        name: 'bill-processing',
        component: () => import('../views/DegBillProcessingView.vue'),
        meta: { title: '账单处理' },
      },
      {
        path: 'bill-processing-old',
        name: 'bill-processing-old',
        component: () => import('../views/BillProcessingView.vue'),
        meta: { title: '账单处理(旧)' },
      },
      {
        path: 'rule-config',
        name: 'rule-config',
        component: () => import('../views/YamlConfigView.vue'),
        meta: { title: '规则配置' },
      },
      {
        path: 'rule-config-old',
        name: 'rule-config-old',
        component: () => import('../views/RuleConfigView.vue'),
        meta: { title: '规则配置(旧)' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

if (import.meta.env.DEV) {
  router.beforeEach((to, from, next) => {
    console.log('[Router] Navigating:', { from: from.fullPath, to: to.fullPath })
    next()
  })
  router.onError((error) => {
    console.error('[Router] Error:', error)
  })
}

export default router
