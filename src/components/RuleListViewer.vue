<template>
  <div class="rule-list-viewer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">规则列表</h3>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        共 {{ totalRuleCount }} 条规则
      </div>
    </div>

    <div v-if="displayGroups.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>暂无配置规则</p>
    </div>

    <div v-else class="space-y-8">
      <div
        v-for="(group, groupIndex) in displayGroups"
        :key="group.address"
        class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4"
      >
        <div
          v-if="group.showHeader"
          class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3"
        >
          <div>
            <div class="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-sm">
                {{ groupIndex + 1 }}
              </span>
              <span>{{ group.displayName }}</span>
            </div>
            <div class="mt-1 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
              {{ group.address }}
            </div>
          </div>
          <div
            v-if="group.defaultCashAccount"
            class="flex items-center gap-2 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m3 14v2m-6 0h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            默认现金账户:
            <span class="font-mono text-xs sm:text-sm break-all">{{ group.defaultCashAccount }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="(rule, ruleIndex) in group.rules"
            :key="`${group.address}-${ruleIndex}`"
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold text-sm">
                  {{ group.showHeader ? `${groupIndex + 1}-${ruleIndex + 1}` : ruleIndex + 1 }}
                </span>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  规则 #{{ group.showHeader ? `${groupIndex + 1}-${ruleIndex + 1}` : ruleIndex + 1 }}
                </h4>
              </div>
              <span
                v-if="rule.ignore"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              >
                忽略
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div v-if="rule.tokenName" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">代币名称</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                  {{ rule.tokenName }}
                </span>
              </div>

              <div v-if="rule.tokenSymbol" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">代币符号</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                  {{ rule.tokenSymbol }}
                </span>
              </div>

              <div v-if="rule.direction" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">交易方向</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium">
                  {{ formatDirection(rule.direction) }}
                </span>
              </div>

              <div v-if="rule.type" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">交易类型</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                  {{ rule.type }}
                </span>
              </div>

              <div v-if="rule.peer" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">交易对手</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium break-all">
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

              <div v-if="rule.currency" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">货币</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-medium">
                  {{ rule.currency }}
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

              <div v-if="rule.minAmount !== undefined || rule.maxAmount !== undefined" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">代币数量</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                  <span v-if="rule.minAmount !== undefined && rule.maxAmount !== undefined">
                    {{ rule.minAmount }} - {{ rule.maxAmount }}
                  </span>
                  <span v-else-if="rule.minAmount !== undefined">
                    ≥ {{ rule.minAmount }}
                  </span>
                  <span v-else>
                    ≤ {{ rule.maxAmount }}
                  </span>
                </span>
              </div>

              <div v-if="rule.contractAddress" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">合约地址</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-mono break-all">
                  {{ rule.contractAddress }}
                </span>
              </div>

              <div v-if="rule._address && !group.showHeader" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">钱包地址</span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-mono break-all">
                  {{ rule._address }}
                </span>
              </div>
            </div>

            <div v-if="parseTags(rule.tags).length > 0" class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in parseTags(rule.tags)"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
              <div v-if="rule.targetAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">目标账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.targetAccount }}</span>
              </div>

              <div v-if="rule.methodAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">支付账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.methodAccount }}</span>
              </div>

              <div v-if="rule.pnlAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">损益账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.pnlAccount }}</span>
              </div>

              <div v-if="rule.cashAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">现金账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.cashAccount }}</span>
              </div>

              <div v-if="rule.positionAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">持仓账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.positionAccount }}</span>
              </div>

              <div v-if="rule.commissionAccount" class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="当前颜色" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium text-gray-600 dark:text-gray-400">佣金账户:</span>
                <span class="text-gray-900 dark:text-white font-mono text-xs break-all">{{ rule.commissionAccount }}</span>
              </div>
            </div>
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

interface Rule {
  type?: string;
  peer?: string;
  item?: string;
  category?: string;
  method?: string;
  time?: string;
  minPrice?: number;
  maxPrice?: number;
  minAmount?: number;
  maxAmount?: number;
  fullMatch?: boolean;
  ignore?: boolean;
  targetAccount?: string;
  methodAccount?: string;
  pnlAccount?: string;
  cashAccount?: string;
  positionAccount?: string;
  commissionAccount?: string;
  tokenSymbol?: string;
  tokenName?: string;
  contractAddress?: string;
  direction?: string;
  currency?: string;
  tags?: string[] | string;
  _address?: string;
}

interface RuleGroup {
  address: string;
  displayName: string;
  showHeader: boolean;
  defaultCashAccount?: string;
  rules: Rule[];
}

const props = defineProps<Props>();

const isOklink = computed(() => props.provider === 'oklink');

const parseTags = (tags: unknown): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .map(tag => (typeof tag === 'string' ? tag.trim() : String(tag)))
      .filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const formatDirection = (direction?: string): string => {
  if (direction === 'recv') return '接收';
  if (direction === 'send') return '发送';
  return direction ?? '';
};

const loadYamlConfig = computed(() => {
  if (!props.yamlContent) return null;
  try {
    return yaml.load(props.yamlContent) as Record<string, any> | null;
  } catch (error) {
    console.error('解析 YAML 规则失败:', error);
    return null;
  }
});

const oklinkRuleGroups = computed<RuleGroup[]>(() => {
  if (!isOklink.value || !loadYamlConfig.value) {
    return [];
  }

  const providerConfig = loadYamlConfig.value['oklink'];
  if (!providerConfig || typeof providerConfig !== 'object') {
    return [];
  }

  const groups: RuleGroup[] = [];

  for (const [address, info] of Object.entries(providerConfig as Record<string, any>)) {
    if (!info || typeof info !== 'object') continue;

    const rulesArray = Array.isArray((info as any).rules) ? (info as any).rules as Rule[] : [];
    const normalizedRules = rulesArray.map(rule => ({
      ...rule,
      _address: address,
    }));

    if (normalizedRules.length === 0) continue;

    const displayName = `地址 ${address.slice(0, 6)}...${address.slice(-4)}`;

    groups.push({
      address,
      displayName,
      showHeader: true,
      defaultCashAccount: typeof (info as any).defaultCashAccount === 'string' ? (info as any).defaultCashAccount : undefined,
      rules: normalizedRules,
    });
  }

  return groups;
});

const standardRules = computed<Rule[]>(() => {
  if (!loadYamlConfig.value || !props.provider || isOklink.value) {
    return [];
  }
  const providerConfig = loadYamlConfig.value[props.provider];
  if (providerConfig && Array.isArray((providerConfig as any).rules)) {
    return (providerConfig as any).rules as Rule[];
  }
  return [];
});

const displayGroups = computed<RuleGroup[]>(() => {
  if (isOklink.value) {
    return oklinkRuleGroups.value;
  }

  if (standardRules.value.length === 0) {
    return [];
  }

  return [
    {
      address: 'default',
      displayName: '默认规则',
      showHeader: false,
      rules: standardRules.value,
    },
  ];
});

const totalRuleCount = computed(() =>
  displayGroups.value.reduce((sum, group) => sum + group.rules.length, 0)
);
</script>

<style scoped>
.rule-list-viewer {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.rule-list-viewer:hover {
  transform: translateY(-2px);
}
</style>
