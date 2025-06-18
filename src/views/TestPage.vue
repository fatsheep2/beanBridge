<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-6">BeanBridge 测试页面</h1>
      
      <!-- 文件上传组件 -->
      <FileUploadSection
        :selected-file="selectedFile"
        :detected-provider="detectedProvider"
        @file-selected="handleFileSelect"
      />

      <!-- 解析器选择组件 -->
      <ProviderSelector
        :supported-providers="supportedProviders"
        :selected-provider="selectedProvider"
        @provider-selected="setProvider"
      />

      <!-- 操作按钮 -->
      <div class="mb-6" v-if="canProcess">
        <h2 class="text-lg font-semibold mb-4">操作</h2>
        <div class="flex gap-4">
          <button
            @click="previewFile"
            :disabled="isProcessing"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ isProcessing ? '处理中...' : '预览' }}
          </button>
          <button
            @click="processFile"
            :disabled="isProcessing"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ isProcessing ? '处理中...' : '生成 Beancount' }}
          </button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <!-- 结果展示组件 -->
      <ResultDisplay :processing-result="processingResult" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfig } from '../composables/useDataSourceConfig';
import FileUploadSection from '../components/FileUploadSection.vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import ResultDisplay from '../components/ResultDisplay.vue';

const {
  selectedFile,
  detectedProvider,
  selectedProvider,
  isProcessing,
  processingResult,
  error,
  supportedProviders,
  canProcess,
  handleFileSelect,
  setProvider,
  processFile,
  previewFile
} = useDataSourceConfig();
</script> 