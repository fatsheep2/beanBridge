<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-12">
      
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="inline-block mb-4">
          <span class="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
            ✨ 简单、安全、高效
          </span>
        </div>
        <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            BeanBridge
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          将各类账单文件快速转换为 Beancount 格式<br/>支持多种数据源，配置灵活，完全本地化处理
        </p>
        
        <!-- Quick Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link 
            to="/bill-processing"
            class="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            开始使用
          </router-link>
          <a 
            href="https://github.com/fatsheep2/beanBridge" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            查看源码
          </a>
        </div>
      </div>
      
      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <router-link 
          to="/bill-processing"
          class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">账单处理</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              上传账单文件，自动识别格式并转换为 Beancount 记录
            </p>
            <div class="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
              <span>立即开始</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>
        
        <router-link 
          to="/rule-config"
          class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">规则配置</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              自定义解析规则和账户映射，精确控制转换逻辑
            </p>
            <div class="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-medium">
              <span>配置规则</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>
        
        <a 
          href="https://deb-sig.github.io/double-entry-generator/" 
          target="_blank"
          rel="noopener noreferrer"
          class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative">
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">开发文档</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              查看完整的 API 文档和使用示例，贡献代码
            </p>
            <div class="mt-4 flex items-center text-green-600 dark:text-green-400 font-medium">
              <span>查看文档</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      </div>
      
      <!-- Privacy Notice -->
      <div class="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800/50 rounded-3xl p-8 mb-20 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-800/10 rounded-full -mr-32 -mt-32"></div>
        <div class="relative flex items-start gap-6">
          <div class="flex-shrink-0">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-3">🔒 隐私安全提醒</h3>
            <p class="text-base text-yellow-800 dark:text-yellow-300 leading-relaxed">
              账本数据非常隐私，建议从 
              <a href="https://github.com/1677883418/beanBridge/releases" target="_blank" class="underline font-semibold hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors">GitHub Releases</a>
              下载离线版本使用，或使用
              <a href="https://github.com/deb-sig/double-entry-generator" target="_blank" class="underline font-semibold hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors">double-entry-generator</a>
              本地运行。所有数据处理均在浏览器本地完成，不会上传到服务器。
            </p>
          </div>
        </div>
      </div>
      
      <!-- Supported Providers -->
      <div class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">支持的数据源</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400">已支持 14+ 种主流支付和金融平台</p>
        </div>
        <ProviderSelector
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
      </div>
      
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import { providers } from '../data/providers';
import { ProviderType } from '../types/provider';

const supportedProviders = ref(providers);
const selectedProvider = ref<ProviderType | null>(null);

const setProvider = (providerType: ProviderType) => {
  selectedProvider.value = providerType;
};
</script>
