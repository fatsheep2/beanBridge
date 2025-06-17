<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">选择数据源</h2>
    <p class="text-gray-600 mb-6">请选择您的账单数据来源，我们将加载对应的解析规则</p>
    
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-800">数据源分类</h3>
        <div class="flex space-x-2">
          <button 
            v-for="category in categories" 
            :key="category.value"
            @click="selectedCategory = category.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              selectedCategory === category.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="source in filteredDataSources" 
        :key="source.id"
        @click="selectDataSource(source)"
        :class="[
          'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
          selectedDataSourceId === source.id 
            ? 'border-indigo-500 bg-indigo-50 shadow-md' 
            : 'border-gray-200 hover:border-indigo-300'
        ]"
      >
        <div class="flex items-center mb-3">
          <div 
            class="w-10 h-10 mr-3 flex items-center justify-center rounded-lg"
            :style="`background-color: ${source.color}20; border: 2px solid ${source.color}40;`"
          >
            <img 
              :src="source.icon" 
              :alt="source.name"
              class="w-6 h-6 object-contain"
              @error="handleImageError"
            />
          </div>
          <div>
            <h4 class="font-medium text-gray-800">{{ source.name }}</h4>
            <p class="text-sm text-gray-500">{{ source.description }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            支持格式: {{ source.supportedFormats.join(', ') }}
          </div>
          <div v-if="hasConfig(source.id)" class="text-xs text-green-600">
            <i class="fas fa-check-circle mr-1"></i>已配置
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedDataSourceId" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-800">已选择: {{ selectedDataSource?.name }}</h4>
          <p class="text-sm text-gray-600">{{ selectedDataSource?.description }}</p>
        </div>
        <div class="flex space-x-2">
          <button 
            v-if="hasConfig(selectedDataSourceId)"
            @click="editConfig"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <i class="fas fa-edit mr-2"></i>编辑配置
          </button>
          <button 
            @click="createConfig"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i class="fas fa-plus mr-2"></i>{{ hasConfig(selectedDataSourceId) ? '重新配置' : '创建配置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DATA_SOURCES } from '../types/data-source';
import { useDataSourceConfig } from '../composables/useDataSourceConfig';
import type { DataSource } from '../types/data-source';

interface Props {
  onDataSourceSelected: (source: DataSource) => void;
  onEditConfig: (sourceId: string) => void;
}

const props = defineProps<Props>();

const { hasConfig } = useDataSourceConfig();

const selectedCategory = ref<string>('all');
const selectedDataSourceId = ref<string>('');

const categories = [
  { value: 'all', label: '全部' },
  { value: 'payment', label: '支付平台' },
  { value: 'bank', label: '银行' },
  { value: 'crypto', label: '加密货币' },
  { value: 'securities', label: '证券' }
];

const filteredDataSources = computed(() => {
  if (selectedCategory.value === 'all') {
    return DATA_SOURCES;
  }
  return DATA_SOURCES.filter(source => source.category === selectedCategory.value);
});

const selectedDataSource = computed(() => {
  return DATA_SOURCES.find(source => source.id === selectedDataSourceId.value);
});

const selectDataSource = (source: DataSource) => {
  selectedDataSourceId.value = source.id;
  props.onDataSourceSelected(source);
};

const editConfig = () => {
  if (selectedDataSourceId.value) {
    props.onEditConfig(selectedDataSourceId.value);
  }
};

const createConfig = () => {
  if (selectedDataSourceId.value) {
    props.onEditConfig(selectedDataSourceId.value);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 当图片加载失败时，使用SVG默认图标
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    parent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" style="color: ${parent.style.borderColor || '#666'}">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `;
  }
};
</script> 