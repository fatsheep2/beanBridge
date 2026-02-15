<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-4">数据源选择</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="source in dataSources" 
        :key="source.id"
        @click="handleDataSourceSelected(source)"
        class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-indigo-300"
      >
        <div class="flex items-center mb-3">
          <div class="w-10 h-10 mr-3 flex items-center justify-center rounded-lg bg-indigo-100">
            <i class="fas fa-database text-indigo-600"></i>
          </div>
          <div>
            <h4 class="font-medium text-gray-800">{{ source.name }}</h4>
            <p class="text-sm text-gray-500">{{ source.description }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            格式: {{ source.supportedFormats.join(', ') }}
          </div>
          <button 
            @click.stop="handleEditConfig(source.id)"
            class="text-xs text-indigo-600 hover:text-indigo-800"
          >
            编辑配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { providers } from '../data/providers';

interface DataSource {
  id: string;
  name: string;
  description: string;
  supportedFormats: string[];
}

interface Props {
  onDataSourceSelected: (source: DataSource) => void;
  onEditConfig: (sourceId: string) => void;
}

const props = defineProps<Props>();

// 从providers.ts动态生成数据源列表
const dataSources = computed<DataSource[]>(() => {
  return providers.map(provider => ({
    id: provider.type,
    name: provider.name,
    description: provider.description,
    supportedFormats: provider.formats.map(format => {
      // 将格式转换为小写并添加点号前缀
      const lowerFormat = format.toLowerCase();
      if (lowerFormat === 'csv') return '.csv';
      if (lowerFormat === 'excel') return '.xlsx';
      if (lowerFormat === 'pdf') return '.pdf';
      if (lowerFormat === 'api') return 'API';
      return `.${lowerFormat}`;
    })
  }));
});

const handleDataSourceSelected = (source: DataSource) => {
  props.onDataSourceSelected(source);
};

const handleEditConfig = (sourceId: string) => {
  props.onEditConfig(sourceId);
};
</script> 