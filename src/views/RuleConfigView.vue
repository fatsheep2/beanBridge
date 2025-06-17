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
        <h1 class="text-3xl font-bold text-gray-900">规则配置</h1>
        <p class="mt-2 text-gray-600">配置数据源的处理规则和字段映射</p>
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
          </div>
        </div>
        <div class="flex justify-center mt-4 space-x-16">
          <span :class="['text-sm', currentStep >= 0 ? 'text-indigo-600 font-medium' : 'text-gray-500']">选择数据源</span>
          <span :class="['text-sm', currentStep >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500']">配置规则</span>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="bg-white rounded-lg shadow">
        <!-- 步骤1：数据源选择 -->
        <div v-if="currentStep === 0" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">选择数据源</h2>
            <p class="text-gray-600">请选择您要配置规则的数据源类型</p>
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

        <!-- 步骤2：规则配置 -->
        <div v-if="currentStep === 1" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">配置规则</h2>
            <p class="text-gray-600">配置数据源的处理规则和字段映射</p>
            <div v-if="selectedDataSource" class="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
              <i class="fas fa-database mr-2"></i>
              已选择：{{ selectedDataSource.name }}
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoadingFile" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-gray-600">正在加载测试文件...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="fileLoadError" class="text-center py-12">
            <div class="text-red-500 mb-4">
              <i class="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">文件加载失败</h3>
            <p class="text-gray-600 mb-4">{{ fileLoadError }}</p>
            <button 
              @click="loadTestFile"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              重新加载
            </button>
          </div>
          
          <!-- 规则配置编辑器 -->
          <div v-else-if="previewFileContent">
            <RuleConfigEditor
              :dataSource="selectedDataSource"
              :fileContent="previewFileContent"
              @config-saved="handleConfigSaved"
            />
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
              @click="saveConfig"
              class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <i class="fas fa-save mr-2"></i>
              保存配置
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
import RuleConfigEditor from '../components/RuleConfigEditor.vue';
import type { DataSource } from '../types/data-source';

const currentStep = ref(0);
const selectedDataSource = ref<DataSource | null>(null);
const previewFileContent = ref<string>('');
const isLoadingFile = ref(false);
const fileLoadError = ref<string>('');

const handleDataSourceSelected = async (source: DataSource) => {
  selectedDataSource.value = source;
  console.log('选中的数据源:', source);
  
  // 如果已经在步骤2，立即加载对应的测试文件
  if (currentStep.value === 1) {
    await loadTestFile();
  }
};

const handleEditConfig = (sourceId: string) => {
  console.log('编辑配置:', sourceId);
};

const nextStep = async () => {
  if (currentStep.value < 1) {
    currentStep.value++;
    // 进入步骤2时加载测试文件
    if (selectedDataSource.value) {
      await loadTestFile();
    }
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    // 清空文件内容
    previewFileContent.value = '';
    fileLoadError.value = '';
  }
};

const loadTestFile = async () => {
  if (!selectedDataSource.value) return;
  
  isLoadingFile.value = true;
  fileLoadError.value = '';
  
  try {
    const source = selectedDataSource.value;
    
    if (!source.testFilePath) {
      throw new Error('该数据源暂无测试文件');
    }
    
    // 从public目录读取文件
    const response = await fetch(source.testFilePath);
    
    if (!response.ok) {
      throw new Error(`文件加载失败: ${response.status} ${response.statusText}`);
    }
    
    // 获取文件内容
    const content = await response.text();
    previewFileContent.value = content;
    
    console.log(`成功加载测试文件: ${source.testFilePath}`);
  } catch (error) {
    console.error('加载测试文件失败:', error);
    fileLoadError.value = error instanceof Error ? error.message : '未知错误';
    previewFileContent.value = '';
  } finally {
    isLoadingFile.value = false;
  }
};

const saveConfig = () => {
  // 这里可以添加保存配置的逻辑
  console.log('保存配置');
  alert('配置保存成功！');
  
  // 重置到第一步
  currentStep.value = 0;
  selectedDataSource.value = null;
  previewFileContent.value = '';
  fileLoadError.value = '';
};

const goHome = () => {
  window.location.href = '/';
};

const handleConfigSaved = (config: any) => {
  // 处理配置保存后的逻辑
  console.log('配置保存后处理逻辑:', config);
  
  // 显示保存成功的提示
  alert(`配置 "${config.name}" 保存成功！现在可以在账单处理页面使用此配置。`);
};
</script> 