<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <footer class="bg-gray-800 text-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">BeanBridge</h3>
            <p class="text-gray-400">一个简单易用的工具，帮助您将银行对账单转换为Beancount格式，轻松管理个人财务。</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">快速链接</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white">文档</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">GitHub仓库</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Beancount官网</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">常见问题</a></li>
            </ul>
          </div>
          <!-- <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <ul class="space-y-2">
              <li class="flex items-center"><i class="fas fa-envelope mr-2 text-gray-400"></i> <a href="mailto:support@beancount-importer.com" class="text-gray-400 hover:text-white">support@beancount-importer.com</a></li>
              <li class="flex items-center"><i class="fab fa-github mr-2 text-gray-400"></i> <a href="#" class="text-gray-400 hover:text-white">GitHub</a></li>
              <li class="flex items-center"><i class="fab fa-twitter mr-2 text-gray-400"></i> <a href="#" class="text-gray-400 hover:text-white">Twitter</a></li>
            </ul>
          </div> -->
        </div>
        <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© 2023 BeanBridge. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>