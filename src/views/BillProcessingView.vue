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
              
              <!-- 配置状态 -->
              <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center">
                  <i class="fas fa-cog mr-2 text-blue-600"></i>
                  <span class="text-sm font-medium text-blue-800">规则配置状态</span>
                </div>
                <div class="mt-2">
                  <span v-if="currentConfig" class="text-sm text-green-600">
                    <i class="fas fa-check mr-1"></i>
                    已使用保存的规则配置：{{ currentConfig.name }}
                  </span>
                  <span v-else class="text-sm text-orange-600">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    未找到规则配置，使用默认字段检测
                    <button 
                      @click="handleEditConfig(selectedDataSource?.id || '')"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      去配置规则
                    </button>
                  </span>
                </div>
                <!-- 调试信息 -->
                <div class="mt-2 text-xs text-gray-600">
                  <details>
                    <summary class="cursor-pointer hover:text-gray-800">调试信息</summary>
                    <div class="mt-1 p-2 bg-white rounded border">
                      <div>数据源ID: {{ selectedDataSource?.id }}</div>
                      <div>当前配置: {{ currentConfig ? '已加载' : '未找到' }}</div>
                      <div>localStorage状态: {{ localStorageStatus }}</div>
                      <div v-if="currentConfig">
                        <div>配置ID: {{ currentConfig.id }}</div>
                        <div>配置名称: {{ currentConfig.name }}</div>
                        <div>日期字段: {{ currentConfig.dateField || '自动检测' }}</div>
                        <div>金额字段: {{ currentConfig.amountField || '自动检测' }}</div>
                        <div>描述字段: {{ currentConfig.descriptionField || '自动检测' }}</div>
                        <div>对方字段: {{ currentConfig.payeeField || '自动检测' }}</div>
                      </div>
                      <div class="mt-2">
                        <button 
                          @click="testConfigLoading"
                          class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          测试配置加载
                        </button>
                        <button 
                          @click="showAllConfigs"
                          class="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          查看所有配置
                        </button>
                        <button 
                          @click="checkLocalStorage"
                          class="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                        >
                          检查存储状态
                        </button>
                        <button 
                          @click="diagnoseRecordGeneration"
                          class="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          诊断记录生成
                        </button>
                        <button 
                          @click="testRecordGeneration"
                          class="ml-2 px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600"
                        >
                          测试记录生成
                        </button>
                        <button 
                          @click="exportConfigs"
                          class="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                        >
                          导出配置
                        </button>
                        <button 
                          @click="importConfigs"
                          class="ml-2 px-2 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600"
                        >
                          导入配置
                        </button>
                      </div>
                    </div>
                  </details>
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
import { ruleConfigManager } from '../utils/rule-config-manager';

const currentStep = ref(0);
const selectedDataSource = ref<DataSource | null>(null);
const fileData = ref<FileData | null>(null);
const currentConfig = ref<any>(null);

// localStorage 状态
const localStorageStatus = computed(() => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return '可用';
  } catch (e) {
    return '不可用';
  }
});

// 生成 Beancount 记录
const beancountRecords = computed(() => {
  if (!fileData.value || !fileData.value.rows || !fileData.value.headers) {
    console.log('无法生成记录：缺少文件数据', { fileData: fileData.value });
    return '// 暂无数据';
  }

  const { headers, rows } = fileData.value;
  const records: string[] = [];

  console.log('开始生成 Beancount 记录:', {
    headers,
    rowsCount: rows.length,
    selectedDataSource: selectedDataSource.value?.name,
    currentConfig: currentConfig.value
  });

  // 获取当前数据源的规则配置
  const config = currentConfig.value || (selectedDataSource.value ? 
    ruleConfigManager.getConfigByDataSourceId(selectedDataSource.value.id) : null);

  console.log('使用的配置:', config);

  // 如果有关联的规则配置，使用配置中的字段映射
  if (config) {
    const getFieldIndex = (fieldName: string) => {
      const field = config[fieldName];
      if (field !== '' && field !== null && field !== undefined) {
        return parseInt(field as string);
      }
      return -1;
    };

    const dateIndex = getFieldIndex('dateField') >= 0 ? getFieldIndex('dateField') : 
      headers.findIndex(h => h.includes('日期') || h.includes('时间') || h.includes('date') || h.includes('time'));
    
    const amountIndex = getFieldIndex('amountField') >= 0 ? getFieldIndex('amountField') : 
      headers.findIndex(h => h.includes('金额') || h.includes('amount') || h.includes('收/支'));
    
    const descriptionIndex = getFieldIndex('descriptionField') >= 0 ? getFieldIndex('descriptionField') : 
      headers.findIndex(h => h.includes('描述') || h.includes('摘要') || h.includes('商品') || h.includes('description'));
    
    const payeeIndex = getFieldIndex('payeeField') >= 0 ? getFieldIndex('payeeField') : 
      headers.findIndex(h => h.includes('对方') || h.includes('商家') || h.includes('payee'));

    console.log('字段索引:', {
      dateIndex,
      amountIndex,
      descriptionIndex,
      payeeIndex,
      headers
    });

    let processedCount = 0;
    let skippedCount = 0;

    rows.forEach((row, index) => {
      if (!row[dateIndex] || !row[amountIndex]) {
        console.log(`跳过行 ${index}: 缺少日期或金额`, {
          dateValue: row[dateIndex],
          amountValue: row[amountIndex],
          dateIndex,
          amountIndex
        });
        skippedCount++;
        return;
      }

      const date = formatDate(row[dateIndex]);
      const amount = parseFloat(row[amountIndex]) || 0;
      const description = row[descriptionIndex] || row[payeeIndex] || '交易';
      const payee = row[payeeIndex] || '';

      if (amount === 0) {
        console.log(`跳过行 ${index}: 金额为0`, { amount, row });
        skippedCount++;
        return;
      }

      const account = config.plusAccount || selectedDataSource.value?.defaultPlusAccount || 'Assets:Bank:Default';
      const expenseAccount = amount > 0 ? 'Income:Other' : (config.minusAccount || 'Expenses:Other');

      let record = `${date} * "${payee}" "${description}"\n`;
      record += `  ${account}  ${amount > 0 ? '+' : ''}${amount.toFixed(2)} ${config.currency || 'CNY'}\n`;
      record += `  ${expenseAccount}  ${amount > 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)} ${config.currency || 'CNY'}\n`;

      records.push(record);
      processedCount++;
    });

    console.log('处理结果:', { processedCount, skippedCount, totalRows: rows.length });
  } else {
    // 使用默认的字段检测逻辑
    const dateIndex = headers.findIndex(h => h.includes('日期') || h.includes('时间') || h.includes('date') || h.includes('time'));
    const amountIndex = headers.findIndex(h => h.includes('金额') || h.includes('amount') || h.includes('收/支'));
    const descriptionIndex = headers.findIndex(h => h.includes('描述') || h.includes('摘要') || h.includes('商品') || h.includes('description'));
    const payeeIndex = headers.findIndex(h => h.includes('对方') || h.includes('商家') || h.includes('payee'));

    console.log('默认字段检测:', {
      dateIndex,
      amountIndex,
      descriptionIndex,
      payeeIndex,
      headers
    });

    let processedCount = 0;
    let skippedCount = 0;

    rows.forEach((row, index) => {
      if (!row[dateIndex] || !row[amountIndex]) {
        console.log(`跳过行 ${index}: 缺少日期或金额`, {
          dateValue: row[dateIndex],
          amountValue: row[amountIndex],
          dateIndex,
          amountIndex
        });
        skippedCount++;
        return;
      }

      const date = formatDate(row[dateIndex]);
      const amount = parseFloat(row[amountIndex]) || 0;
      const description = row[descriptionIndex] || row[payeeIndex] || '交易';
      const payee = row[payeeIndex] || '';

      if (amount === 0) {
        console.log(`跳过行 ${index}: 金额为0`, { amount, row });
        skippedCount++;
        return;
      }

      const account = selectedDataSource.value?.defaultPlusAccount || 'Assets:Bank:Default';
      const expenseAccount = amount > 0 ? 'Income:Other' : 'Expenses:Other';

      let record = `${date} * "${payee}" "${description}"\n`;
      record += `  ${account}  ${amount > 0 ? '+' : ''}${amount.toFixed(2)} CNY\n`;
      record += `  ${expenseAccount}  ${amount > 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)} CNY\n`;

      records.push(record);
      processedCount++;
    });

    console.log('默认处理结果:', { processedCount, skippedCount, totalRows: rows.length });
  }

  const result = records.join('\n') || '// 无法生成 Beancount 记录';
  console.log('最终结果:', { recordCount: records.length, result: result.substring(0, 200) + '...' });
  
  return result;
});

const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '') {
    console.warn('日期字符串为空');
    return '2023-01-01';
  }

  console.log('格式化日期:', dateStr);

  // 尝试解析各种日期格式
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const result = date.toISOString().split('T')[0];
    console.log('标准日期解析成功:', result);
    return result;
  }

  // 尝试其他格式
  const patterns = [
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/, // YYYY-MM-DD 或 YYYY/MM/DD
    /(\d{4})年(\d{1,2})月(\d{1,2})日/, // YYYY年MM月DD日
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, // MM-DD-YYYY 或 MM/DD/YYYY
    /(\d{1,2})月(\d{1,2})日(\d{4})年/, // MM月DD日YYYY年
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      let year, month, day;
      
      if (pattern.source.includes('年')) {
        // 中文格式
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      } else if (pattern.source.includes('(\d{4})[-\/]')) {
        // YYYY-MM-DD 格式
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      } else {
        // MM-DD-YYYY 格式
        year = match[3];
        month = match[1].padStart(2, '0');
        day = match[2].padStart(2, '0');
      }
      
      const result = `${year}-${month}-${day}`;
      console.log('模式匹配成功:', { pattern: pattern.source, result });
      return result;
    }
  }

  console.warn('无法解析日期格式:', dateStr, '使用默认日期');
  return '2023-01-01'; // 默认日期
};

const handleDataSourceSelected = (source: DataSource) => {
  selectedDataSource.value = source;
  
  // 加载该数据源的规则配置
  const config = ruleConfigManager.getConfigByDataSourceId(source.id);
  currentConfig.value = config;
  
  console.log('选中的数据源:', source);
  console.log('加载的规则配置:', config);
};

const handleEditConfig = (sourceId: string) => {
  console.log('编辑配置:', sourceId);
  // 跳转到规则配置页面
  window.location.href = '/rule-config';
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
  currentConfig.value = null;
};

const goHome = () => {
  window.location.href = '/';
};

const testConfigLoading = () => {
  if (!selectedDataSource.value) {
    alert('请先选择数据源');
    return;
  }
  
  console.log('测试配置加载');
  console.log('当前数据源:', selectedDataSource.value);
  
  // 重新加载配置
  const config = ruleConfigManager.getConfigByDataSourceId(selectedDataSource.value.id);
  currentConfig.value = config;
  
  console.log('重新加载的配置:', config);
  
  if (config) {
    alert(`配置加载成功！\n配置名称: ${config.name}\n配置ID: ${config.id}`);
  } else {
    alert('未找到该数据源的配置');
  }
};

const showAllConfigs = () => {
  const allConfigs = ruleConfigManager.getAllConfigs();
  console.log('所有配置:', allConfigs);
  
  if (allConfigs.length === 0) {
    alert('当前没有保存任何配置');
    return;
  }
  
  const configList = allConfigs.map(config => 
    `- ${config.name} (${config.dataSourceId})\n  ID: ${config.id}`
  ).join('\n');
  
  alert(`当前保存的配置:\n\n${configList}`);
};

const checkLocalStorage = () => {
  console.log('检查 localStorage 状态');
  
  try {
    // 测试 localStorage 是否可用
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    
    // 检查是否有保存的配置
    const configs = ruleConfigManager.getAllConfigs();
    const configCount = configs.length;
    
    const status = `✅ localStorage 可用\n保存的配置数量: ${configCount}`;
    console.log('localStorage 状态:', status);
    alert(status);
  } catch (error) {
    const status = `❌ localStorage 不可用\n错误: ${error}`;
    console.error('localStorage 检查失败:', error);
    alert(status);
  }
};

const exportConfigs = () => {
  try {
    ruleConfigManager.downloadConfigs();
    alert('✅ 配置文件已下载到本地');
  } catch (error) {
    console.error('导出配置失败:', error);
    alert('❌ 导出配置失败: ' + error);
  }
};

const importConfigs = () => {
  // 创建文件输入元素
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const success = ruleConfigManager.importConfigs(text);
      
      if (success) {
        alert('✅ 配置导入成功！');
        // 重新加载当前配置
        if (selectedDataSource.value) {
          const config = ruleConfigManager.getConfigByDataSourceId(selectedDataSource.value.id);
          currentConfig.value = config;
        }
      } else {
        alert('❌ 配置导入失败');
      }
    } catch (error) {
      console.error('导入配置失败:', error);
      alert('❌ 导入配置失败: ' + error);
    }
  };
  
  input.click();
};

const diagnoseRecordGeneration = () => {
  if (!fileData.value) {
    alert('❌ 没有文件数据，请先上传文件');
    return;
  }

  const { headers, rows } = fileData.value;
  const config = currentConfig.value || (selectedDataSource.value ? 
    ruleConfigManager.getConfigByDataSourceId(selectedDataSource.value.id) : null);

  let diagnosis = '🔍 记录生成诊断报告\n\n';
  
  // 基本信息
  diagnosis += `📊 基本信息:\n`;
  diagnosis += `- 数据源: ${selectedDataSource.value?.name || '未选择'}\n`;
  diagnosis += `- 字段数: ${headers.length}\n`;
  diagnosis += `- 记录数: ${rows.length}\n`;
  diagnosis += `- 配置状态: ${config ? '已加载' : '未找到'}\n\n`;

  // 字段信息
  diagnosis += `📋 字段信息:\n`;
  headers.forEach((header, index) => {
    diagnosis += `- 列${index + 1}: ${header}\n`;
  });
  diagnosis += '\n';

  // 字段检测
  const getFieldIndex = (fieldName: string) => {
    if (config && config[fieldName] !== '' && config[fieldName] !== null && config[fieldName] !== undefined) {
      return parseInt(config[fieldName] as string);
    }
    return -1;
  };

  const dateIndex = getFieldIndex('dateField') >= 0 ? getFieldIndex('dateField') : 
    headers.findIndex(h => h.includes('日期') || h.includes('时间') || h.includes('date') || h.includes('time'));
  
  const amountIndex = getFieldIndex('amountField') >= 0 ? getFieldIndex('amountField') : 
    headers.findIndex(h => h.includes('金额') || h.includes('amount') || h.includes('收/支'));
  
  const descriptionIndex = getFieldIndex('descriptionField') >= 0 ? getFieldIndex('descriptionField') : 
    headers.findIndex(h => h.includes('描述') || h.includes('摘要') || h.includes('商品') || h.includes('description'));
  
  const payeeIndex = getFieldIndex('payeeField') >= 0 ? getFieldIndex('payeeField') : 
    headers.findIndex(h => h.includes('对方') || h.includes('商家') || h.includes('payee'));

  diagnosis += `🎯 字段检测结果:\n`;
  diagnosis += `- 日期字段: ${dateIndex >= 0 ? `列${dateIndex + 1} (${headers[dateIndex]})` : '未找到'}\n`;
  diagnosis += `- 金额字段: ${amountIndex >= 0 ? `列${amountIndex + 1} (${headers[amountIndex]})` : '未找到'}\n`;
  diagnosis += `- 描述字段: ${descriptionIndex >= 0 ? `列${descriptionIndex + 1} (${headers[descriptionIndex]})` : '未找到'}\n`;
  diagnosis += `- 对方字段: ${payeeIndex >= 0 ? `列${payeeIndex + 1} (${headers[payeeIndex]})` : '未找到'}\n\n`;

  // 数据样本分析
  diagnosis += `📝 数据样本分析 (前3行):\n`;
  rows.slice(0, 3).forEach((row, index) => {
    diagnosis += `行${index + 1}:\n`;
    diagnosis += `  - 日期: ${row[dateIndex] || '无'}\n`;
    diagnosis += `  - 金额: ${row[amountIndex] || '无'}\n`;
    diagnosis += `  - 描述: ${row[descriptionIndex] || '无'}\n`;
    diagnosis += `  - 对方: ${row[payeeIndex] || '无'}\n`;
  });
  diagnosis += '\n';

  // 问题诊断
  diagnosis += `⚠️ 问题诊断:\n`;
  if (dateIndex < 0) {
    diagnosis += `- ❌ 未找到日期字段，请检查文件格式或配置字段映射\n`;
  }
  if (amountIndex < 0) {
    diagnosis += `- ❌ 未找到金额字段，请检查文件格式或配置字段映射\n`;
  }
  if (rows.length === 0) {
    diagnosis += `- ❌ 没有数据行，请检查文件内容\n`;
  }

  // 建议
  diagnosis += `\n💡 建议:\n`;
  if (!config) {
    diagnosis += `- 建议为数据源配置规则，以获得更准确的字段映射\n`;
  }
  if (dateIndex < 0 || amountIndex < 0) {
    diagnosis += `- 检查文件格式是否正确，或手动配置字段映射\n`;
  }
  if (rows.length > 0 && dateIndex >= 0 && amountIndex >= 0) {
    diagnosis += `- 字段检测正常，如果仍无法生成记录，请检查数据内容\n`;
  }

  console.log('诊断报告:', diagnosis);
  alert(diagnosis);
};

const testRecordGeneration = () => {
  if (!fileData.value) {
    alert('❌ 没有文件数据，请先上传文件');
    return;
  }

  // 生成一个简单的测试记录
  const testRecord = `2024-01-01 * "测试商家" "测试交易"
  Assets:Bank:Default  -100.00 CNY
  Expenses:Other  +100.00 CNY

2024-01-02 * "测试收入" "测试收入"
  Assets:Bank:Default  +500.00 CNY
  Income:Other  -500.00 CNY`;

  console.log('测试记录生成:', testRecord);
  alert(`✅ 测试记录生成成功！\n\n${testRecord}\n\n这是测试记录，实际记录请查看下方的 Beancount 记录区域。`);
};
</script> 