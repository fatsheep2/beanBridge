<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">规则配置</h2>
        <p class="text-gray-600">{{ dataSource?.name }} - 解析规则配置</p>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="$emit('prev-step')"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <i class="fas fa-arrow-left mr-2"></i>上一步
        </button>
        <button 
          @click="saveConfig"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <i class="fas fa-save mr-2"></i>保存配置
        </button>
        <button 
          @click="testConfig"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-play mr-2"></i>测试规则
        </button>
        <button 
          @click="$emit('next-step')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <i class="fas fa-arrow-right mr-2"></i>下一步
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：规则配置 -->
      <div class="space-y-6">
        <!-- 基础配置 -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基础配置</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">编码格式</label>
              <select v-model="config.encoding" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="utf-8">UTF-8</option>
                <option value="gbk">GBK</option>
                <option value="gb2312">GB2312</option>
                <option value="big5">Big5</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分隔符</label>
              <select v-model="config.delimiter" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value=",">逗号 (,)</option>
                <option value=";">分号 (;)</option>
                <option value="\t">制表符 (Tab)</option>
                <option value="|">竖线 (|)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">跳过行数</label>
              <input 
                v-model.number="config.skipRows" 
                type="number" 
                min="0"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <!-- 字段映射 -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">字段映射</h3>
          <div class="space-y-3">
            <div 
              v-for="(mapping, index) in config.fieldMappings" 
              :key="index"
              class="flex items-center space-x-2"
            >
              <select 
                v-model="mapping.targetField" 
                class="flex-1 border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">选择目标字段</option>
                <option value="date">日期</option>
                <option value="amount">金额</option>
                <option value="description">描述</option>
                <option value="category">分类</option>
                <option value="account">账户</option>
                <option value="type">类型</option>
              </select>
              <span class="text-gray-500">←</span>
              <input 
                v-model="mapping.sourceField" 
                placeholder="源字段名或索引"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <button 
                @click="removeFieldMapping(index)"
                class="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <button 
              @click="addFieldMapping"
              class="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 rounded-md"
            >
              <i class="fas fa-plus mr-2"></i>添加字段映射
            </button>
          </div>
        </div>

        <!-- 数据转换规则 -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">数据转换规则</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">日期格式</label>
              <input 
                v-model="config.dateFormat" 
                placeholder="如: YYYY-MM-DD"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">金额处理</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input 
                    v-model="config.amountConfig.removeCurrencySymbol" 
                    type="checkbox" 
                    class="mr-2"
                  />
                  移除货币符号
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="config.amountConfig.removeThousandSeparator" 
                    type="checkbox" 
                    class="mr-2"
                  />
                  移除千位分隔符
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预览和测试 -->
      <div class="space-y-6">
        <!-- 文件预览 -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">文件预览</h3>
          <div v-if="previewData.length > 0" class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b">
                  <th 
                    v-for="(header, index) in previewHeaders" 
                    :key="index"
                    class="text-left py-2 px-2 font-medium text-gray-700"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, rowIndex) in previewData.slice(0, 5)" 
                  :key="rowIndex"
                  class="border-b hover:bg-gray-50"
                >
                  <td 
                    v-for="(cell, cellIndex) in row" 
                    :key="cellIndex"
                    class="py-2 px-2"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-file-alt text-4xl mb-2"></i>
            <p>暂无预览数据</p>
          </div>
        </div>

        <!-- 解析结果预览 -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">解析结果预览</h3>
          <div v-if="parsedData.length > 0" class="space-y-2">
            <div 
              v-for="(transaction, index) in parsedData.slice(0, 3)" 
              :key="index"
              class="border rounded p-3"
            >
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div><span class="font-medium">日期:</span> {{ transaction.date }}</div>
                <div><span class="font-medium">金额:</span> {{ transaction.amount }}</div>
                <div><span class="font-medium">描述:</span> {{ transaction.description }}</div>
                <div><span class="font-medium">分类:</span> {{ transaction.category }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-chart-line text-4xl mb-2"></i>
            <p>暂无解析结果</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { DataSource } from '../types/data-source';

interface FieldMapping {
  targetField: string;
  sourceField: string;
}

interface AmountConfig {
  removeCurrencySymbol: boolean;
  removeThousandSeparator: boolean;
}

interface RuleConfig {
  encoding: string;
  delimiter: string;
  skipRows: number;
  fieldMappings: FieldMapping[];
  dateFormat: string;
  amountConfig: AmountConfig;
}

interface Props {
  dataSource: DataSource | null;
  fileContent?: string;
}

interface Emits {
  'prev-step': [];
  'next-step': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = reactive<RuleConfig>({
  encoding: 'utf-8',
  delimiter: ',',
  skipRows: 0,
  fieldMappings: [],
  dateFormat: 'YYYY-MM-DD',
  amountConfig: {
    removeCurrencySymbol: true,
    removeThousandSeparator: true
  }
});

const previewData = ref<string[][]>([]);
const previewHeaders = ref<string[]>([]);
const parsedData = ref<any[]>([]);

onMounted(() => {
  if (props.fileContent) {
    parsePreviewData();
  }
});

const parsePreviewData = () => {
  if (!props.fileContent) return;
  
  const lines = props.fileContent.split('\n');
  const dataLines = lines.slice(config.skipRows, config.skipRows + 6);
  
  previewData.value = dataLines.map(line => 
    line.split(config.delimiter).map(cell => cell.trim())
  );
  
  if (previewData.value.length > 0) {
    previewHeaders.value = previewData.value[0];
  }
};

const addFieldMapping = () => {
  config.fieldMappings.push({
    targetField: '',
    sourceField: ''
  });
};

const removeFieldMapping = (index: number) => {
  config.fieldMappings.splice(index, 1);
};

const saveConfig = () => {
  // 保存配置逻辑
  console.log('保存配置:', config);
};

const testConfig = () => {
  // 测试解析逻辑
  console.log('测试配置:', config);
  parseData();
};

const parseData = () => {
  if (!previewData.value.length) return;
  
  const dataRows = previewData.value.slice(1); // 跳过标题行
  parsedData.value = dataRows.map(row => {
    const transaction: any = {};
    
    config.fieldMappings.forEach(mapping => {
      if (mapping.targetField && mapping.sourceField) {
        const sourceIndex = parseInt(mapping.sourceField) || 
          previewHeaders.value.indexOf(mapping.sourceField);
        
        if (sourceIndex >= 0 && sourceIndex < row.length) {
          let value = row[sourceIndex];
          
          // 应用转换规则
          if (mapping.targetField === 'amount') {
            value = processAmount(value);
          } else if (mapping.targetField === 'date') {
            value = processDate(value);
          }
          
          transaction[mapping.targetField] = value;
        }
      }
    });
    
    return transaction;
  });
};

const processAmount = (value: string): string => {
  let processed = value;
  
  if (config.amountConfig.removeCurrencySymbol) {
    processed = processed.replace(/[¥$€£]/g, '');
  }
  
  if (config.amountConfig.removeThousandSeparator) {
    processed = processed.replace(/,/g, '');
  }
  
  return processed.trim();
};

const processDate = (value: string): string => {
  // 简单的日期处理逻辑
  return value.trim();
};
</script> 