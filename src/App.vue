<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <div 
      id="app" 
      :class="[
        'min-h-screen flex flex-col transition-colors duration-300',
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      ]"
    >
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
        <n-button
          v-show="showBackToTop"
          @click="scrollToTop"
          type="primary"
          circle
          size="large"
          class="fixed bottom-6 right-6 z-50 shadow-lg"
          title="返回顶部"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </template>
        </n-button>
      </Transition>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { NConfigProvider, NButton } from 'naive-ui';
import AppHeader from './components/AppHeader.vue';
import { useTheme } from './composables/useTheme';

const { theme, isDark } = useTheme();

const showBackToTop = ref(false);

// 主题覆盖配置
const themeOverrides = computed(() => {
  return {};
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

// 同步暗色模式到 HTML 元素
watch(isDark, (dark) => {
  if (typeof document !== 'undefined') {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}, { immediate: true });

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
