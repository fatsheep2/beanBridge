<template>
  <div class="mb-6" v-if="supportedProviders.length > 0">
    <h2 class="text-lg font-semibold mb-4">解析器选择</h2>
    
    <!-- 分类选择 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-md font-medium text-gray-800">解析器分类</h3>
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
    
    <!-- 解析器卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="provider in filteredProviders" 
        :key="provider.type"
        @click="selectProvider(provider.type)"
        :class="[
          'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
          selectedProvider === provider.type 
            ? 'border-indigo-500 bg-indigo-50 shadow-md' 
            : 'border-gray-200 hover:border-indigo-300'
        ]"
      >
        <div class="flex items-center mb-3">
          <div 
            class="w-10 h-10 mr-3 flex items-center justify-center rounded-lg bg-white border"
            :style="`background-color: ${getProviderColor(provider.type)}20; border: 2px solid ${getProviderColor(provider.type)}40;`"
          >
            <img :src="getProviderIcon(provider.type)" :alt="provider.name" class="w-7 h-7 object-contain" @error="handleImageError" />
          </div>
          <div>
            <h4 class="font-medium text-gray-800">{{ provider.name }}</h4>
            <p class="text-sm text-gray-500">{{ getProviderDescription(provider.type) }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            格式: {{ provider.formats.join(', ') }}
          </div>
          <div v-if="selectedProvider === provider.type" class="text-xs text-indigo-600">
            <i class="fas fa-check-circle mr-1"></i>已选择
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已选择的解析器信息 -->
    <div v-if="selectedProvider" class="mt-4 p-4 bg-indigo-50 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-800">已选择: {{ getSelectedProviderName() }}</h4>
          <p class="text-sm text-gray-600">{{ getSelectedProviderDesc() }}</p>
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

interface ProviderInfo {
  type: ProviderType;
  name: string;
  formats: string[];
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

const categories = [
  { value: 'all', label: '全部' },
  { value: 'payment', label: '支付平台' },
  { value: 'bank', label: '银行' },
  { value: 'crypto', label: '加密货币' },
  { value: 'securities', label: '证券' }
];

const filteredProviders = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.supportedProviders;
  }
  return props.supportedProviders.filter(provider => getProviderCategory(provider.type) === selectedCategory.value);
});

const selectProvider = (providerType: ProviderType) => {
  emit('provider-selected', providerType);
};

const getSelectedProviderName = (): string => {
  const provider = props.supportedProviders.find(p => p.type === props.selectedProvider);
  return provider?.name || '未知解析器';
};

const getSelectedProviderDesc = (): string => {
  return getProviderDescription(props.selectedProvider as ProviderType);
};

const getProviderCategory = (type: ProviderType): string => {
  const categoryMap: Record<ProviderType, string> = {
    [ProviderType.Alipay]: 'payment',
    [ProviderType.Wechat]: 'payment',
    [ProviderType.Huobi]: 'crypto',
    [ProviderType.Htsec]: 'securities',
    [ProviderType.Icbc]: 'bank',
    [ProviderType.Td]: 'bank',
    [ProviderType.Bmo]: 'bank',
    [ProviderType.Jd]: 'payment',
    [ProviderType.Citic]: 'bank',
    [ProviderType.HsbcHK]: 'bank',
    [ProviderType.MT]: 'securities',
    [ProviderType.Hxsec]: 'securities'
  };
  return categoryMap[type] || 'other';
};

const getProviderColor = (type: ProviderType): string => {
  const colorMap: Record<ProviderType, string> = {
    [ProviderType.Alipay]: '#1677FF',
    [ProviderType.Wechat]: '#07C160',
    [ProviderType.Huobi]: '#F6851B',
    [ProviderType.Htsec]: '#1E40AF',
    [ProviderType.Icbc]: '#C7000B',
    [ProviderType.Td]: '#00A3E0',
    [ProviderType.Bmo]: '#0074D9',
    [ProviderType.Jd]: '#E1251B',
    [ProviderType.Citic]: '#1E40AF',
    [ProviderType.HsbcHK]: '#DB0011',
    [ProviderType.MT]: '#059669',
    [ProviderType.Hxsec]: '#DC2626'
  };
  return colorMap[type] || '#6B7280';
};

const getProviderIcon = (type: ProviderType): string => {
  const iconMap: Record<ProviderType, string> = {
    [ProviderType.Alipay]: '/icons/alipay.png',
    [ProviderType.Wechat]: '../icons/weixin.png',
    [ProviderType.Huobi]: '/icons/huobi.png',
    [ProviderType.Htsec]: '/icons/htsec.png',
    [ProviderType.Icbc]: '/icons/icbc.png',
    [ProviderType.Td]: '/icons/td.png',
    [ProviderType.Bmo]: '/icons/bmo.png',
    [ProviderType.Jd]: '/icons/jd.png',
    [ProviderType.Citic]: '/icons/citic.png',
    [ProviderType.HsbcHK]: '/icons/hsbc.png',
    [ProviderType.MT]: '/icons/mt.png',
    [ProviderType.Hxsec]: '/icons/hxsec.png'
  };
  return iconMap[type] || '/icons/default.png';
};

const getProviderDescription = (type: ProviderType): string => {
  const descMap: Record<ProviderType, string> = {
    [ProviderType.Alipay]: '支付宝交易记录解析器',
    [ProviderType.Wechat]: '微信支付交易记录解析器',
    [ProviderType.Huobi]: '火币交易记录解析器',
    [ProviderType.Htsec]: '华泰证券交易记录解析器',
    [ProviderType.Icbc]: '工商银行交易记录解析器',
    [ProviderType.Td]: 'TD银行交易记录解析器',
    [ProviderType.Bmo]: 'BMO银行交易记录解析器',
    [ProviderType.Jd]: '京东金融交易记录解析器',
    [ProviderType.Citic]: '中信银行交易记录解析器',
    [ProviderType.HsbcHK]: '汇丰香港交易记录解析器',
    [ProviderType.MT]: 'MT证券交易记录解析器',
    [ProviderType.Hxsec]: '华鑫证券交易记录解析器'
  };
  return descMap[type] || '通用交易记录解析器';
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};
</script> 