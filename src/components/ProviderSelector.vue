<template>
  <div class="mb-6" v-if="supportedProviders.length > 0">
    <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100"></h2>
    
    <!-- 分类选择 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <!-- <h3 class="text-md font-medium text-gray-800">解析器分类</h3> -->
        <div class="flex space-x-2">
          <button 
            v-for="category in categories" 
            :key="category.value"
            @click="selectedCategory = category.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              selectedCategory === category.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 解析器卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="provider in paginatedProviders" 
        :key="provider.type"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-start hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group"
        @click="selectProvider(provider.type)"
      >
        <div class="flex items-center mb-3 w-full">
          <div class="w-12 h-12 mr-3 flex items-center justify-center rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300"
               :style="{ backgroundColor: provider.color + '20' }">
            <img 
              :src="provider.icon" 
              class="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110" 
              :alt="provider.name + ' logo'" 
              @error="handleImageError" 
            />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ provider.name }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-300">{{ provider.description }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between w-full mt-2">
          <div class="text-xs text-gray-500 dark:text-gray-300">
            格式: {{ provider.formats.join(', ') }}
          </div>
          <div class="w-2 h-2 rounded-full transition-all duration-300"
               :style="{ backgroundColor: provider.color }"></div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center">
      <div class="flex items-center space-x-2">
        <!-- 上一页 -->
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          上一页
        </button>

        <!-- 页码 -->
        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md',
              page === currentPage
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <!-- 下一页 -->
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          下一页
        </button>
      </div>

      <!-- 页面信息 -->
      <div class="ml-4 text-sm text-gray-500 dark:text-gray-400">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
        <span class="mx-2">|</span>
        共 {{ filteredProviders.length }} 个解析器
      </div>
    </div>
    
    <!-- 已选择的解析器信息 -->
    <div v-if="selectedProvider" class="mt-4 p-4 bg-indigo-50 rounded-lg dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-800 dark:text-gray-100">已选择: {{ getSelectedProviderName() }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-300 ">{{ getSelectedProviderDesc() }}</p>
        </div>
        <div class="text-sm text-indigo-600">
          <svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          解析器已就绪
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ProviderType } from '../types/provider';
import { providers, categories, getProviderByType } from '../data/providers';

interface ProviderInfo {
  type: ProviderType;
  name: string;
  formats: string[];
  description: string;
  category: string;
  color: string;
  icon: string;
}

interface Props {
  supportedProviders: ProviderInfo[];
  selectedProvider: ProviderType | null;
}

interface Emits {
  (e: 'provider-selected', providerId: ProviderType): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedCategory = ref<string>('all');
const currentPage = ref(1);
const itemsPerPage = ref(6); // 每页显示6个解析器

// 过滤后的提供者
const filteredProviders = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.supportedProviders;
  }
  return props.supportedProviders.filter(provider => provider.category === selectedCategory.value);
});

// 分页计算
const totalPages = computed(() => {
  return Math.ceil(filteredProviders.value.length / itemsPerPage.value);
});

const paginatedProviders = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredProviders.value.slice(startIndex, endIndex);
});

// 可见页码（最多显示5个页码）
const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    // 如果总页数少于等于5，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // 如果总页数大于5，显示当前页附近的页码
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);
    
    // 调整起始位置，确保显示maxVisible个页码
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// 监听分类变化，重置页码
watch(selectedCategory, () => {
  currentPage.value = 1;
});

const selectProvider = (providerType: ProviderType) => {
  emit('provider-selected', providerType);
};

const getSelectedProviderName = (): string => {
  const provider = props.supportedProviders.find(p => p.type === props.selectedProvider);
  return provider?.name || '未知解析器';
};

const getSelectedProviderDesc = (): string => {
  const provider = props.supportedProviders.find(p => p.type === props.selectedProvider);
  return provider?.description || '通用交易记录解析器';
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};
</script> 