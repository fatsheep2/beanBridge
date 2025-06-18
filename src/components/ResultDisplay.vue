<template>
  <div v-if="processingResult" class="mb-6">
    <h2 class="text-lg font-semibold mb-4 dark:bg-gray-800">处理结果</h2>
    
    <!-- 统计信息 -->
    <div v-if="processingResult.statistics" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
      <h3 class="font-medium mb-2">统计信息</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600 dark:text-gray-300">解析项目:</span>
          <span class="font-medium">{{ processingResult.statistics.parsedItems }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-300">收入记录:</span>
          <span class="font-medium">{{ processingResult.statistics.totalInRecords }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-300">支出记录:</span>
          <span class="font-medium">{{ processingResult.statistics.totalOutRecords }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-300">解析器:</span>
          <span class="font-medium">{{ processingResult.provider }}</span>
        </div>
      </div>
    </div>

    <!-- 生成的 Beancount 数据 -->
    <div v-if="processingResult.data && typeof processingResult.data === 'string'" class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-medium">生成的 Beancount 数据</h3>
        <div class="flex gap-2">
          <button
            @click="copyToClipboard(processingResult.data)"
            class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            <i class="fas fa-copy mr-1"></i>复制
          </button>
          <button
            @click="downloadResult"
            class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            <i class="fas fa-download mr-1"></i>下载
          </button>
        </div>
      </div>
      <div class="relative">
        <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">{{ processingResult.data }}</pre>
        <div v-if="copySuccess" class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          已复制！
        </div>
      </div>
    </div>

    <!-- 原始数据预览 -->
    <div v-if="processingResult.data && typeof processingResult.data === 'object' && processingResult.data.orders" class="mb-4">
      <h3 class="font-medium mb-2">原始数据预览</h3>
      <div class="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
        <div v-for="(order, index) in processingResult.data.orders" :key="index" class="mb-2 p-2 bg-white dark:bg-gray-800 rounded">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div><strong>日期:</strong> {{ formatDate(order.payTime) }}</div>
            <div><strong>对方:</strong> {{ order.peer }}</div>
            <div><strong>金额:</strong> {{ order.money }} {{ order.currency }}</div>
            <div><strong>类型:</strong> {{ order.type }}</div>
            <div class="md:col-span-2"><strong>说明:</strong> {{ order.note }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ProcessingResult {
  success: boolean;
  data?: string | any;
  error?: string;
  statistics?: any;
  provider?: string;
}

interface Props {
  processingResult: ProcessingResult | null;
}

const props = defineProps<Props>();

const copySuccess = ref(false);

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  }
};

const downloadResult = () => {
  if (!props.processingResult?.data || typeof props.processingResult.data !== 'string') {
    return;
  }

  const blob = new Blob([props.processingResult.data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `beancount_${new Date().toISOString().split('T')[0]}.beancount`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN');
};
</script> 