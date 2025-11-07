<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-4">规则配置编辑器</h2>
    
    <div class="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 class="text-md font-medium mb-2">数据源信息</h3>
      <p class="text-sm text-gray-600">数据源: {{ dataSource?.name || '未知' }}</p>
      <p class="text-sm text-gray-600">文件内容预览: {{ fileContent?.substring(0, 200) }}...</p>
    </div>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">字段映射配置</label>
        <textarea 
          v-model="configText"
          class="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="请输入字段映射配置..."
        ></textarea>
      </div>
      
      <div class="flex gap-4">
        <button 
          @click="saveConfig"
          class="inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg transition-all duration-200"
        >
          保存配置
        </button>
        <button 
          @click="resetConfig"
          class="inline-flex items-center px-10 py-4 text-lg font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl shadow-lg transition-all duration-200"
        >
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface DataSource {
  id: string;
  name: string;
  description: string;
  supportedFormats: string[];
}

interface Props {
  dataSource: DataSource | null;
  fileContent: string | null;
}

interface Emits {
  (e: 'config-saved', config: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const configText = ref('');

onMounted(() => {
  // 初始化配置文本
  configText.value = `# ${props.dataSource?.name || '数据源'} 配置
# 请根据实际需要修改以下配置

field_mapping:
  date: "交易时间"
  amount: "金额"
  type: "交易类型"
  peer: "交易对方"
  note: "备注"

rules:
  - name: "收入识别"
    condition: "type contains '收入'"
    action: "set_type('recv')"
  
  - name: "支出识别"
    condition: "type contains '支出'"
    action: "set_type('send')"
`;
});

const saveConfig = () => {
  try {
    const config = {
      id: `${props.dataSource?.id}_config_${Date.now()}`,
      dataSourceId: props.dataSource?.id || '',
      config: {
        rules: [],
        accounts: [],
        defaultCurrency: 'CNY',
        provider: props.dataSource?.id || ''
      },
      content: configText.value
    };
    
    emit('config-saved', config);
  } catch (error) {
    console.error('保存配置失败:', error);
  }
};

const resetConfig = () => {
  configText.value = '';
};
</script> 