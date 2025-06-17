<template>
  <nav class="bg-indigo-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <i class="fa-solid fa-coins text-2xl mr-2"></i>
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
        <div class="md:hidden">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md hover:bg-indigo-500 focus:outline-none">
            <i class="fas fa-bars"></i>
          </button>
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
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script> 