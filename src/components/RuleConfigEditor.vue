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

    <div class="space-y-6">
      <!-- 基础配置 -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">基础配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">默认货币</label>
            <select v-model="config.currency" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="CNY">人民币 (CNY)</option>
              <option value="USD">美元 (USD)</option>
              <option value="EUR">欧元 (EUR)</option>
              <option value="JPY">日元 (JPY)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 账户配置 -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">账户配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">支出账户</label>
            <input 
              v-model="config.minusAccount" 
              type="text" 
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Expenses:Other"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">收入账户</label>
            <input 
              v-model="config.plusAccount" 
              type="text" 
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Assets:Bank:Default"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手续费账户</label>
            <input 
              v-model="config.commissionAccount" 
              type="text" 
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Expenses:Commission"
            />
          </div>
        </div>
      </div>

      <!-- 字段映射 -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">字段映射</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">日期字段</label>
            <select v-model="config.dateField" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">自动检测</option>
              <option v-for="(header, index) in parsedHeaders" :key="index" :value="index">
                {{ header }} (列{{ index + 1 }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">金额字段</label>
            <select v-model="config.amountField" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">自动检测</option>
              <option v-for="(header, index) in parsedHeaders" :key="index" :value="index">
                {{ header }} (列{{ index + 1 }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">描述字段</label>
            <select v-model="config.descriptionField" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">自动检测</option>
              <option v-for="(header, index) in parsedHeaders" :key="index" :value="index">
                {{ header }} (列{{ index + 1 }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">对方字段</label>
            <select v-model="config.payeeField" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">自动检测</option>
              <option v-for="(header, index) in parsedHeaders" :key="index" :value="index">
                {{ header }} (列{{ index + 1 }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 文件预览 -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">文件预览</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr class="bg-gray-100">
                <th v-for="(header, index) in parsedHeaders" :key="index" class="text-left py-3 px-4 font-medium text-gray-700 border-b">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in parsedRows.slice(0, 5)" :key="rowIndex" class="border-b hover:bg-gray-50">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="py-3 px-4 text-gray-600">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedRows.length > 5" class="text-center py-4 text-gray-500 text-sm">
            显示前5条记录，共{{ parsedRows.length }}条
          </div>
        </div>
      </div>

      <!-- Beancount 预览 -->
      <div class="bg-white border rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Beancount 预览</h3>
        <div class="bg-gray-50 rounded border p-4">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ beancountPreview }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import Papa from 'papaparse';
import type { DataSource } from '../types/data-source';
import { ruleConfigManager, type RuleConfig } from '../utils/rule-config-manager';

interface FieldMapping {
  targetField: string;
  sourceField: string;
}

interface AmountConfig {
  removeCurrencySymbol: boolean;
  removeThousandSeparator: boolean;
}

interface RuleConfigLocal {
  encoding: string;
  delimiter: string;
  skipRows: number;
  fieldMappings: FieldMapping[];
  dateFormat: string;
  amountConfig: AmountConfig;
  currency: string;
  minusAccount: string;
  plusAccount: string;
  commissionAccount: string;
  dateField: string;
  amountField: string;
  descriptionField: string;
  payeeField: string;
}

interface Props {
  dataSource: DataSource | null;
  fileContent: string;
}

interface Emits {
  'prev-step': [];
  'next-step': [];
  'config-saved': [RuleConfig];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = ref<RuleConfigLocal>({
  encoding: 'utf-8',
  delimiter: ',',
  skipRows: 0,
  fieldMappings: [],
  dateFormat: 'YYYY-MM-DD',
  amountConfig: {
    removeCurrencySymbol: true,
    removeThousandSeparator: true
  },
  currency: 'CNY',
  minusAccount: 'Expenses:Other',
  plusAccount: 'Assets:Bank:Default',
  commissionAccount: 'Expenses:Commission',
  dateField: '',
  amountField: '',
  descriptionField: '',
  payeeField: ''
});

const previewData = ref<string[][]>([]);
const previewHeaders = ref<string[]>([]);
const parsedDataRef = ref<any[]>([]);

onMounted(() => {
  if (props.fileContent) {
    parsePreviewData();
  }
  
  // 加载已保存的配置
  if (props.dataSource) {
    loadSavedConfig();
  }
});

const loadSavedConfig = () => {
  if (!props.dataSource) return;
  
  const savedConfig = ruleConfigManager.getConfigByDataSourceId(props.dataSource.id);
  if (savedConfig) {
    config.value.encoding = savedConfig.encoding;
    config.value.delimiter = savedConfig.delimiter;
    config.value.skipRows = savedConfig.skipRows;
    config.value.currency = savedConfig.currency;
    config.value.minusAccount = savedConfig.minusAccount;
    config.value.plusAccount = savedConfig.plusAccount;
    config.value.commissionAccount = savedConfig.commissionAccount;
    config.value.dateField = savedConfig.dateField;
    config.value.amountField = savedConfig.amountField;
    config.value.descriptionField = savedConfig.descriptionField;
    config.value.payeeField = savedConfig.payeeField;
  }
};

const parsePreviewData = () => {
  if (!props.fileContent) return;
  
  const lines = props.fileContent.split('\n');
  const dataLines = lines.slice(config.value.skipRows, config.value.skipRows + 6);
  
  previewData.value = dataLines.map(line => 
    line.split(config.value.delimiter).map(cell => cell.trim())
  );
  
  if (previewData.value.length > 0) {
    previewHeaders.value = previewData.value[0];
  }
};

const addFieldMapping = () => {
  config.value.fieldMappings.push({
    targetField: '',
    sourceField: ''
  });
};

const removeFieldMapping = (index: number) => {
  config.value.fieldMappings.splice(index, 1);
};

const saveConfig = () => {
  if (!props.dataSource) return;
  
  // 先检查是否已有该数据源的配置
  const existingConfig = ruleConfigManager.getConfigByDataSourceId(props.dataSource.id);
  
  // 创建规则配置对象
  const ruleConfig: RuleConfig = {
    id: existingConfig ? existingConfig.id : `config_${props.dataSource.id}_${Date.now()}`,
    dataSourceId: props.dataSource.id,
    name: `${props.dataSource.name} 配置`,
    encoding: config.value.encoding,
    delimiter: config.value.delimiter,
    skipRows: config.value.skipRows,
    currency: config.value.currency,
    minusAccount: config.value.minusAccount,
    plusAccount: config.value.plusAccount,
    commissionAccount: config.value.commissionAccount,
    dateField: config.value.dateField,
    amountField: config.value.amountField,
    descriptionField: config.value.descriptionField,
    payeeField: config.value.payeeField,
    fieldMappings: {
      date: config.value.dateField,
      amount: config.value.amountField,
      description: config.value.descriptionField,
      payee: config.value.payeeField
    },
    rules: [],
    createdAt: existingConfig ? existingConfig.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 保存配置
  ruleConfigManager.saveConfig(ruleConfig);
  
  // 触发事件
  emit('config-saved', ruleConfig);
  
  console.log('配置已保存:', ruleConfig);
  alert('配置保存成功！');
};

const testConfig = () => {
  // 测试解析逻辑
  console.log('测试配置:', config.value);
  parseData();
};

const parseData = () => {
  if (!previewData.value.length) return;
  
  const dataRows = previewData.value.slice(1); // 跳过标题行
  parsedDataRef.value = dataRows.map(row => {
    const transaction: any = {};
    
    config.value.fieldMappings.forEach(mapping => {
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
  
  if (config.value.amountConfig.removeCurrencySymbol) {
    processed = processed.replace(/[¥$€£]/g, '');
  }
  
  if (config.value.amountConfig.removeThousandSeparator) {
    processed = processed.replace(/,/g, '');
  }
  
  return processed.trim();
};

const processDate = (value: string): string => {
  // 简单的日期处理逻辑
  return value.trim();
};

// 解析文件内容
const parsedData = computed(() => {
  if (!props.fileContent) return { headers: [], rows: [] };
  
  try {
    const result = Papa.parse(props.fileContent, {
      header: false,
      skipEmptyLines: true,
      delimiter: config.value.delimiter
    });
    
    if (result.errors.length > 0) {
      console.error('解析错误:', result.errors);
      return { headers: [], rows: [] };
    }
    
    const allRows = result.data as string[][];
    const skipRows = config.value.skipRows || 0;
    
    if (allRows.length <= skipRows) {
      return { headers: [], rows: [] };
    }
    
    const headers = allRows[skipRows] || [];
    const rows = allRows.slice(skipRows + 1) || [];
    
    return { headers, rows };
  } catch (error) {
    console.error('解析失败:', error);
    return { headers: [], rows: [] };
  }
});

const parsedHeaders = computed(() => parsedData.value.headers);
const parsedRows = computed(() => parsedData.value.rows);

// 生成 Beancount 预览
const beancountPreview = computed(() => {
  if (!parsedHeaders.value.length || !parsedRows.value.length) {
    return '// 暂无数据';
  }

  const records: string[] = [];
  
  // 获取字段索引
  const getFieldIndex = (fieldName: string) => {
    const field = config.value[fieldName as keyof typeof config.value];
    if (field !== '' && field !== null && field !== undefined) {
      return parseInt(field as string);
    }
    return -1;
  };

  const dateIndex = getFieldIndex('dateField') >= 0 ? getFieldIndex('dateField') : 
    parsedHeaders.value.findIndex(h => h.includes('日期') || h.includes('时间') || h.includes('date') || h.includes('time'));
  
  const amountIndex = getFieldIndex('amountField') >= 0 ? getFieldIndex('amountField') : 
    parsedHeaders.value.findIndex(h => h.includes('金额') || h.includes('amount') || h.includes('收/支'));
  
  const descriptionIndex = getFieldIndex('descriptionField') >= 0 ? getFieldIndex('descriptionField') : 
    parsedHeaders.value.findIndex(h => h.includes('描述') || h.includes('摘要') || h.includes('商品') || h.includes('description'));
  
  const payeeIndex = getFieldIndex('payeeField') >= 0 ? getFieldIndex('payeeField') : 
    parsedHeaders.value.findIndex(h => h.includes('对方') || h.includes('商家') || h.includes('payee'));

  parsedRows.value.slice(0, 3).forEach((row, index) => {
    if (!row[dateIndex] || !row[amountIndex]) return;

    const date = formatDate(row[dateIndex]);
    const amount = parseFloat(row[amountIndex]) || 0;
    const description = row[descriptionIndex] || row[payeeIndex] || '交易';
    const payee = row[payeeIndex] || '';

    if (amount === 0) return;

    const account = config.value.plusAccount;
    const expenseAccount = amount > 0 ? 'Income:Other' : config.value.minusAccount;

    let record = `${date} * "${payee}" "${description}"\n`;
    record += `  ${account}  ${amount > 0 ? '+' : ''}${amount.toFixed(2)} ${config.value.currency}\n`;
    record += `  ${expenseAccount}  ${amount > 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)} ${config.value.currency}\n`;

    records.push(record);
  });

  return records.join('\n') || '// 无法生成 Beancount 记录';
});

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    const match = dateStr.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    }
    return '2023-01-01';
  }
  return date.toISOString().split('T')[0];
};

// 监听数据源变化，更新默认配置
watch(() => props.dataSource, (newDataSource) => {
  if (newDataSource) {
    config.value.minusAccount = newDataSource.defaultMinusAccount || 'Expenses:Other';
    config.value.plusAccount = newDataSource.defaultPlusAccount || 'Assets:Bank:Default';
    config.value.commissionAccount = newDataSource.defaultCommissionAccount || 'Expenses:Commission';
    config.value.skipRows = newDataSource.skipLines || 0;
    
    // 加载已保存的配置
    loadSavedConfig();
  }
}, { immediate: true });
</script> 