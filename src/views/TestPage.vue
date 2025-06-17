<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <button 
        @click="goHome"
        class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        返回首页
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">数据源解析测试</h1>
      
      <!-- 数据源选择 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">选择数据源</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="source in dataSources" 
            :key="source.id"
            @click="selectDataSource(source)"
            :class="{'border-indigo-500 bg-indigo-50': selectedDataSource?.id === source.id}"
            class="border rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div 
              class="w-16 h-16 mb-2 flex items-center justify-center rounded-lg mx-auto"
              :style="`background-color: ${source.color}20; border: 2px solid ${source.color}40;`"
            >
              <img 
                :src="source.icon" 
                :alt="source.name"
                class="w-10 h-10 object-contain"
                @error="handleImageError"
              />
            </div>
            <p class="text-sm font-medium">{{ source.name }}</p>
          </div>
        </div>
      </div>

      <!-- 文件上传 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">上传测试文件</h2>
        <div 
          @dragover.prevent="dragOver = true" 
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="{'border-indigo-500 bg-indigo-50': dragOver, 'border-gray-300': !dragOver}"
          class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          <i class="fas fa-cloud-upload-alt text-4xl text-indigo-500 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-700 mb-2">拖放文件到此处</h3>
          <p class="text-sm text-gray-500 mb-4">支持CSV、Excel、文本文件</p>
          <label for="test-file-upload" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
            <i class="fas fa-folder-open mr-2"></i>
            选择文件
            <input id="test-file-upload" type="file" class="hidden" @change="handleFileSelect" accept=".csv,.xlsx,.xls,.txt">
          </label>
        </div>

        <div v-if="uploadedFile" class="mt-4 border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-file-alt text-indigo-500 text-xl mr-3"></i>
              <div>
                <p class="font-medium">{{ uploadedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(uploadedFile.size) }}</p>
              </div>
            </div>
            <button @click="removeFile" class="text-red-500 hover:text-red-700">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="mb-8">
        <button 
          @click="runTest"
          :disabled="!selectedDataSource || !uploadedFile"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-play mr-2"></i>
          运行解析测试
        </button>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">测试结果</h2>
        
        <!-- 处理结果状态 -->
        <div class="bg-white border rounded-lg p-4 shadow-sm mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-800">处理结果</h3>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ testResult.success ? '成功' : '失败' }}
              </span>
              <span class="text-sm text-gray-500">{{ testResult.timestamp }}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ testResult.stats.total }}</div>
              <div class="text-sm text-gray-600">总记录数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ testResult.stats.success }}</div>
              <div class="text-sm text-gray-600">成功处理</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ testResult.stats.warning }}</div>
              <div class="text-sm text-gray-600">警告</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ testResult.stats.error }}</div>
              <div class="text-sm text-gray-600">错误</div>
            </div>
          </div>
          
          <div v-if="testResult.messages.length > 0" class="space-y-2">
            <h4 class="font-medium text-gray-700">处理详情：</h4>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <div v-for="(message, index) in testResult.messages" :key="index"
                   class="text-sm p-2 rounded"
                   :class="{
                     'bg-green-50 text-green-800': message.type === 'success',
                     'bg-yellow-50 text-yellow-800': message.type === 'warning',
                     'bg-red-50 text-red-800': message.type === 'error',
                     'bg-blue-50 text-blue-800': message.type === 'info'
                   }">
                <span class="font-medium">{{ message.type.toUpperCase() }}:</span> {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 交易记录预览 -->
        <div v-if="testResult.transactions.length > 0" class="bg-white border rounded-lg p-4 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">交易记录预览 (前10条)</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">对方</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(tx, index) in testResult.transactions.slice(0, 10)" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ tx.date }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="tx.amount > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(tx.amount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ tx.description }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ tx.peer }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ tx.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileProcessor } from '../utils/file-processor';
import { DataSourceProcessor, type ProcessingResult } from '../utils/dataSourceProcessor';
import { DATA_SOURCES } from '../types/data-source';
import type { DataSource } from '../types/data-source';

const dragOver = ref(false);
const uploadedFile = ref<File | null>(null);
const selectedDataSource = ref<DataSource | null>(null);
const testResult = ref<ProcessingResult | null>(null);

const fileProcessor = new FileProcessor();
const dataSourceProcessor = new DataSourceProcessor();

const dataSources = DATA_SOURCES;

function goHome() {
  window.location.href = '/';
}

function selectDataSource(source: DataSource) {
  selectedDataSource.value = source;
  dataSourceProcessor.setDataSource(source);
}

function handleDrop(e: DragEvent) {
  dragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    uploadedFile.value = files[0];
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    uploadedFile.value = files[0];
  }
}

function removeFile() {
  uploadedFile.value = null;
}

function formatFileSize(bytes: number): string {
  return fileProcessor.formatFileSize(bytes);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    parent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10" style="color: ${parent.style.borderColor || '#666'}">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `;
  }
}

async function runTest() {
  if (!selectedDataSource.value || !uploadedFile.value) return;
  
  try {
    // 解析文件
    const fileData = await fileProcessor.parseFile(uploadedFile.value);
    
    // 处理数据
    const result = await dataSourceProcessor.processFile(fileData);
    testResult.value = result;
    
    console.log('测试结果:', result);
  } catch (error) {
    console.error('测试失败:', error);
    alert(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
</script> 