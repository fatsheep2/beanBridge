<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">导出Beancount文件</h2>
    <p class="text-gray-600 mb-6">检查并导出您的交易记录到Beancount格式</p>
    
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-800">导入摘要</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-3 rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">交易数量</p>
          <p class="text-xl font-semibold">{{ transactions.length }}</p>
        </div>
        <div class="bg-white p-3 rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">总金额</p>
          <p class="text-xl font-semibold">{{ formatCurrency(totalAmount) }}</p>
        </div>
        <div class="bg-white p-3 rounded-lg shadow-sm">
          <p class="text-sm text-gray-500">时间范围</p>
          <p class="text-xl font-semibold">{{ timeRange }}</p>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Beancount文件内容</label>
      <div class="relative">
        <textarea v-model="beancountOutput" rows="12" class="w-full rounded-md border-gray-300 shadow-sm font-mono text-sm"></textarea>
        <button @click="copyToClipboard" class="absolute top-2 right-2 p-1 bg-gray-100 rounded-md hover:bg-gray-200">
          <i class="fas fa-copy text-gray-600"></i>
        </button>
      </div>
    </div>
    
    <div class="space-y-4">
      <div class="flex items-center">
        <input id="include-header" type="checkbox" v-model="includeHeader" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
        <label for="include-header" class="ml-2 block text-sm text-gray-700">包含文件头信息</label>
      </div>
      <div class="flex items-center">
        <input id="group-by-date" type="checkbox" v-model="groupByDate" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
        <label for="group-by-date" class="ml-2 block text-sm text-gray-700">按日期分组交易</label>
      </div>
    </div>
    
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <button @click="downloadBeancount" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
        <i class="fas fa-download mr-2"></i>下载文件
      </button>
      <button @click="copyToClipboard" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
        <i class="fas fa-copy mr-2"></i>复制到剪贴板
      </button>
      <button @click="saveToCloud" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
        <i class="fas fa-cloud-upload-alt mr-2"></i>保存到云端
      </button>
    </div>
    
    <div class="mt-6 flex justify-between">
      <button @click="$emit('prev-step')" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
        上一步
      </button>
      <button @click="finishImport" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
        完成导入
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Transaction } from '../utils/data-converter';
import { DataConverter } from '../utils/data-converter';

interface Props {
  transactions: Transaction[];
}

const props = defineProps<Props>();

defineEmits<{
  'prev-step': [];
  'finish': [];
}>();

const includeHeader = ref(true);
const groupByDate = ref(true);
const beancountOutput = ref('');

const dataConverter = new DataConverter();

const totalAmount = computed(() => {
  return props.transactions.reduce((sum, t) => sum + t.amount, 0);
});

const timeRange = computed(() => {
  if (props.transactions.length === 0) return '无数据';
  
  const dates = props.transactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
});

// 监听交易变化，重新生成Beancount输出
watch(() => props.transactions, () => {
  generateBeancountOutput();
}, { deep: true, immediate: true });

const generateBeancountOutput = () => {
  if (props.transactions.length === 0) {
    beancountOutput.value = '';
    return;
  }

  const ir = {
    transactions: props.transactions,
    accounts: Array.from(new Set(props.transactions.map(t => t.account))),
    currencies: ['CNY']
  };

  beancountOutput.value = dataConverter.convertToBeancount(ir, {
    includeHeader: includeHeader.value,
    groupByDate: groupByDate.value
  });
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(beancountOutput.value);
    alert('已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    alert('复制失败，请手动复制');
  }
};

const downloadBeancount = () => {
  const blob = new Blob([beancountOutput.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `beancount-${new Date().toISOString().split('T')[0]}.bean`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const saveToCloud = () => {
  alert('功能开发中，即将推出云端保存功能');
};

const finishImport = () => {
  alert('导入完成！');
  // 这里可以添加保存配置到本地存储的逻辑
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
};
</script> 