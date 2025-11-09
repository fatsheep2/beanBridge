<template>
  <div v-if="supportedProviders.length > 0">
    
    <!-- 分类选择 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-3 justify-center">
        <button 
          v-for="category in categories" 
          :key="category.value"
          @click="selectedCategory = category.value"
          :class="[
            'px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300',
            selectedCategory === category.value 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:scale-105'
          ]"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
    
    <!-- 解析器卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <button 
        v-for="provider in paginatedProviders" 
        :key="provider.type"
        @click="selectProvider(provider.type)"
        :class="[
          'group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105',
          props.selectedProvider === provider.type
            ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 shadow-xl shadow-blue-500/20'
            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg hover:shadow-xl'
        ]"
      >
        <!-- 背景装饰 -->
        <div 
          v-if="props.selectedProvider === provider.type"
          class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-12 -mt-12"
        ></div>
        
        <div class="relative">
          <!-- Logo -->
          <div class="flex items-center gap-4 mb-4">
            <div :class="[
              'w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300',
              props.selectedProvider === provider.type
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50'
                : 'bg-gray-50 dark:bg-gray-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
            ]">
              <img 
                :src="provider.icon" 
                :class="[
                  'object-contain transition-all duration-300',
                  props.selectedProvider === provider.type ? 'w-10 h-10' : 'w-9 h-9 group-hover:w-10 group-hover:h-10'
                ]"
                :alt="provider.name" 
                @error="handleImageError" 
              />
            </div>
            
            <!-- 选中标记 -->
            <div 
              v-if="props.selectedProvider === provider.type"
              class="ml-auto"
            >
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 信息 -->
          <div>
            <h4 :class="[
              'text-lg font-bold mb-2 transition-colors',
              props.selectedProvider === provider.type
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
            ]">
              {{ provider.name }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ provider.description }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="format in provider.formats" 
                :key="format"
                :class="[
                  'px-2 py-1 rounded-lg text-xs font-medium',
                  props.selectedProvider === provider.type
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                ]"
              >
                {{ format }}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 transition-all"
        >
          上一页
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-xl transition-all',
              page === currentPage
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 transition-all"
        >
          下一页
        </button>
      </div>

      <div class="text-base text-gray-600 dark:text-gray-400 font-medium">
        第 <span class="font-bold text-gray-900 dark:text-white">{{ currentPage }}</span> 页，
        共 <span class="font-bold text-gray-900 dark:text-white">{{ totalPages }}</span> 页 
        <span class="mx-2">|</span> 
        共 <span class="font-bold text-gray-900 dark:text-white">{{ filteredProviders.length }}</span> 个解析器
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
const itemsPerPage = ref(8); // 增加到每页8个

const filteredProviders = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.supportedProviders;
  }
  return props.supportedProviders.filter(provider => provider.category === selectedCategory.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProviders.value.length / itemsPerPage.value);
});

const paginatedProviders = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredProviders.value.slice(startIndex, endIndex);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

watch(selectedCategory, () => {
  currentPage.value = 1;
});

const selectProvider = (providerType: ProviderType) => {
  emit('provider-selected', providerType);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};
</script>
