<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- 返回首页按钮 -->
      <div class="mb-6">
        <button 
          @click="goHome"
          class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          返回首页
        </button>
      </div>

      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">账单处理</h1>
        <p class="mt-2 text-gray-600">上传并处理各种格式的账单文件</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <div 
              :class="[
                'flex items-center justify-center w-10 h-10 rounded-full border-2',
                currentStep >= 0 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500'
              ]"
            >
              <span class="text-sm font-medium">1</span>
            </div>
            <div 
              :class="[
                'flex-1 h-1',
                currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-300'
              ]"
            ></div>
            <div 
              :class="[
                'flex items-center justify-center w-10 h-10 rounded-full border-2',
                currentStep >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500'
              ]"
            >
              <span class="text-sm font-medium">2</span>
            </div>
            <div 
              :class="[
                'flex-1 h-1',
                currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'
              ]"
            ></div>
            <div 
              :class="[
                'flex items-center justify-center w-10 h-10 rounded-full border-2',
                currentStep >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500'
              ]"
            >
              <span class="text-sm font-medium">3</span>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-4 space-x-16">
          <span :class="['text-sm', currentStep >= 0 ? 'text-indigo-600 font-medium' : 'text-gray-500']">选择数据源</span>
          <span :class="['text-sm', currentStep >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500']">上传文件</span>
          <span :class="['text-sm', currentStep >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500']">处理结果</span>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="bg-white rounded-lg shadow">
        <!-- 步骤1：数据源选择 -->
        <div v-if="currentStep === 0" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">选择数据源</h2>
            <p class="text-gray-600">请选择您要处理的账单数据源类型</p>
          </div>
          
          <DataSourceSelector
            :onDataSourceSelected="handleDataSourceSelected"
            :onEditConfig="handleEditConfig"
          />
          
          <div class="flex justify-end mt-8">
            <button 
              @click="nextStep"
              :disabled="!selectedDataSource"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- 步骤2：文件上传 -->
        <div v-if="currentStep === 1" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">上传文件</h2>
            <p class="text-gray-600">请上传您的账单文件</p>
            <div v-if="selectedDataSource" class="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
              <i class="fas fa-database mr-2"></i>
              已选择：{{ selectedDataSource.name }}
            </div>
          </div>
          
          <FileUpload 
            :onFileUploaded="handleFileUploaded"
            :selectedDataSource="selectedDataSource"
          />
          
          <div class="flex justify-between mt-8">
            <button 
              @click="prevStep"
              class="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              上一步
            </button>
            <button 
              @click="nextStep"
              :disabled="!fileData"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- 步骤3：处理结果 -->
        <div v-if="currentStep === 2" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">处理结果</h2>
            <p class="text-gray-600">文件解析完成，请查看处理结果</p>
          </div>
          
          <div v-if="fileData" class="space-y-6">
            <!-- 文件信息 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">文件信息</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span class="text-gray-500 text-sm">文件名</span>
                  <p class="font-medium">{{ fileData.file?.name }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-sm">数据源</span>
                  <p class="font-medium">{{ selectedDataSource?.name || fileData.provider || '未知' }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-sm">字段数</span>
                  <p class="font-medium">{{ fileData.headers?.length || 0 }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-sm">记录数</span>
                  <p class="font-medium">{{ fileData.rows?.length || 0 }}</p>
                </div>
              </div>
            </div>

            <!-- 字段映射 -->
            <div v-if="fileData.headers" class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">字段映射</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="(header, index) in fileData.headers" :key="index" class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="text-gray-700 font-medium">{{ header }}</span>
                  <span class="text-gray-500 text-sm">列 {{ index + 1 }}</span>
                </div>
              </div>
            </div>

            <!-- 数据预览 -->
            <div v-if="fileData.rows && fileData.rows.length > 0" class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">数据预览</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr class="bg-gray-100">
                      <th v-for="(header, index) in fileData.headers" :key="index" class="text-left py-3 px-4 font-medium text-gray-700 border-b">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in fileData.rows.slice(0, 5)" :key="rowIndex" class="border-b hover:bg-gray-50">
                      <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="py-3 px-4 text-gray-600">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="fileData.rows.length > 5" class="text-center py-4 text-gray-500 text-sm">
                  显示前5条记录，共{{ fileData.rows.length }}条
                </div>
              </div>
            </div>

            <!-- Beancount 记录 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Beancount 记录</h3>
                <button 
                  @click="copyBeancountRecords"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <i class="fas fa-copy mr-2"></i>
                  复制记录
                </button>
              </div>
              <div class="bg-white rounded border p-4">
                <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ beancountRecords }}</pre>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between mt-8">
            <button 
              @click="prevStep"
              class="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              上一步
            </button>
            <button 
              @click="finishProcess"
              class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <i class="fas fa-check mr-2"></i>
              完成处理
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DataSourceSelector from '../components/DataSourceSelector.vue';
import FileUpload from '../components/FileUpload.vue';
import type { FileData } from '../utils/file-processor';
import type { DataSource } from '../types/data-source';

const currentStep = ref(0);
const selectedDataSource = ref<DataSource | null>(null);
const fileData = ref<FileData | null>(null);

// 生成 Beancount 记录
const beancountRecords = computed(() => {
  if (!fileData.value || !fileData.value.rows || !fileData.value.headers) {
    return '// 暂无数据';
  }

  const { headers, rows } = fileData.value;
  const records: string[] = [];

  // 查找关键字段的索引
  const dateIndex = headers.findIndex(h => h.includes('日期') || h.includes('时间') || h.includes('date') || h.includes('time'));
  const amountIndex = headers.findIndex(h => h.includes('金额') || h.includes('amount') || h.includes('收/支'));
  const descriptionIndex = headers.findIndex(h => h.includes('描述') || h.includes('摘要') || h.includes('商品') || h.includes('description'));
  const payeeIndex = headers.findIndex(h => h.includes('对方') || h.includes('商家') || h.includes('payee'));

  rows.forEach((row, index) => {
    if (!row[dateIndex] || !row[amountIndex]) return;

    const date = formatDate(row[dateIndex]);
    const amount = parseFloat(row[amountIndex]) || 0;
    const description = row[descriptionIndex] || row[payeeIndex] || '交易';
    const payee = row[payeeIndex] || '';

    if (amount === 0) return;

    const account = selectedDataSource.value?.defaultPlusAccount || 'Assets:Bank:Default';
    const expenseAccount = amount > 0 ? 'Income:Other' : 'Expenses:Other';

    let record = `${date} * "${payee}" "${description}"\n`;
    record += `  ${account}  ${amount > 0 ? '+' : ''}${amount.toFixed(2)} CNY\n`;
    record += `  ${expenseAccount}  ${amount > 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)} CNY\n`;

    records.push(record);
  });

  return records.join('\n') || '// 无法生成 Beancount 记录';
});

const formatDate = (dateStr: string): string => {
  // 尝试解析各种日期格式
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // 如果解析失败，尝试其他格式
    const match = dateStr.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    }
    return '2023-01-01'; // 默认日期
  }
  return date.toISOString().split('T')[0];
};

const handleDataSourceSelected = (source: DataSource) => {
  selectedDataSource.value = source;
  console.log('选中的数据源:', source);
};

const handleEditConfig = (sourceId: string) => {
  console.log('编辑配置:', sourceId);
};

const handleFileUploaded = (data: FileData) => {
  fileData.value = data;
  console.log('文件上传成功:', data);
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const copyBeancountRecords = async () => {
  try {
    await navigator.clipboard.writeText(beancountRecords.value);
    alert('Beancount 记录已复制到剪贴板！');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  }
};

const finishProcess = () => {
  console.log('处理完成');
  alert('文件处理完成！');
  
  // 重置到第一步
  currentStep.value = 0;
  selectedDataSource.value = null;
  fileData.value = null;
};

const goHome = () => {
  window.location.href = '/';
};
</script> 