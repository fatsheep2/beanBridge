<template>
  <div v-if="supportedProviders.length > 0">
    
    <!-- 分类选择 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2 justify-center">
        <van-button
          v-for="category in categories" 
          :key="category.value"
          @click="selectedCategory = category.value"
          :type="selectedCategory === category.value ? 'primary' : 'default'"
          size="small"
          round
        >
          {{ category.label }}
        </van-button>
      </div>
    </div>
    
    <!-- 解析器卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      <div
        v-for="provider in paginatedProviders" 
        :key="provider.type"
        :class="['provider-card cursor-pointer', props.selectedProvider === provider.type ? 'provider-card-selected' : '']"
        @click="selectProvider(provider.type)"
      >
        <div class="flex flex-col">
          <!-- Logo -->
          <div class="flex items-center gap-4 mb-4">
            <div :class="[
              'w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl icon-box-transition',
              props.selectedProvider === provider.type ? 'icon-box-selected' : 'icon-box'
            ]">
              <img 
                v-if="!imageErrors[provider.type]"
                :src="provider.icon" 
                class="w-9 h-9 object-contain"
                :alt="provider.name" 
                @error="() => handleImageError(provider.type, provider.name)" 
              />
              <span v-else class="text-2xl">{{ getPlaceholderEmoji(provider.name) }}</span>
            </div>
            <div v-if="props.selectedProvider === provider.type" class="ml-auto text-primary">
              <van-icon name="success" size="20" />
            </div>
          </div>
          <div>
            <h4 class="text-base font-bold mb-2 text-gray-900">{{ provider.name }}</h4>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ provider.description }}</p>
            <div class="flex flex-wrap gap-1">
              <van-tag
                v-for="format in provider.formats" 
                :key="format"
                :type="props.selectedProvider === provider.type ? 'primary' : 'default'"
                size="medium"
                plain
              >
                {{ format }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 flex-wrap">
        <van-button size="small" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">
          上一页
        </van-button>
        <van-button
          v-for="page in visiblePages"
          :key="page"
          size="small"
          :type="page === currentPage ? 'primary' : 'default'"
          @click="currentPage = page"
        >
          {{ page }}
        </van-button>
        <van-button size="small" :disabled="currentPage === totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">
          下一页
        </van-button>
      </div>
      <div class="text-sm text-gray-600 font-medium">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页，{{ filteredProviders.length }} 个解析器
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

// 从配置规则/账单处理页进入时，根据当前解析器选中对应类别（如「加密货币」）
watch(
  () => props.selectedProvider,
  (val) => {
    if (val) {
      const p = props.supportedProviders.find((x) => x.type === val);
      if (p && categories.some((c) => c.value === p.category)) {
        selectedCategory.value = p.category;
      }
    }
  },
  { immediate: true }
);

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

<style scoped>
.provider-card {
  background: var(--van-cell-group-background, #fff);
  border-radius: var(--van-radius-lg, 12px);
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  border: 2px solid transparent;
  transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out;
}
.provider-card-selected {
  border-color: var(--van-primary-color, #0d9488);
  box-shadow: 0 2px 8px rgba(13, 148, 136, .2);
}
.icon-box {
  background: var(--van-gray-1, #f7f8fa);
  border: 2px solid transparent;
}
.icon-box-transition {
  transition: background-color 0.15s ease-out, border-color 0.15s ease-out;
}
.icon-box-selected {
  background: rgba(13, 148, 136, 0.12);
  border-color: var(--van-primary-color, #0d9488);
}
/* 选中时保留图标原色，不再做 invert，避免白图标消失 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
