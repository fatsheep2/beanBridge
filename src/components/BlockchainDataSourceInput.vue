<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-4">区块链数据源配置</h2>
    
    <!-- 区块链网络选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        区块链网络
      </label>
      <select 
        v-model="selectedChain" 
        @change="handleChainChange"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">请选择区块链网络</option>
        <option v-for="chain in supportedChains" :key="chain.value" :value="chain.value">
          {{ chain.label }}
        </option>
      </select>
    </div>

    <!-- 钱包地址输入 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        钱包地址
      </label>
      <input
        v-model="walletAddress"
        type="text"
        placeholder="请输入钱包地址 (例如: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6)"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @blur="validateAddress"
      />
      <p v-if="addressError" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ addressError }}
      </p>
      <p v-else-if="walletAddress && !addressError" class="mt-1 text-sm text-green-600 dark:text-green-400">
        ✓ 地址格式正确
      </p>
    </div>

    <!-- 时间范围选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        时间范围 (可选)
      </label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">开始时间</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">结束时间</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>

    <!-- 代币过滤 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        代币过滤 (可选)
      </label>
      <div class="flex flex-wrap gap-2">
        <label 
          v-for="token in supportedTokens" 
          :key="token" 
          class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <input 
            type="checkbox" 
            :value="token" 
            v-model="selectedTokens"
            class="rounded"
          />
          <span class="text-sm">{{ token }}</span>
        </label>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        不选择则获取所有代币交易记录
      </p>
    </div>

    <!-- 数据源信息显示 -->
    <div v-if="hasValidDataSource" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-green-800 dark:text-green-200">数据源已配置</h4>
          <p class="text-sm text-green-600 dark:text-green-300">
            网络: {{ getChainName(selectedChain) }} | 地址: {{ formatAddress(walletAddress) }}
          </p>
        </div>
        <div class="text-green-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BlockchainNetwork, ProviderType } from '../types/provider';

interface Props {
  selectedProvider: ProviderType | null;
}

interface Emits {
  (e: 'data-source-configured', config: BlockchainDataSourceConfig): void;
}

interface BlockchainDataSourceConfig {
  chain: string;
  address: string;
  startDate?: Date;
  endDate?: Date;
  tokens?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const selectedChain = ref('');
const walletAddress = ref('');
const startDate = ref('');
const endDate = ref('');
const selectedTokens = ref<string[]>([]);
const addressError = ref('');

// 只保留ETH聚合链相关的链选择
const supportedChains = [
  { value: BlockchainNetwork.Ethereum, label: '以太坊 (Ethereum, 支持多链)' },
  { value: BlockchainNetwork.BinanceSmartChain, label: '币安智能链 (BSC)' },
  { value: BlockchainNetwork.Polygon, label: 'Polygon' },
  { value: BlockchainNetwork.Arbitrum, label: 'Arbitrum' },
  { value: BlockchainNetwork.Optimism, label: 'Optimism' },
  { value: BlockchainNetwork.Avalanche, label: 'Avalanche' },
  { value: BlockchainNetwork.Solana, label: 'Solana' },
  { value: BlockchainNetwork.Bitcoin, label: 'Bitcoin' }
];

// 支持的代币（根据选择的链动态变化）
const supportedTokens = computed(() => {
  switch (selectedChain.value) {
    case BlockchainNetwork.Ethereum:
      return ['ETH', 'USDT', 'USDC', 'DAI', 'WETH', 'UNI', 'LINK', 'AAVE'];
    case BlockchainNetwork.BinanceSmartChain:
      return ['BNB', 'BUSD', 'CAKE', 'USDT', 'USDC'];
    case BlockchainNetwork.Polygon:
      return ['MATIC', 'USDT', 'USDC', 'DAI', 'WMATIC'];
    case BlockchainNetwork.Arbitrum:
      return ['ETH', 'USDT', 'USDC', 'DAI', 'ARB'];
    case BlockchainNetwork.Optimism:
      return ['ETH', 'USDT', 'USDC', 'DAI', 'OP'];
    case BlockchainNetwork.Avalanche:
      return ['AVAX', 'USDT', 'USDC', 'DAI'];
    case BlockchainNetwork.Solana:
      return ['SOL', 'USDT', 'USDC', 'RAY', 'SRM'];
    case BlockchainNetwork.Bitcoin:
      return ['BTC'];
    default:
      return [];
  }
});

// 检查是否有有效的数据源
const hasValidDataSource = computed(() => {
  return selectedChain.value && walletAddress.value && !addressError.value;
});

// 地址验证
const validateAddress = () => {
  if (!walletAddress.value) {
    addressError.value = '';
    return;
  }

  const address = walletAddress.value.trim();
  
  switch (selectedChain.value) {
    case BlockchainNetwork.Ethereum:
    case BlockchainNetwork.BinanceSmartChain:
    case BlockchainNetwork.Polygon:
    case BlockchainNetwork.Arbitrum:
    case BlockchainNetwork.Optimism:
    case BlockchainNetwork.Avalanche:
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        addressError.value = '请输入有效的以太坊地址格式 (0x开头的42位字符)';
        return;
      }
      break;
    case BlockchainNetwork.Solana:
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        addressError.value = '请输入有效的Solana地址格式';
        return;
      }
      break;
    case BlockchainNetwork.Bitcoin:
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) && 
          !/^bc1[a-z0-9]{39,59}$/.test(address)) {
        addressError.value = '请输入有效的Bitcoin地址格式';
        return;
      }
      break;
  }
  
  addressError.value = '';
};

// 处理链选择变化
const handleChainChange = () => {
  selectedTokens.value = [];
  validateAddress();
  emitDataSourceConfig();
};

// 格式化地址显示
const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 获取链名称
const getChainName = (chain: string): string => {
  const chainInfo = supportedChains.find(c => c.value === chain);
  return chainInfo?.label || chain;
};

// 发送数据源配置
const emitDataSourceConfig = () => {
  if (!hasValidDataSource.value) return;

  const config: BlockchainDataSourceConfig = {
    chain: selectedChain.value,
    address: walletAddress.value.trim(),
    startDate: startDate.value ? new Date(startDate.value) : undefined,
    endDate: endDate.value ? new Date(endDate.value) : undefined,
    tokens: selectedTokens.value.length > 0 ? selectedTokens.value : undefined
  };

  emit('data-source-configured', config);
};

// 监听数据变化，自动发送配置
watch([selectedChain, walletAddress, startDate, endDate, selectedTokens], () => {
  emitDataSourceConfig();
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  reset: () => {
    selectedChain.value = '';
    walletAddress.value = '';
    startDate.value = '';
    endDate.value = '';
    selectedTokens.value = [];
    addressError.value = '';
  },
  getConfig: (): BlockchainDataSourceConfig | null => {
    if (!hasValidDataSource.value) return null;
    return {
      chain: selectedChain.value,
      address: walletAddress.value.trim(),
      startDate: startDate.value ? new Date(startDate.value) : undefined,
      endDate: endDate.value ? new Date(endDate.value) : undefined,
      tokens: selectedTokens.value.length > 0 ? selectedTokens.value : undefined
    };
  }
});
</script> 