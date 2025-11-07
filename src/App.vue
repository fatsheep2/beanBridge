<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header -->
    <AppHeader />
    
    <!-- 主内容区域 -->
    <main class="flex-1">
      <Transition name="fade" mode="out-in">
        <router-view />
      </Transition>
    </main>
    
    <!-- 浮动按钮组 -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <!-- 主题切换按钮 -->
      <button 
        @click="toggleDark" 
        class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
      >
        <Transition name="scale-in" mode="out-in">
          <svg v-if="isDark" key="dark" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else key="light" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </Transition>
      </button>
      
      <!-- 返回顶部按钮 -->
      <Transition name="slide-up">
        <button
          v-show="showBackToTop"
          @click="scrollToTop"
          class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          title="返回顶部"
        >
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';

const isDark = ref(false);
const showBackToTop = ref(false);

function setHtmlDarkClass(val: boolean) {
  const html = document.documentElement;
  if (val) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

function toggleDark() {
  isDark.value = !isDark.value;
  setHtmlDarkClass(isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

onMounted(() => {
  // 初始化主题
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    isDark.value = true;
    setHtmlDarkClass(true);
  } else if (saved === 'light') {
    isDark.value = false;
    setHtmlDarkClass(false);
  } else {
    // 跟随系统
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    setHtmlDarkClass(prefersDark);
  }
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches;
      setHtmlDarkClass(e.matches);
    }
  };
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // 清理函数
  onUnmounted(() => {
    window.addEventListener('scroll', handleScroll);
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  });
});
</script>

<style scoped>
/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 主题切换动画 */
.scale-in-enter-active {
  animation: scaleIn 0.3s ease-out;
}

.scale-in-leave-active {
  animation: scaleIn 0.3s ease-out reverse;
}

@keyframes scaleIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 返回顶部按钮动画 */
.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideUp 0.3s ease-out reverse;
}

@keyframes slideUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
