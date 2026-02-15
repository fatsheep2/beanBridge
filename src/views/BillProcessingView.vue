<template>
  <div class="w-full px-4 sm:px-8 lg:px-12 py-10">
    <n-card>
      <h1 class="text-3xl font-extrabold mb-8">账单处理</h1>
      
      <!-- 解析器选择组件 -->
      <ProviderSelector
        :supported-providers="providers"
        :selected-provider="selectedProvider"
        @provider-selected="setProvider"
      />

      <!-- 数据源输入组件 -->
      <div v-if="selectedProvider">
        <!-- 区块链数据源输入 -->
        <BlockchainDataSourceInput
          v-if="isCryptoProvider"
          :selected-provider="selectedProvider"
          @data-source-configured="handleBlockchainDataSource"
          ref="blockchainDataSourceRef"
        />

        <!-- 文件上传组件 -->
        <FileUploadSection
          v-else
          :selected-file="selectedFile"
          :detected-provider="detectedProvider"
          @file-selected="handleFileSelect"
        />
      </div>

      <!-- 元数据选项 -->
      <div class="mb-8" v-if="hasDataSource || selectedProvider">
        <h2 class="text-xl font-bold mb-4">元数据选项</h2>
        <n-checkbox-group v-model:value="selectedMetadata">
          <div class="flex flex-wrap gap-4">
            <n-checkbox
              v-for="opt in metadataOptions"
              :key="opt.key"
              :value="opt.key"
              :label="opt.label"
            />
          </div>
        </n-checkbox-group>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-8" v-if="hasDataSource || selectedProvider">
        <h2 class="text-xl font-bold mb-6">操作</h2>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex flex-wrap gap-3">
            <n-button
              type="success"
              size="large"
              @click="previewFile(selectedMetadata)"
              :loading="isProcessing"
              :disabled="!canProcess"
            >
              {{ isProcessing ? '处理中...' : '预览' }}
            </n-button>
            <n-button
              type="primary"
              size="large"
              @click="processFile(selectedMetadata)"
              :loading="isProcessing"
              :disabled="!canProcess"
            >
              {{ isProcessing ? '处理中...' : '生成 Beancount' }}
            </n-button>
          </div>
          <div class="flex flex-wrap gap-3">
            <n-button
              size="large"
              @click="goToRuleConfig"
            >
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </template>
              规则配置
            </n-button>
            <n-button
              type="warning"
              size="large"
              @click="testRules"
              :disabled="!canProcess"
            >
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </template>
              测试规则
            </n-button>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <n-alert
        v-if="error"
        type="error"
        title="错误"
        class="mb-8"
        closable
        @close="clearError"
      >
        {{ error }}
      </n-alert>

      <!-- 结果展示组件 - 只在没有测试规则结果时显示 -->
      <ResultDisplay v-if="!ruleTestResult" :processing-result="processingResult" />

      <!-- 测试规则结果 - 只在有测试规则结果时显示 -->
      <n-card v-if="ruleTestResult" title="测试规则结果" class="mb-6">
        <template #header-extra>
          <n-button quaternary circle @click="clearRuleTestResult">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </template>
          </n-button>
        </template>
        <div class="relative">
          <n-code :code="ruleTestResult.data" language="text" :show-line-numbers="false" />
          <div class="absolute top-2 right-2">
            <n-button size="small" @click="copyToClipboard(ruleTestResult.data)">
              <template #icon>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </template>
              复制
            </n-button>
          </div>
        </div>
      </n-card>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { NCard, NButton, NCheckbox, NCheckboxGroup, NAlert, NCode } from 'naive-ui';
import { useDataSourceConfig } from '../composables/useDataSourceConfig';
import FileUploadSection from '../components/FileUploadSection.vue';
import ProviderSelector from '../components/ProviderSelector.vue';
import BlockchainDataSourceInput from '../components/BlockchainDataSourceInput.vue';
import ResultDisplay from '../components/ResultDisplay.vue';
import { onMounted, ref, computed } from 'vue';
import { CryptoProviderFactory } from '../providers/factories/crypto-provider-factory';

const router = useRouter();
const route = useRoute();

const {
  selectedFile,
  selectedProvider,
  detectedProvider,
  isProcessing,
  processingResult,
  ruleTestResult,
  error,
  providers,
  processFile,
  previewFile,
  testRules,
  hasDataSource,
  handleFileSelect,
  setProvider,
  clearFileState,
  handleBlockchainDataSource
} = useDataSourceConfig();

// 区块链数据源引用
const blockchainDataSourceRef = ref();

// 检查是否为加密货币提供者
const isCryptoProvider = computed(() => {
  return selectedProvider.value ? CryptoProviderFactory.isCryptoProvider(selectedProvider.value) : false;
});

// 检查是否可以处理
const canProcess = computed(() => {
  if (isCryptoProvider.value) {
    return blockchainDataSourceRef.value?.getConfig() && !isProcessing.value;
  }
  return (selectedFile.value && selectedProvider.value && !isProcessing.value) ||
    (processingResult.value && selectedProvider.value && !isProcessing.value);
});

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

// 清除测试规则结果
const clearRuleTestResult = () => {
  ruleTestResult.value = null;
};

// 清除错误
const clearError = () => {
  if (error && typeof error === 'object' && 'value' in error) {
    (error as { value: string }).value = '';
  }
};

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // 可以添加一个简单的提示
  } catch (err) {
    console.error('复制失败:', err);
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

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