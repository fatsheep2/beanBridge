<template>
  <aside class="w-full md:w-64 flex-shrink-0 bg-white rounded-lg shadow p-4 h-fit">
    <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-tasks mr-2 text-indigo-500"></i> 导入步骤
    </h2>
    <ul class="space-y-2">
      <li v-for="(step, index) in steps" :key="index" 
          @click="$emit('step-change', index)"
          :class="[
            'sidebar-item px-3 py-2 rounded-md cursor-pointer flex items-center',
            currentStep === index ? 'bg-indigo-50 text-indigo-600' : ''
          ]"
      >
        <span class="w-6 h-6 rounded-full flex items-center justify-center mr-2"
            :class="currentStep === index ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'">
          {{ index + 1 }}
        </span>
        <i :class="[
          `fas ${step.icon} mr-2 text-sm`,
          currentStep === index ? 'text-indigo-600' : 'text-gray-500'
        ]" style="width: 16px; text-align: center;"></i>
        {{ step.title }}
      </li>
    </ul>

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-history mr-2 text-indigo-500"></i> 最近导入
      </h2>
      <ul class="space-y-2">
        <li v-for="item in recentImports" :key="item.id" 
            class="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
            @click="handleImportClick(item)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-file-alt mr-2 text-gray-500"></i>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium text-gray-800">{{ item.name }}</div>
                <div class="text-xs text-gray-500">{{ item.date }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <span :class="getStatusBadgeClass(item.status)" class="text-xs px-1 py-0.5 rounded">
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="recentImports.length === 0" class="text-center py-4 text-gray-500 text-sm">
        <i class="fas fa-inbox mb-2"></i>
        <p>暂无导入记录</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useImportHistory } from '../composables/useImportHistory';

interface Step {
  title: string;
  icon: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
}

const props = defineProps<Props>();
const { recentImports } = useImportHistory();

defineEmits<{
  'step-change': [index: number];
}>();

function getStatusText(status: string): string {
  switch (status) {
    case 'success': return '成功';
    case 'failed': return '失败';
    case 'partial': return '部分';
    default: return '未知';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'partial': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function handleImportClick(item: any) {
  // 可以在这里处理重新导入的逻辑
  console.log('重新导入:', item);
}
</script>

<style scoped>
.sidebar-item:hover {
  background-color: rgba(79, 70, 229, 0.1);
}
</style> 