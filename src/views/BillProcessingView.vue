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

      <!-- 元数据选项 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-2">元数据选项</h2>
        <div class="flex flex-wrap gap-4">
          <label v-for="opt in metadataOptions" :key="opt.key" class="flex items-center space-x-2">
            <input type="checkbox" v-model="selectedMetadata" :value="opt.key" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-8" v-if="hasDataSource || selectedProvider">
        <h2 class="text-xl font-bold mb-6">操作</h2>
        <div class="flex justify-between items-center gap-6">
          <div class="flex gap-6">
            <button
              @click="previewFile(selectedMetadata)"
              :disabled="isProcessing"
              class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold shadow-md disabled:opacity-50 text-lg"
            >
              {{ isProcessing ? '处理中...' : '预览' }}
            </button>
            <button
              @click="processFile(selectedMetadata)"
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
import { useRouter, useRoute } from 'vue-router';
import { useDataSourceConfig } from '../composables/useDataSourceConfig';
import FileUploadSection from '../components/FileUploadSection.vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import ResultDisplay from '../components/ResultDisplay.vue';
import { onMounted, ref, computed } from 'vue';

const router = useRouter();
const route = useRoute();

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
  setProvider,
  clearFileState
} = useDataSourceConfig();

// 元数据选项
const metadataOptions = [
  { key: 'summary', label: '摘要' },
  { key: 'peerAccount', label: '对方账号' },
  { key: 'peerName', label: '对方户名' },
  { key: 'tradeLocation', label: '交易地点' },
  { key: 'balance', label: '账户余额' },
  { key: 'payTime', label: '交易时间' },
];
const selectedMetadata = ref(metadataOptions.map(opt => opt.key)); // 默认全部勾选

// 跳转到规则配置页面
const goToRuleConfig = () => {
  if (selectedProvider.value) {
    router.push({
      path: '/rule-config',
      query: { provider: selectedProvider.value, from: 'bill-processing' }
    });
  } else {
    router.push({ path: '/rule-config', query: { from: 'bill-processing' } });
  }
};

// 跳转到调试规则页面（如有单独页面可加from参数）
// ... existing code ...

// 组件挂载时检查是否需要清除缓存
onMounted(() => {
  // 只有首次进入且没有from参数时才清理缓存
  if (!route.query.from) {
    clearFileState();
  }
  // 移除from参数，避免后续影响
  if (route.query.from) {
    router.replace({ path: '/bill-processing', query: {} });
  }
});
</script> 