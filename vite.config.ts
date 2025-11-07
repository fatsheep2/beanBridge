import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: any[] = [
    vue(),
    tailwindcss(),
  ]

  // 只在开发环境时动态导入 Vue DevTools，避免在 Node.js 环境中访问 localStorage
  if (process.env.NODE_ENV === 'development') {
    try {
      const vueDevTools = (await import('vite-plugin-vue-devtools')).default
      plugins.push(vueDevTools())
    } catch (e) {
      // 如果导入失败，忽略（不影响开发服务器启动）
      console.warn('Vue DevTools plugin failed to load, continuing without it')
    }
  }

  return {
    base: './',
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router']
          }
        }
      }
    }
  }
})
