<template>
  <div class="w-full min-h-screen bg-gray-100  flex flex-col">
    <div class="w-full flex-1 flex flex-col px-2 sm:px-4 md:px-8 py-4 sm:py-8 gap-y-8">
      <!-- 页面标题 -->
      <div class="mb-6 flex flex-col items-center gap-4 sm:gap-6 w-full">
        <!-- 删除logo -->
        <div class="flex-1 w-full">
          <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-800 dark:text-white text-center">BeanBridge</h1>
          <div class="mt-2 sm:mt-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-sm flex justify-center">
            <div class="flex flex-col items-center">
              <div class="flex items-center justify-center">
                <p class="font-semibold mb-2 text-base text-yellow-800 dark:text-yellow-200">🔒 隐私安全提醒</p>
              </div>
              <p class="mb-2 leading-relaxed text-sm text-yellow-800 dark:text-yellow-200 text-center">
                账本是非常隐私的内容，建议从
                <a href="https://github.com/1677883418/beanBridge/releases" target="_blank" class="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium">GitHub Releases</a>
                下载离线版本使用，或使用
                <a href="https://github.com/deb-sig/double-entry-generator" target="_blank" class="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-medium">double-entry-generator</a>
                项目本地化运行。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 快速开始 -->
      <div class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-3xl shadow-2xl p-8 sm:p-12 text-white dark:text-white mb-8 w-full text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-900/30 dark:to-purple-900/30"></div>
        <div class="relative z-10">
          <h2 class="text-3xl sm:text-4xl font-bold mb-6">🚀 快速开始</h2>
          <p class="mb-8 text-lg sm:text-xl max-w-3xl mx-auto opacity-95">准备好开始了吗？选择您要处理的账单类型，上传文件即可开始转换。</p>
          <div class="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <router-link 
              to="/bill-processing"
              class="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold shadow-xl transition-all duration-300 w-full sm:w-auto transform hover:scale-105 hover:shadow-2xl border border-transparent dark:border-gray-700"
            >
              <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
              </svg>
              立即体验
            </router-link>
            <a 
              href="https://github.com/1677883418/beanBridge" 
              target="_blank"
              class="inline-flex items-center justify-center px-8 py-4 border-2 border-white dark:border-gray-700 text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-900 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-900 dark:hover:text-blue-200 font-semibold shadow-xl transition-all duration-300 w-full sm:w-auto transform hover:scale-105 hover:shadow-2xl"
            >
              <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              查看源码
            </a>
          </div>
        </div>
      </div>
      
      <!-- 功能卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-6 w-full">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 flex flex-col w-full cursor-pointer hover:shadow-2xl transition-shadow"
          @click="$router.push('/bill-processing')">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white ml-4 sm:ml-6">账单处理</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">上传并处理各种格式的账单文件，自动转换为Beancount格式。</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 flex flex-col w-full cursor-pointer hover:shadow-2xl transition-shadow"
          @click="$router.push('/rule-config')">
          <div class="flex items-center mb-4 sm:mb-6">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
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