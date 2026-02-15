<template>
  <div v-if="supportedProviders.length > 0">
    
    <!-- 分类选择 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-3 justify-center">
        <n-button
          v-for="category in categories" 
          :key="category.value"
          @click="selectedCategory = category.value"
          :type="selectedCategory === category.value ? 'primary' : 'default'"
          size="medium"
          round
        >
          {{ category.label }}
        </n-button>
      </div>
    </div>
    
    <!-- 解析器卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <n-card
        v-for="provider in paginatedProviders" 
        :key="provider.type"
        :class="[
          'cursor-pointer transition-all',
          props.selectedProvider === provider.type ? 'ring-2 ring-emerald-500' : ''
        ]"
        hoverable
        @click="selectProvider(provider.type)"
      >
        <div class="flex flex-col">
          <!-- Logo -->
          <div class="flex items-center gap-4 mb-4">
            <div :class="[
              'w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-xl transition-all',
              props.selectedProvider === provider.type
                ? 'bg-emerald-500 shadow-md'
                : 'bg-gray-100 dark:bg-gray-700'
            ]">
              <img 
                v-if="!imageErrors[provider.type]"
                :src="provider.icon" 
                class="w-10 h-10 object-contain"
                :alt="provider.name" 
                @error="() => handleImageError(provider.type, provider.name)" 
              />
              <div 
                v-else
                class="flex items-center justify-center text-2xl"
              >
                {{ getPlaceholderEmoji(provider.name) }}
              </div>
            </div>
            
            <!-- 选中标记 -->
            <div 
              v-if="props.selectedProvider === provider.type"
              class="ml-auto"
            >
              <n-icon :size="20" color="#10b981">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </n-icon>
            </div>
          </div>
          
          <!-- 信息 -->
          <div>
            <h4 :class="[
              'text-lg font-bold mb-2',
              props.selectedProvider === provider.type
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
            ]">
              {{ provider.name }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ provider.description }}
            </p>
            <div class="flex flex-wrap gap-2">
              <n-tag
                v-for="format in provider.formats" 
                :key="format"
                :type="props.selectedProvider === provider.type ? 'success' : 'default'"
                size="small"
              >
                {{ format }}
              </n-tag>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <n-button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          size="small"
          round
        >
          上一页
        </n-button>

        <div class="flex items-center gap-1">
          <n-button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :type="page === currentPage ? 'primary' : 'default'"
            size="small"
            round
          >
            {{ page }}
          </n-button>
        </div>

        <n-button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          size="small"
          round
        >
          下一页
        </n-button>
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
import { NButton, NCard, NTag, NIcon } from 'naive-ui';
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
const imageErrors = ref<Record<string, boolean>>({});

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

// 生成占位符 emoji
const getPlaceholderEmoji = (providerName: string): string => {
  // 根据 provider 名称生成对应的 emoji
  const emojiMap: Record<string, string> = {
    'oklink': '🔗',
    'ethereum': '⛓️',
    'bsc': '🟡',
    'polygon': '🟣',
    'arbitrum': '🔵',
    'optimism': '🔴',
    'avalanche': '❄️',
    'solana': '🟢',
    'bitcoin': '₿',
  };
  
  // 如果找到对应的 emoji，使用它
  const emoji = emojiMap[providerName.toLowerCase()];
  if (emoji) {
    return emoji;
  }
  
  // 否则根据名称生成随机 emoji（确保同一名称总是返回相同的 emoji）
  const emojis = ['💎', '🌟', '⚡', '🔥', '🚀', '💫', '✨', '🎯', '🎨', '🎭'];
  let hash = 0;
  for (let i = 0; i < providerName.length; i++) {
    hash = providerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
};

const handleImageError = (providerType: ProviderType, providerName: string) => {
  imageErrors.value[providerType] = true;
  console.log(`[ProviderSelector] 图片加载失败，使用占位符: ${providerName} -> ${getPlaceholderEmoji(providerName)}`);
};
</script>
