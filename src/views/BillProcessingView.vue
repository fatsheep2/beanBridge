<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
    <div class="bg-white shadow-2xl rounded-2xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-10">
      <h1 class="text-3xl font-extrabold mb-8">账单处理</h1>
      
      <!-- 文件上传组件 -->
      <FileUploadSection
        :selected-file="selectedFile"
        :detected-provider="detectedProvider"
        @file-selected="handleFileSelect"
      />

      <!-- 解析器选择组件 -->
      <ProviderSelector
        :supported-providers="providers"
        :selected-provider="selectedProvider"
        @provider-selected="setProvider"
      />

      <!-- 操作按钮 -->
      <div class="mb-8" v-if="hasDataSource || selectedProvider">
        <h2 class="text-xl font-bold mb-6">操作</h2>
        <div class="flex justify-between items-center gap-6">
          <div class="flex gap-6">
            <button
              @click="previewFile"
              :disabled="isProcessing"
              class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold shadow-md disabled:opacity-50 text-lg"
            >
              {{ isProcessing ? '处理中...' : '预览' }}
            </button>
            <button
              @click="processFile"
              :disabled="isProcessing"
              class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold shadow-md disabled:opacity-50 text-lg"
            >
              {{ isProcessing ? '处理中...' : '生成 Beancount' }}
            </button>
          </div>
          <div class="flex gap-6">
            <button
              @click="goToRuleConfig"
              class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 font-semibold shadow-md text-lg"
            >
              <span class="material-icons mr-3">settings</span>
              规则配置
            </button>
            <button
              @click="testRules"
              :disabled="isProcessing"
              class="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 font-semibold shadow-md disabled:opacity-50 text-lg"
            >
              <span class="material-icons mr-3">bug_report</span>
              测试规则
            </button>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="mb-8 p-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-lg font-semibold text-lg">
        {{ error }}
      </div>

      <!-- 结果展示组件 -->
      <ResultDisplay :processing-result="processingResult" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useDataSourceConfig } from '../composables/useDataSourceConfig';
import FileUploadSection from '../components/FileUploadSection.vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import ResultDisplay from '../components/ResultDisplay.vue';

const router = useRouter();

const {
  selectedFile,
  selectedProvider,
  detectedProvider,
  isProcessing,
  processingResult,
  error,
  providers,
  processFile,
  previewFile,
  testRules,
  hasDataSource,
  handleFileSelect,
  setProvider
} = useDataSourceConfig();

// 跳转到规则配置页面
const goToRuleConfig = () => {
  if (selectedProvider.value) {
    router.push({
      path: '/rule-config',
      query: { provider: selectedProvider.value }
    });
  } else {
    router.push('/rule-config');
  }
};
</script> 