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

      <!-- 全匹配 -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">全匹配</p>
            <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ matchedCount }}</p>
          </div>
          <div class="bg-green-500 dark:bg-green-600 rounded-full p-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 半匹配 -->
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">半匹配</p>
            <p class="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{{ partialCount }}</p>
          </div>
          <div class="bg-yellow-500 dark:bg-yellow-600 rounded-full p-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        {{ matchedCount }} 笔全匹配，{{ partialCount }} 笔半匹配，{{ unmatchedCount }} 笔未匹配
      </p>
    </div>

    <!-- 交易明细列表 -->
    <div v-if="sortedTransactions.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">交易明细</h4>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          点击账户可复制，FIXME 标记需要配置规则
        </span>
      </div>

      <!-- 响应式网格：PC 2-3列，移动端 1列 -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        <div
          v-for="(tx, index) in sortedTransactions"
          :key="index"
          class="rounded-xl p-4 hover:shadow-lg transition-all duration-200 border-2"
          :class="getTransactionCardClass(tx.matchStatus)"
        >
          <!-- 卡片头部：状态标签 + 日期 -->
          <div class="flex items-center justify-between mb-3">
            <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              :class="getStatusBadgeClass(tx.matchStatus)"
            >
              {{ getStatusText(tx.matchStatus) }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-mono">{{ tx.date }}</span>
          </div>

          <!-- 交易基本信息 -->
          <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-start gap-2 mb-2">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ tx.payee }}</p>
                <p v-if="tx.narration && tx.narration !== '/'" class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ tx.narration }}</p>
              </div>
            </div>
          </div>

          <!-- 账户信息 - 高亮 FIXME -->
          <div class="space-y-2 mb-3">
            <div
              v-for="(acc, accIdx) in tx.accounts"
              :key="accIdx"
              class="flex items-center justify-between text-sm font-mono p-2 rounded-lg"
              :class="acc.isFIXME 
                ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700' 
                : 'bg-gray-50 dark:bg-gray-800/50'"
            >
              <button
                @click="copyToClipboard(acc.account)"
                class="flex-1 text-left truncate transition-colors"
                :class="acc.isFIXME 
                  ? 'text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-bold' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'"
                :title="`点击复制：${acc.account}`"
              >
                {{ acc.isFIXME ? '⚠️ ' : '' }}{{ acc.account }}
              </button>
              <span 
                class="ml-2 flex-shrink-0 font-semibold"
                :class="parseFloat(acc.amount) < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'"
              >
                {{ acc.amount }}
              </span>
            </div>
          </div>

          <!-- 元数据（折叠显示） -->
          <details v-if="Object.keys(tx.metadata).length > 0" class="text-xs">
            <summary class="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 select-none">
              查看详情 ({{ Object.keys(tx.metadata).length }} 项)
            </summary>
            <div class="mt-2 space-y-1 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
              <div
                v-for="(value, key) in tx.metadata"
                :key="key"
                class="flex gap-2"
              >
                <span class="text-gray-500 dark:text-gray-500 font-semibold min-w-[80px]">{{ key }}:</span>
                <span class="text-gray-700 dark:text-gray-300 break-all">{{ value }}</span>
              </div>
            </div>
          </details>
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
    // 先尝试解析账户行（有缩进，包含金额和货币）
    else if (inTransaction && currentTx && line.trim() && /^\s+[A-Za-z:]+\s+[-]?\d+(?:\.\d+)?\s+\w+/.test(line)) {
      const accountMatch = line.match(/^\s+([A-Za-z:]+)\s+([-]?\d+(?:\.\d+)?)\s+(\w+)/);
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
      } else {
        console.log(`[RuleMatchAnalysis] 账户行匹配失败:`, line.substring(0, 80));
      }
    }
    // 解析元数据（有缩进，单个键值对，冒号后不含账户分隔符）
    else if (inTransaction && currentTx && line.trim() && /^\s+\w+:/.test(line)) {
      const metaMatch = line.match(/^\s+(\w+):\s*"?([^"]*)"?$/);
      if (metaMatch) {
        currentTx.metadata[metaMatch[1]] = metaMatch[2];
        console.log(`[RuleMatchAnalysis] 添加元数据: ${metaMatch[1]} = ${metaMatch[2]}`);
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

// 辅助函数：获取交易卡片样式类
const getTransactionCardClass = (status: 'unmatched' | 'partial' | 'matched') => {
  const classes = {
    unmatched: 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700',
    partial: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700',
    matched: 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700'
  };
  return classes[status];
};

// 辅助函数：获取状态标签样式类
const getStatusBadgeClass = (status: 'unmatched' | 'partial' | 'matched') => {
  const classes = {
    unmatched: 'bg-red-500 dark:bg-red-600 text-white',
    partial: 'bg-yellow-500 dark:bg-yellow-600 text-white',
    matched: 'bg-green-500 dark:bg-green-600 text-white'
  };
  return classes[status];
};

// 辅助函数：获取状态文本
const getStatusText = (status: 'unmatched' | 'partial' | 'matched') => {
  const texts = {
    unmatched: '❌ 未匹配',
    partial: '⚠️ 半匹配',
    matched: '✅ 全匹配'
  };
  return texts[status];
};

// 生成优化建议
const suggestions = computed(() => {
  const result: string[] = [];
  
  if (unmatchedCount.value > 0 || partialCount.value > 0) {
    // 统计未匹配和半匹配交易的共性
    const peers = new Map<string, number>();
    const types = new Map<string, number>();
    
    transactions.value
      .filter(tx => tx.matchStatus === 'unmatched' || tx.matchStatus === 'partial')
      .forEach(tx => {
        if (tx.payee && tx.payee !== '/') {
          peers.set(tx.payee, (peers.get(tx.payee) || 0) + 1);
        }
        if (tx.metadata.type) {
          types.set(tx.metadata.type, (types.get(tx.metadata.type) || 0) + 1);
        }
      });
    
    // 生成建议
    if (peers.size > 0) {
      const topPeer = Array.from(peers.entries()).sort((a, b) => b[1] - a[1])[0];
      if (topPeer[1] > 1) {
        result.push(`发现 ${topPeer[1]} 笔来自"${topPeer[0]}"的交易需要配置，建议添加针对该交易对手的规则`);
      }
    }
    
    if (types.size > 0) {
      const topType = Array.from(types.entries()).sort((a, b) => b[1] - a[1])[0];
      if (topType[1] > 1) {
        result.push(`发现 ${topType[1]} 笔"${topType[0]}"类型的交易需要配置，建议添加针对该类型的规则`);
      }
    }
    
    if (unmatchedCount.value > totalCount.value * 0.3) {
      result.push(`当前规则覆盖率较低（${coverageRate.value.toFixed(1)}%），建议优先配置常见的交易对手和分类规则`);
    }
    
    if (unmatchedCount.value + partialCount.value > 5) {
      result.push('建议使用通配符或正则表达式匹配相似的交易，避免为每笔交易单独配置规则');
    }
    
    if (partialCount.value > 0) {
      result.push(`有 ${partialCount.value} 笔交易仅部分匹配，建议完善这些交易的规则配置`);
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

</script>

