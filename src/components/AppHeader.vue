<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <img :src="logoPath" class="w-6 h-6" alt="Logo" @error="handleImageError" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              BeanBridge
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 -mt-1">账单转换工具</span>
          </div>
        </router-link>
        
        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link 
            to="/bill-processing"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            账单处理
          </router-link>
          <router-link 
            to="/rule-config"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            规则配置
          </router-link>
        </nav>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- 主题切换按钮 -->
          <n-button
            quaternary
            circle
            @click="toggleTheme"
            :title="themeMode === 'light' ? '浅色模式' : themeMode === 'dark' ? '深色模式' : '跟随系统'"
            class="hidden sm:flex"
          >
            <template #icon>
              <svg v-if="themeMode === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else-if="themeMode === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </template>
          </n-button>
          
          <a 
            href="https://github.com/fatsheep2/beanBridge" 
            target="_blank"
            rel="noopener noreferrer"
            class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span class="hidden lg:inline">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NButton } from 'naive-ui';
import { useTheme } from '../composables/useTheme';

const { themeMode, toggleTheme } = useTheme();

const logoPath = computed(() => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}logo.png`;
});

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};
</script>
