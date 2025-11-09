<template>
  <div class="rule-list-viewer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">规则列表</h3>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        共 {{ rules.length }} 条规则
      </div>
    </div>

    <!-- 无规则提示 -->
    <div v-if="rules.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>暂无配置规则</p>
    </div>

    <!-- 规则列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
              {{ index + 1 }}
            </span>
            <h4 class="font-semibold text-gray-900 dark:text-white">
              规则 #{{ index + 1 }}
            </h4>
          </div>
          <span
            v-if="rule.ignore"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
          >
            忽略
          </span>
        </div>

        <!-- 规则条件 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div v-if="rule.type" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">交易类型</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
              {{ rule.type }}
            </span>
          </div>
          
          <div v-if="rule.peer" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">交易对手</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
              {{ rule.peer }}
            </span>
          </div>
          
          <div v-if="rule.item" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">商品描述</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              {{ rule.item }}
            </span>
          </div>
          
          <div v-if="rule.category" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">分类</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
              {{ rule.category }}
            </span>
          </div>
          
          <div v-if="rule.method" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">支付方式</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              {{ rule.method }}
              <span v-if="rule.fullMatch" class="ml-1 text-xs">(精确)</span>
            </span>
          </div>
          
          <div v-if="rule.time" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">时间范围</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium">
              {{ rule.time }}
            </span>
          </div>
          
          <div v-if="rule.minPrice !== undefined || rule.maxPrice !== undefined" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">金额范围</span>
            <span class="inline-flex items-center px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
              <span v-if="rule.minPrice !== undefined && rule.maxPrice !== undefined">
                {{ rule.minPrice }} - {{ rule.maxPrice }}
              </span>
              <span v-else-if="rule.minPrice !== undefined">
                ≥ {{ rule.minPrice }}
              </span>
              <span v-else>
                ≤ {{ rule.maxPrice }}
              </span>
            </span>
          </div>
        </div>

        <!-- 账户映射 -->
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
          <div v-if="rule.targetAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">目标账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.targetAccount }}</span>
          </div>
          
          <div v-if="rule.methodAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">支付账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.methodAccount }}</span>
          </div>
          
          <div v-if="rule.pnlAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">损益账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.pnlAccount }}</span>
          </div>
          
          <div v-if="rule.cashAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">现金账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.cashAccount }}</span>
          </div>
          
          <div v-if="rule.positionAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">持仓账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.positionAccount }}</span>
          </div>
          
          <div v-if="rule.commissionAccount" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-gray-600 dark:text-gray-400">佣金账户:</span>
            <span class="text-gray-900 dark:text-white font-mono text-xs">{{ rule.commissionAccount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import yaml from 'js-yaml';

interface Props {
  yamlContent: string;
  provider: string | null;
}

const props = defineProps<Props>();

interface Rule {
  type?: string;
  peer?: string;
  item?: string;
  category?: string;
  method?: string;
  time?: string;
  minPrice?: number;
  maxPrice?: number;
  fullMatch?: boolean;
  ignore?: boolean;
  targetAccount?: string;
  methodAccount?: string;
  pnlAccount?: string;
  cashAccount?: string;
  positionAccount?: string;
  commissionAccount?: string;
}

const rules = computed<Rule[]>(() => {
  if (!props.yamlContent || !props.provider) {
    return [];
  }

  try {
    const config = yaml.load(props.yamlContent) as any;
    
    // 根据不同的 provider 查找规则
    if (config[props.provider] && Array.isArray(config[props.provider].rules)) {
      return config[props.provider].rules;
    }
    
    return [];
  } catch (error) {
    console.error('解析 YAML 规则失败:', error);
    return [];
  }
});
</script>

