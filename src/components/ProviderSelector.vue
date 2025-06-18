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
        v-for="provider in filteredProviders" 
        :key="provider.type"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-start hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700 cursor-pointer"
        @click="selectProvider(provider.type)"
      >
        <div class="flex items-center mb-3">
          <div class="w-12 h-12 mr-3 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
            <img :src="provider.icon" class="w-8 h-8 object-contain" :alt="provider.name + ' logo'" @error="handleImageError" />
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ provider.name }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-300">{{ provider.description }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between w-full mt-2">
          <div class="text-xs text-gray-500 dark:text-gray-300">
            格式: {{ provider.formats.join(', ') }}
          </div>
          <!-- <button 
            @click.stop="selectProvider(provider.type)"
            class="text-xs text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-400"
          >
            编辑配置
          </button> -->
        </div>
        <!-- <button 
          @click="selectProvider(provider.type)"
          class="mt-4 w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 transition-colors font-medium shadow"
        >
          选择
        </button> -->
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
          <i class="fas fa-check-circle mr-1"></i>解析器已就绪
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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

const filteredProviders = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.supportedProviders;
  }
  return props.supportedProviders.filter(provider => provider.category === selectedCategory.value);
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