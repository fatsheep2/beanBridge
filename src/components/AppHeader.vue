<template>
  <nav class="bg-indigo-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <img :src="logoPath" class="w-8 h-8 mr-2" alt="BeanBridge Logo" />
          <span class="text-xl font-bold">BeanBridge</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md hover:bg-indigo-500 focus:outline-none">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    

  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const mobileMenuOpen = ref(false);

// 获取正确的图标路径
const logoPath = computed(() => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}assets/icons/beancount.png`;
});

onMounted(() => {
  // 初始化主题
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script> 