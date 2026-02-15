<template>
  <div class="w-full px-4 sm:px-8 lg:px-12 py-10">
    <div class="card-wrap">
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
        <van-checkbox-group v-model="selectedMetadata" direction="horizontal">
            <van-checkbox
              v-for="opt in metadataOptions"
              :key="opt.key"
              :name="opt.key"
            >
              {{ opt.label }}
            </van-checkbox>
          </van-checkbox-group>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-8" v-if="hasDataSource || selectedProvider">
        <h2 class="text-xl font-bold mb-6">操作</h2>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex flex-wrap gap-3">
            <van-button
              type="success"
              size="large"
              @click="previewFile(selectedMetadata)"
              :loading="isProcessing"
              :disabled="!canProcess"
            >
              {{ isProcessing ? '处理中...' : '预览' }}
            </van-button>
            <van-button
              type="primary"
              size="large"
              @click="processFile(selectedMetadata)"
              :loading="isProcessing"
              :disabled="!canProcess"
            >
              {{ isProcessing ? '处理中...' : '生成 Beancount' }}
            </van-button>
          </div>
          <div class="flex flex-wrap gap-3">
            <van-button size="large" @click="goToRuleConfig">规则配置</van-button>
            <van-button type="warning" size="large" @click="testRules" :disabled="!canProcess">测试规则</van-button>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <van-notice-bar v-if="error" type="danger" left-icon="warning-o" class="mb-8">
        {{ error }}
      </van-notice-bar>

      <!-- 结果展示组件 - 只在没有测试规则结果时显示 -->
      <ResultDisplay v-if="!ruleTestResult" :processing-result="processingResult" />

      <!-- 测试规则结果 - 只在有测试规则结果时显示 -->
      <div v-if="ruleTestResult" class="card-wrap mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">测试规则结果</h3>
          <div class="flex gap-2">
            <van-button size="small" plain @click="clearRuleTestResult">关闭</van-button>
            <van-button size="small" @click="copyToClipboard(ruleTestResult.data)">复制</van-button>
          </div>
        </div>
        <pre class="p-4 bg-gray-1 rounded text-sm overflow-auto">{{ ruleTestResult.data }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
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

<style scoped>
.card-wrap {
  background: var(--van-cell-group-background, #fff);
  border-radius: var(--van-radius-lg, 12px);
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
</style> 