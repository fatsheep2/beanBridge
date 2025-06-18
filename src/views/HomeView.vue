<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">BeanBridge</h1>
        <p class="mt-2 text-gray-600">一个简单易用的工具，帮助您将银行对账单转换为Beancount格式，轻松管理个人财务。</p>
      </div>

            <!-- 快速开始 -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-8 text-white">
        <h2 class="text-2xl font-bold mb-4">快速开始</h2>
        <p class="mb-6">准备好开始了吗？选择您要处理的账单类型，上传文件即可开始转换。</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link 
            to="/test"
            class="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 font-medium"
          >
            <i class="fas fa-rocket mr-2"></i>
            立即体验
          </router-link>
          <a 
            href="https://github.com/your-repo/beancount-importer" 
            target="_blank"
            class="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-md hover:bg-white hover:text-blue-600 font-medium"
          >
            <i class="fab fa-github mr-2"></i>
            查看源码
          </a>
        </div>
      </div>

      <!-- 功能卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-file-upload text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 ml-4">账单处理</h3>
          </div>
          <p class="text-gray-600 mb-4">上传并处理各种格式的账单文件，自动转换为Beancount格式。</p>
          <router-link 
            to="/bill-processing"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            开始处理
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-cog text-green-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 ml-4">规则配置</h3>
          </div>
          <p class="text-gray-600 mb-4">配置数据源的处理规则和字段映射，提高转换准确性。</p>
          <router-link 
            to="/rule-config"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            配置规则
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>

        <!-- <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-flask text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 ml-4">功能测试</h3>
          </div>
          <p class="text-gray-600 mb-4">测试新功能和解析器，体验最新的转换能力。</p>
          <router-link 
            to="/test"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            开始测试
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div> -->
      </div>

      <!-- 支持的解析器 -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">支持的解析器</h2>
        <!-- 解析器选择组件 -->
        <ProviderSelector
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
      </div>



      <!-- Font Awesome 测试组件 -->
      <div class="mt-8">
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