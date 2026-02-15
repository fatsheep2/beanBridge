import './assets/main.css'
// import './assets/fontawesome.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 在 Vue Router 初始化之前，确保路径已经正确更新
// 处理从 404.html 重定向过来的路径（如果还没有处理）
if (window.location.search && window.location.search.length > 1 && window.location.search[1] === '/') {
  const routePath = window.location.search.slice(2) // 跳过 '?/'
  const parts = routePath.split('&')
  const actualRoute = parts[0].replace(/~and~/g, '&')
  
  let newPath = window.location.pathname
  if (!newPath.endsWith('/')) {
    newPath += '/'
  }
  newPath += actualRoute
  
  const otherParams = parts.slice(1)
  if (otherParams.length > 0) {
    newPath += '?' + otherParams.join('&').replace(/~and~/g, '&')
  }
  
  console.log('[Main] Updating path from 404 redirect:', {
    original: window.location.pathname + window.location.search,
    new: newPath + window.location.hash,
    base: import.meta.env.BASE_URL
  })
  
  // 更新路径，Vue Router 会在初始化时读取
  window.history.replaceState(null, '', newPath + window.location.hash)
}

const app = createApp(App)

app.use(router)

// 等待路由准备就绪后再挂载，确保路由匹配正确
router.isReady().then(() => {
  console.log('[Main] Router ready, current route:', {
    path: router.currentRoute.value.path,
    fullPath: router.currentRoute.value.fullPath,
    matched: router.currentRoute.value.matched.map(r => r.path),
    base: import.meta.env.BASE_URL
  })
  app.mount('#app')
}).catch((err) => {
  console.error('[Main] Router initialization failed:', err)
  // 即使路由初始化失败，也尝试挂载应用
  app.mount('#app')
})
