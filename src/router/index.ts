import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/bill-processing',
    name: 'bill-processing',
    component: () => import('../views/DegBillProcessingView.vue'),
  },
  {
    path: '/bill-processing-old',
    name: 'bill-processing-old',
    component: () => import('../views/BillProcessingView.vue'),
  },
  {
    path: '/rule-config',
    name: 'rule-config',
    component: () => import('../views/YamlConfigView.vue'),
  },
  {
    path: '/rule-config-old',
    name: 'rule-config-old',
    component: () => import('../views/RuleConfigView.vue'),
  },
  // {
  //   path: '/blockchain-demo',
  //   name: 'blockchain-demo',
  //   component: () => import('../views/BlockchainDemoView.vue'),
  // },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (About.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import('../views/AboutView.vue'),
  // },
  // 404 路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/HomeView.vue'), // 暂时重定向到首页
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 添加路由调试信息（仅在开发环境）
if (import.meta.env.DEV) {
  router.beforeEach((to, from, next) => {
    console.log('[Router] Navigating:', {
      from: from.fullPath,
      to: to.fullPath,
      base: import.meta.env.BASE_URL,
      matched: to.matched.length > 0
    })
    next()
  })
  
  router.onError((error) => {
    console.error('[Router] Error:', error)
  })
}

export default router
