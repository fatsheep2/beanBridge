<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 侧边栏 -->
      <AppSidebar
        :currentStep="currentStep"
        :steps="steps"
        @step-change="goToStep"
      />

      <!-- 主面板 -->
      <div class="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <!-- 数据源选择 -->
        <DataSourceSelector
          v-if="currentStep === 0"
          :onDataSourceSelected="onDataSourceSelected"
          :onEditConfig="onEditConfig"
        />
        
        <!-- 文件上传 -->
        <FileUpload
          v-if="currentStep === 1"
          :onFileUploaded="onFileUploaded"
          @prev-step="goToStep(0)"
        />
        
        <!-- 交易预览 -->
        <TransactionPreview
          v-if="currentStep === 2"
          :transactions="transactions"
          :processingResult="processingResult"
          @prev-step="goToStep(1)"
          @next-step="goToStep(3)"
          @transactions-updated="updateTransactions"
        />
        
        <!-- 导出面板 -->
        <ExportPanel
          v-if="currentStep === 3"
          :transactions="transactions"
          @prev-step="goToStep(2)"
          @finish="finishImport"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from '../components/AppSidebar.vue';
import DataSourceSelector from '../components/DataSourceSelector.vue';
import FileUpload from '../components/FileUpload.vue';
import TransactionPreview from '../components/TransactionPreview.vue';
import ExportPanel from '../components/ExportPanel.vue';
import { DataSourceProcessor, type ProcessingResult } from '../utils/dataSourceProcessor';
import { useImportHistory } from '../composables/useImportHistory';
import { useRuleManager } from '../composables/useRuleManager';
import type { DataSource } from '../types/data-source';

const currentStep = ref(0);
const steps = [
  { title: '选择数据源', icon: 'fa-database' },
  { title: '上传文件', icon: 'fa-upload' },
  { title: '预览和编辑', icon: 'fa-eye' },
  { title: '导出', icon: 'fa-download' }
];

// 数据源相关
const selectedDataSource = ref<DataSource | null>(null);
const fileContent = ref<string>('');
const uploadedFile = ref<File | null>(null);

// 文件数据
const fileHeaders = ref<string[]>([]);
const fileRows = ref<any[][]>([]);
const transactions = ref<any[]>([]);
const processingResult = ref<ProcessingResult | null>(null);

// 处理器和管理器
const dataSourceProcessor = new DataSourceProcessor();
const { addImportRecord } = useImportHistory();
const { rules } = useRuleManager();

function goHome() {
  window.location.href = '/';
}

function goToStep(step: number) {
  currentStep.value = step;
}

function onDataSourceSelected(source: DataSource) {
  selectedDataSource.value = source;
  // 设置数据源处理器
  dataSourceProcessor.setDataSource(source);
  goToStep(1);
}

function onEditConfig(sourceId: string) {
  // 跳转到规则配置页面
  window.location.href = '/rule-config';
}

async function onFileUploaded(fileData: any) {
  fileHeaders.value = fileData.headers;
  fileRows.value = fileData.rows;
  fileContent.value = fileData.content || '';
  uploadedFile.value = fileData.file;
  
  try {
    // 设置规则
    dataSourceProcessor.setRules(rules.value);
    
    // 处理文件数据
    const result = await dataSourceProcessor.processFile(fileData);
    processingResult.value = result;
    transactions.value = result.transactions;
    
    goToStep(2);
  } catch (error) {
    console.error('文件处理失败:', error);
    alert('文件处理失败，请检查文件格式或数据源配置');
  }
}

function updateTransactions(newTransactions: any[]) {
  transactions.value = newTransactions;
}

function finishImport() {
  // 记录导入历史
  if (uploadedFile.value && selectedDataSource.value && processingResult.value) {
    addImportRecord({
      name: uploadedFile.value.name,
      dataSource: selectedDataSource.value.name,
      fileSize: uploadedFile.value.size,
      transactionCount: processingResult.value.stats.success,
      status: processingResult.value.success ? 'success' : 'failed'
    });
  }
  
  // 重置所有状态
  currentStep.value = 0;
  selectedDataSource.value = null;
  fileContent.value = '';
  fileHeaders.value = [];
  fileRows.value = [];
  transactions.value = [];
  uploadedFile.value = null;
  processingResult.value = null;
}
</script> 