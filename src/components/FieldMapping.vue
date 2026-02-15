<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">配置字段映射</h2>
    <p class="text-gray-600 mb-6">请将您的文件字段映射到Beancount交易字段</p>
    
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-gray-800">示例数据预览</h3>
        <van-button size="small" plain @click="showSampleData = !showSampleData">
          {{ showSampleData ? '隐藏' : '显示' }}示例
        </van-button>
      </div>
      
      <transition name="fade">
        <div v-if="showSampleData" class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden">
            <thead class="bg-gray-100">
              <tr>
                <th v-for="(header, index) in sampleHeaders" :key="index" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(row, rowIndex) in sampleRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </transition>
    </div>
    
    <div class="space-y-4">
      <div v-for="(field, index) in mappingFields" :key="index" class="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-white border rounded-lg">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
          <p class="text-xs text-gray-500">{{ field.description }}</p>
        </div>
        <div class="flex-1">
          <select v-model="field.mappedTo" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="">-- 选择字段 --</option>
            <option v-for="(header, i) in sampleHeaders" :key="i" :value="header">{{ header }}</option>
          </select>
        </div>
        <div class="flex items-center">
          <van-button size="small" @click="testFieldMapping(field)">测试</van-button>
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-between flex-wrap gap-2">
      <van-button @click="$emit('prev-step')">上一步</van-button>
      <van-button type="primary" @click="$emit('next-step')">下一步</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MappingField {
  label: string;
  mappedTo: string;
  description: string;
  required: boolean;
}

interface Props {
  headers: string[];
  rows: any[][];
}

const props = defineProps<Props>();

defineEmits<{
  'prev-step': [];
  'next-step': [];
}>();

const showSampleData = ref(true);

const sampleHeaders = ref(['日期', '交易时间', '交易类型', '对方', '商品', '金额', '支付方式', '状态']);
const sampleRows = ref([
  ['2023-06-15', '14:23:45', '消费', '星巴克咖啡', '大杯拿铁', '-35.00', '支付宝余额', '支付成功'],
  ['2023-06-16', '09:12:33', '收入', '张三', '还款', '500.00', '招商银行', '已到账'],
  ['2023-06-17', '18:45:21', '消费', '京东商城', '电子产品', '-1299.00', '花呗', '支付成功']
]);

const mappingFields = ref<MappingField[]>([
  { label: '日期', mappedTo: '', description: '交易的日期', required: true },
  { label: '金额', mappedTo: '', description: '交易金额，正数为收入，负数为支出', required: true },
  { label: '收款人', mappedTo: '', description: '交易的对方或商家名称', required: false },
  { label: '账户', mappedTo: '', description: '交易涉及的账户', required: true },
  { label: '描述', mappedTo: '', description: '交易的详细说明', required: false },
  { label: '标签', mappedTo: '', description: '用于分类交易的标签', required: false }
]);

const testFieldMapping = (field: MappingField) => {
  alert(`测试字段映射: ${field.label} -> ${field.mappedTo || '未映射'}`);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 