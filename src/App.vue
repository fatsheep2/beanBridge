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
    
    <!-- 返回顶部按钮 -->
    <Transition name="slide-up">
      <button
        v-show="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        title="返回顶部"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';

const showBackToTop = ref(false);

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
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
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
