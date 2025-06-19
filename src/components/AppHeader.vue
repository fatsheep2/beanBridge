<template>
  <nav class="bg-indigo-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <img src="/assets/icons/beancount.png" class="w-8 h-8 mr-2" alt="BeanBridge Logo" />
          <span class="text-xl font-bold">BeanBridge</span>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-center space-x-4">
            <a href="#" class="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700">首页</a>
            <a href="#" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">文档</a>
            <a href="#" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">社区</a>
            <a href="#" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">关于</a>
          </div>
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
    
    <!-- 移动端菜单 -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-indigo-700 pb-3 px-2">
      <a href="#" class="block px-3 py-2 rounded-md text-base font-medium bg-indigo-800">首页</a>
      <a href="#" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500">文档</a>
      <a href="#" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500">社区</a>
      <a href="#" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500">关于</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const mobileMenuOpen = ref(false);

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