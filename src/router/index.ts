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
    component: () => import('../views/BillProcessingView.vue'),
  },
  {
    path: '/rule-config',
    name: 'rule-config',
    component: () => import('../views/RuleConfigView.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/TestPage.vue'),
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (About.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import('../views/AboutView.vue'),
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
