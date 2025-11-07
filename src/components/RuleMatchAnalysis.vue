<template>
  <div class="rule-match-analysis bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">规则匹配分析</h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- 总账单数 -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">总账单数</p>
            <p class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ totalCount }}</p>
          </div>
          <div class="bg-blue-500 dark:bg-blue-600 rounded-full p-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 已匹配 -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">已匹配</p>
            <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ matchedCount }}</p>
          </div>
          <div class="bg-green-500 dark:bg-green-600 rounded-full p-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 未匹配 -->
      <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-5 border border-red-200 dark:border-red-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-1">未匹配</p>
            <p class="text-3xl font-bold text-red-900 dark:text-red-100">{{ unmatchedCount }}</p>
          </div>
          <div class="bg-red-500 dark:bg-red-600 rounded-full p-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 覆盖率进度条 -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-lg font-semibold text-gray-900 dark:text-white">规则覆盖率</span>
        <span class="text-2xl font-bold" :class="coverageColorClass">{{ coverageRate.toFixed(1) }}%</span>
      </div>
      <div class="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          :class="coverageBarClass"
          :style="{ width: `${coverageRate}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {{ matchedCount }} 笔账单已正确匹配规则，{{ unmatchedCount }} 笔账单需要配置规则
      </p>
    </div>

    <!-- 未匹配账单列表 -->
    <div v-if="unmatchedCount > 0" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">未匹配账单明细</h4>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          点击可复制相关信息用于配置规则
        </span>
      </div>

      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div
          v-for="(item, index) in unmatchedItems"
          :key="index"
          class="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">
                  未匹配 #{{ index + 1 }}
                </span>
                <span v-if="item.type" class="inline-flex items-center px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                  {{ item.type }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div v-if="item.peer" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">交易对手:</span>
                  <button
                    @click="copyToClipboard(item.peer)"
                    class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="点击复制"
                  >
                    {{ item.peer }}
                  </button>
                </div>
                
                <div v-if="item.item" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">商品描述:</span>
                  <button
                    @click="copyToClipboard(item.item)"
                    class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="点击复制"
                  >
                    {{ item.item }}
                  </button>
                </div>
                
                <div v-if="item.category" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">分类:</span>
                  <button
                    @click="copyToClipboard(item.category)"
                    class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="点击复制"
                  >
                    {{ item.category }}
                  </button>
                </div>
                
                <div v-if="item.method" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">支付方式:</span>
                  <button
                    @click="copyToClipboard(item.method)"
                    class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="点击复制"
                  >
                    {{ item.method }}
                  </button>
                </div>
                
                <div v-if="item.money" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">金额:</span>
                  <span class="text-gray-900 dark:text-white font-mono">{{ item.money }}</span>
                </div>
                
                <div v-if="item.time" class="flex items-center gap-2">
                  <span class="font-medium text-gray-600 dark:text-gray-400">时间:</span>
                  <span class="text-gray-900 dark:text-white">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 建议的规则配置 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 mt-3 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">建议规则配置</span>
            </div>
            <pre class="text-xs font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-2 rounded overflow-x-auto">{{ generateSuggestedRule(item) }}</pre>
            <button
              @click="copyToClipboard(generateSuggestedRule(item))"
              class="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              📋 复制规则配置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div v-if="suggestions.length > 0" class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-xl p-5">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 class="text-lg font-bold text-yellow-900 dark:text-yellow-100">优化建议</h4>
      </div>
      <ul class="space-y-2">
        <li
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200"
        >
          <span class="inline-block w-5 h-5 bg-yellow-400 dark:bg-yellow-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs mt-0.5">
            {{ index + 1 }}
          </span>
          <span>{{ suggestion }}</span>
        </li>
      </ul>
    </div>

    <!-- 全部匹配提示 -->
    <div v-if="unmatchedCount === 0 && totalCount > 0" class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-xl p-6 text-center">
      <svg class="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h4 class="text-xl font-bold text-green-900 dark:text-green-100 mb-2">🎉 完美！</h4>
      <p class="text-green-700 dark:text-green-300">所有账单都已成功匹配规则！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface AccountLine {
  account: string;
  amount: string;
  isFIXME: boolean;
}

interface Transaction {
  date: string;
  payee: string;
  narration: string;
  metadata: Record<string, string>;
  accounts: AccountLine[];
  matchStatus: 'unmatched' | 'partial' | 'matched'; // 未匹配、半匹配、全匹配
  fixmeCount: number;
}

interface Props {
  processedData: string;
  totalRecords?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 解析所有交易
const transactions = computed<Transaction[]>(() => {
  console.log('[RuleMatchAnalysis] 开始解析所有交易');
  console.log('[RuleMatchAnalysis] processedData 长度:', props.processedData?.length || 0);
  
  if (!props.processedData) {
    console.log('[RuleMatchAnalysis] processedData 为空');
    return [];
  }

  const result: Transaction[] = [];
  const lines = props.processedData.split('\n');
  console.log('[RuleMatchAnalysis] 总行数:', lines.length);
  
  let currentTx: Transaction | null = null;
  let inTransaction = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 检测交易开始（日期行）
    if (/^\d{4}-\d{2}-\d{2}\s+\*/.test(trimmed)) {
      // 保存上一笔交易
      if (currentTx) {
        result.push(currentTx);
        console.log('[RuleMatchAnalysis] 完成一笔交易:', currentTx);
      }
      
      // 解析日期、payee、narration
      const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+\*\s+"([^"]*)"\s+"([^"]*)"/);
      if (match) {
        currentTx = {
          date: match[1],
          payee: match[2],
          narration: match[3],
          metadata: {},
          accounts: [],
          matchStatus: 'matched',
          fixmeCount: 0
        };
        inTransaction = true;
        console.log(`[RuleMatchAnalysis] 开始新交易: ${currentTx.date} ${currentTx.payee}`);
      }
    }
    // 解析元数据
    else if (inTransaction && currentTx && trimmed && /^\w+:/.test(trimmed)) {
      const metaMatch = trimmed.match(/^(\w+):\s*"?([^"]*)"?$/);
      if (metaMatch) {
        currentTx.metadata[metaMatch[1]] = metaMatch[2];
      }
    }
    // 解析账户行
    else if (inTransaction && currentTx && trimmed && /^[A-Z]/.test(trimmed)) {
      const accountMatch = trimmed.match(/^([A-Za-z:]+)\s+([-]?\d+(?:\.\d+)?)\s+(\w+)/);
      if (accountMatch) {
        const account = accountMatch[1];
        const amount = accountMatch[2];
        const isFIXME = account.includes('FIXME');
        
        currentTx.accounts.push({
          account,
          amount,
          isFIXME
        });
        
        if (isFIXME) {
          currentTx.fixmeCount++;
        }
        
        console.log(`[RuleMatchAnalysis] 添加账户: ${account} ${amount} (FIXME: ${isFIXME})`);
      }
    }
    // 空行表示交易结束
    else if (inTransaction && !trimmed) {
      if (currentTx && currentTx.accounts.length > 0) {
        // 确定匹配状态
        if (currentTx.fixmeCount === 0) {
          currentTx.matchStatus = 'matched';
        } else if (currentTx.fixmeCount >= currentTx.accounts.length) {
          currentTx.matchStatus = 'unmatched';
        } else {
          currentTx.matchStatus = 'partial';
        }
        
        result.push(currentTx);
        console.log('[RuleMatchAnalysis] 完成一笔交易:', currentTx);
      }
      currentTx = null;
      inTransaction = false;
    }
  }
  
  // 处理最后一笔交易
  if (currentTx && currentTx.accounts.length > 0) {
    if (currentTx.fixmeCount === 0) {
      currentTx.matchStatus = 'matched';
    } else if (currentTx.fixmeCount >= currentTx.accounts.length) {
      currentTx.matchStatus = 'unmatched';
    } else {
      currentTx.matchStatus = 'partial';
    }
    result.push(currentTx);
    console.log('[RuleMatchAnalysis] 完成最后一笔交易:', currentTx);
  }
  
  console.log('[RuleMatchAnalysis] 解析完成，共', result.length, '笔交易');
  console.log('[RuleMatchAnalysis] 交易列表:', result);
  
  return result;
});

// 按匹配状态排序：未匹配 → 半匹配 → 全匹配
const sortedTransactions = computed(() => {
  const sorted = [...transactions.value].sort((a, b) => {
    const order = { unmatched: 0, partial: 1, matched: 2 };
    return order[a.matchStatus] - order[b.matchStatus];
  });
  console.log('[RuleMatchAnalysis] 排序后的交易:', sorted);
  return sorted;
});

// 统计信息
const totalCount = computed(() => transactions.value.length);
const unmatchedCount = computed(() => transactions.value.filter(t => t.matchStatus === 'unmatched').length);
const partialCount = computed(() => transactions.value.filter(t => t.matchStatus === 'partial').length);
const matchedCount = computed(() => transactions.value.filter(t => t.matchStatus === 'matched').length);

console.log('[RuleMatchAnalysis] 统计:', {
  total: totalCount.value,
  unmatched: unmatchedCount.value,
  partial: partialCount.value,
  matched: matchedCount.value
});

// 覆盖率
const coverageRate = computed(() => {
  if (totalCount.value === 0) {
    console.log('[RuleMatchAnalysis] totalCount 为 0，覆盖率返回 0');
    return 0;
  }
  const rate = (matchedCount.value / totalCount.value) * 100;
  console.log('[RuleMatchAnalysis] 覆盖率:', rate.toFixed(2) + '%');
  return rate;
});

// 覆盖率颜色
const coverageColorClass = computed(() => {
  const rate = coverageRate.value;
  if (rate >= 90) return 'text-green-600 dark:text-green-400';
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
});

const coverageBarClass = computed(() => {
  const rate = coverageRate.value;
  if (rate >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-500';
  if (rate >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
  return 'bg-gradient-to-r from-red-500 to-pink-500';
});

// 生成优化建议
const suggestions = computed(() => {
  const result: string[] = [];
  
  if (unmatchedCount.value > 0) {
    // 统计未匹配账单的共性
    const peers = new Map<string, number>();
    const categories = new Map<string, number>();
    const types = new Map<string, number>();
    
    unmatchedItems.value.forEach(item => {
      if (item.peer) {
        peers.set(item.peer, (peers.get(item.peer) || 0) + 1);
      }
      if (item.category) {
        categories.set(item.category, (categories.get(item.category) || 0) + 1);
      }
      if (item.type) {
        types.set(item.type, (types.get(item.type) || 0) + 1);
      }
    });
    
    // 生成建议
    if (peers.size > 0) {
      const topPeer = Array.from(peers.entries()).sort((a, b) => b[1] - a[1])[0];
      if (topPeer[1] > 1) {
        result.push(`发现 ${topPeer[1]} 笔来自"${topPeer[0]}"的交易未匹配，建议添加针对该交易对手的规则`);
      }
    }
    
    if (categories.size > 0) {
      const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0];
      if (topCategory[1] > 1) {
        result.push(`发现 ${topCategory[1]} 笔"${topCategory[0]}"分类的交易未匹配，建议添加针对该分类的规则`);
      }
    }
    
    if (unmatchedCount.value > totalCount.value * 0.3) {
      result.push(`当前规则覆盖率较低（${coverageRate.value.toFixed(1)}%），建议优先配置常见的交易对手和分类规则`);
    }
    
    if (unmatchedCount.value > 5) {
      result.push('建议使用通配符或正则表达式匹配相似的交易，避免为每笔交易单独配置规则');
    }
  }
  
  return result;
});

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // 可以添加一个提示
    console.log('已复制:', text);
  });
};

// 生成建议的规则配置
const generateSuggestedRule = (item: BillItem): string => {
  const rules: string[] = [];
  
  if (item.type) {
    rules.push(`  - type: ${item.type}`);
  }
  if (item.peer) {
    rules.push(`    peer: ${item.peer}`);
  }
  if (item.item) {
    rules.push(`    item: ${item.item}`);
  }
  if (item.category) {
    rules.push(`    category: ${item.category}`);
  }
  if (item.method) {
    rules.push(`    method: ${item.method}`);
  }
  
  rules.push(`    targetAccount: Expenses:FIXME  # 请修改为合适的账户`);
  rules.push(`    methodAccount: Assets:FIXME    # 请修改为合适的账户`);
  
  return rules.join('\n');
};
</script>

