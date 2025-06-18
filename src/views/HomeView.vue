<template>
  <div class="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
    <div class="w-full flex-1 flex flex-col px-2 sm:px-4 md:px-8 py-4 sm:py-8 gap-y-8">
      <!-- 页面标题 -->
      <div class="mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
        <img src="./assets/icons/beancount.png" class="w-16 h-16 sm:w-20 sm:h-20" alt="BeanBridge Logo" />
        <div class="flex-1 w-full">
          <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-800 dark:text-white">BeanBridge</h1>
          <p class="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300">一个简单易用的工具，帮助您将银行对账单转换为Beancount格式，轻松管理个人财务。</p>
        </div>
      </div>
      <!-- 快速开始 -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-12 text-white mb-6 w-full">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">快速开始</h2>
        <p class="mb-4 sm:mb-8 text-base sm:text-lg">准备好开始了吗？选择您要处理的账单类型，上传文件即可开始转换。</p>
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
          <router-link 
            to="/bill-processing"
            class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold shadow-lg transition-all duration-150 w-full sm:w-auto"
          >
            <i class="fas fa-rocket mr-2 sm:mr-3"></i>
            立即体验
          </router-link>
          <a 
            href="https://github.com/your-repo/beancount-importer" 
            target="_blank"
            class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 font-semibold shadow-lg transition-all duration-150 w-full sm:w-auto"
          >
            <i class="fab fa-github mr-2 sm:mr-3"></i>
            查看源码
          </a>
        </div>
      </div>
      <!-- 功能卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-6 w-full">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 flex flex-col w-full cursor-pointer hover:shadow-2xl transition-shadow"
          @click="$router.push('/bill-processing')">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <i class="fas fa-file-upload text-blue-600 text-2xl sm:text-3xl"></i>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white ml-4 sm:ml-6">账单处理</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">上传并处理各种格式的账单文件，自动转换为Beancount格式。</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 flex flex-col w-full cursor-pointer hover:shadow-2xl transition-shadow"
          @click="$router.push('/rule-config')">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <i class="fas fa-cog text-green-600 text-2xl sm:text-3xl"></i>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white ml-4 sm:ml-6">规则配置</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">配置数据源的处理规则和字段映射，提高转换准确性。</p>
        </div>
      </div>
      <!-- 支持的解析器 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 mb-6 w-full">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">支持的解析器</h2>
        <ProviderSelector
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
      </div>
      <!-- Font Awesome 测试组件 -->
      <div class="mt-8 sm:mt-12 w-full">
        <IconTest />
      </div>
    </div>
    <div id="busuanzi_container_site_uv" class="flex items-center justify-center mt-8 text-gray-700 dark:text-gray-300 text-base sm:text-lg">
      <!-- 使用SVG图标替代Font Awesome，避免图标不显示问题 -->

      <span class="flex items-center justify-center">
        <svg class="mr-2 text-blue-500" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.16 13.66 18 14.84 18 16.5V19h6v-2.5c0-2.33-4.67-3.5-6-3.5z"/>
      </svg>
        本站已经服务过
        <span
          id="busuanzi_value_site_uv"
          class="font-bold text-blue-600 dark:text-blue-400 mx-1 inline-flex items-center justify-center min-w-[2.5em] text-center align-middle"
          style="vertical-align:middle;"
        >xx</span>
        位用户啦
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简化的首页视图
import { ref } from 'vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import { providers } from '../data/providers';
import { ProviderType } from '../types/provider';

// 响应式数据
const supportedProviders = ref(providers);
const selectedProvider = ref<ProviderType | null>(null);

// 方法
const setProvider = (providerType: ProviderType) => {
  selectedProvider.value = providerType;
};
</script> 