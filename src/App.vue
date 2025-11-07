<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
    <!-- Header -->
    <AppHeader />
    
    <!-- 主题切换按钮 - 现代化设计 -->
    <Transition name="fade">
      <button 
        @click="toggleDark" 
        class="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-white dark:bg-dark-100 shadow-lg hover:shadow-xl dark:shadow-dark-100/50 border border-gray-200 dark:border-dark-200 transition-all duration-300 hover:scale-110 active:scale-95 group"
        :class="{ 'animate-pulse-slow': isTogglingTheme }"
        :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
      >
        <Transition name="scale-in" mode="out-in">
          <span v-if="isDark" key="dark" class="block text-2xl">
            🌙
          </span>
          <span v-else key="light" class="block text-2xl">
            ☀️
          </span>
        </Transition>
        
        <!-- 涟漪效果 -->
        <span 
          v-if="isTogglingTheme"
          class="absolute inset-0 rounded-full bg-primary-400/20 dark:bg-primary-500/20 animate-ping"
        ></span>
      </button>
    </Transition>
    
    <!-- 主内容区域 -->
    <main class="flex-1">
      <Transition name="fade" mode="out-in">
        <router-view />
      </Transition>
    </main>
    
    <!-- 返回顶部按钮 -->
    <Transition name="slide-up">
      <button
        v-show="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm shadow-md hover:shadow-lg border border-gray-200 dark:border-dark-200 transition-all duration-300 hover:scale-110 active:scale-95"
        title="返回顶部"
      >
        <span class="material-icons text-primary-600 dark:text-primary-400">arrow_upward</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';

const isDark = ref(false);
const isTogglingTheme = ref(false);
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
  isTogglingTheme.value = true;
  isDark.value = !isDark.value;
  setHtmlDarkClass(isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  
  // 重置动画状态
  setTimeout(() => {
    isTogglingTheme.value = false;
  }, 600);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function handleScroll() {
  // 滚动超过 300px 时显示返回顶部按钮
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
    window.removeEventListener('scroll', handleScroll);
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  });
});
</script>

<style scoped>
/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
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