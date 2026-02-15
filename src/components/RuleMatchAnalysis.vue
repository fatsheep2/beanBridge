<template>
  <van-cell-group class="rule-match-analysis" inset>
    <div class="flex items-center justify-between pa-4">
      <h3 class="section-title">规则匹配分析</h3>
      <van-button size="small" plain @click="$emit('close')">关闭</van-button>
    </div>

    <!-- 统计：用 van-cell 展示 -->
    <van-cell-group inset class="stats-group">
      <van-cell title="总账单数" :value="String(totalCount)" />
      <van-cell title="全匹配" :value="String(matchedCount)" value-class="match-success" />
      <van-cell title="半匹配" :value="String(partialCount)" value-class="match-partial" />
      <van-cell title="未匹配" :value="String(unmatchedCount)" value-class="match-unmatch" />
    </van-cell-group>

    <!-- 覆盖率 -->
    <div class="pa-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-secondary">规则覆盖率</span>
        <span class="font-semibold">{{ coverageRate.toFixed(1) }}%</span>
      </div>
      <van-progress :percentage="coverageRate" :stroke-width="8" :pivot-text="`${coverageRate.toFixed(1)}%`" />
      <p class="text-xs text-secondary mt-2">
        {{ matchedCount }} 笔全匹配，{{ partialCount }} 笔半匹配，{{ unmatchedCount }} 笔未匹配
      </p>
    </div>

    <!-- 交易明细：卡片网格，小屏 1 列、中屏 2 列、大屏 3 列 -->
    <div v-if="sortedTransactions.length > 0" class="pa-4 pt-0">
      <h4 class="text-sm font-semibold mb-3">交易明细</h4>
      <p class="text-xs text-secondary mb-3">点击账户可复制，FIXME 需配置规则</p>
      <div class="transaction-list transaction-grid">
        <van-cell-group
          v-for="(tx, index) in sortedTransactions"
          :key="index"
          inset
          class="tx-card"
        >
          <van-cell :border="false">
            <template #title>
              <van-tag :type="getStatusTagType(tx.matchStatus)" size="medium" class="mr-2">
                {{ getStatusText(tx.matchStatus) }}
              </van-tag>
              <span class="text-xs text-secondary">{{ tx.date }}</span>
            </template>
          </van-cell>
          <van-cell :title="tx.payee" :label="tx.narration && tx.narration !== '/' ? tx.narration : ''" :border="false" />
          <van-cell
            v-for="(acc, accIdx) in tx.accounts"
            :key="accIdx"
            :border="false"
            clickable
            @click="copyToClipboard(acc.account)"
          >
            <template #title>
              <span class="font-mono text-sm">{{ acc.isFIXME ? '⚠️ ' : '' }}{{ acc.account }}</span>
            </template>
            <template #value>
              <span class="font-mono" :class="parseFloat(acc.amount) < 0 ? 'negative' : 'positive'">
                {{ acc.amount }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 优化建议：独立容器，每条建议一张卡片 -->
    <div v-if="suggestions.length > 0" class="pa-4 suggestions-section">
      <h4 class="text-sm font-semibold mb-3">优化建议</h4>
      <div class="suggestions-grid">
        <div v-for="(suggestion, idx) in suggestions" :key="idx" class="suggestion-card">
          <span class="suggestion-icon" aria-hidden="true">💡</span>
          <span class="suggestion-text">{{ suggestion }}</span>
        </div>
      </div>
    </div>

    <!-- 全部匹配 -->
    <van-empty
      v-if="unmatchedCount === 0 && totalCount > 0"
      description="所有账单都已成功匹配规则"
      class="py-6"
    />
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AccountLine {
  account: string
  amount: string
  isFIXME: boolean
}

interface Transaction {
  date: string
  payee: string
  narration: string
  metadata: Record<string, string>
  accounts: AccountLine[]
  matchStatus: 'unmatched' | 'partial' | 'matched'
  fixmeCount: number
}

interface Props {
  processedData: string
  totalRecords?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const transactions = computed<Transaction[]>(() => {
  if (!props.processedData) return []
  const result: Transaction[] = []
  const lines = props.processedData.split('\n')
  let currentTx: Transaction | null = null
  let inTransaction = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (/^\d{4}-\d{2}-\d{2}\s+\*/.test(trimmed)) {
      if (currentTx) result.push(currentTx)
      const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+\*\s+"([^"]*)"\s+"([^"]*)"/)
      if (match) {
        currentTx = {
          date: match[1],
          payee: match[2],
          narration: match[3],
          metadata: {},
          accounts: [],
          matchStatus: 'matched',
          fixmeCount: 0
        }
        inTransaction = true
      }
    } else if (inTransaction && currentTx && line.trim() && /^\s+[A-Za-z:]+\s+[-]?\d+(?:\.\d+)?\s+\w+/.test(line)) {
      const accountMatch = line.match(/^\s+([A-Za-z:]+)\s+([-]?\d+(?:\.\d+)?)\s+(\w+)/)
      if (accountMatch) {
        const account = accountMatch[1]
        const amount = accountMatch[2]
        const isFIXME = account.includes('FIXME')
        currentTx.accounts.push({ account, amount, isFIXME })
        if (isFIXME) currentTx.fixmeCount++
      }
    } else if (inTransaction && currentTx && line.trim() && /^\s+\w+:/.test(line)) {
      const metaMatch = line.match(/^\s+(\w+):\s*"?([^"]*)"?$/)
      if (metaMatch) currentTx.metadata[metaMatch[1]] = metaMatch[2]
    } else if (inTransaction && !trimmed) {
      if (currentTx && currentTx.accounts.length > 0) {
        currentTx.matchStatus =
          currentTx.fixmeCount === 0 ? 'matched'
            : currentTx.fixmeCount >= currentTx.accounts.length ? 'unmatched' : 'partial'
        result.push(currentTx)
      }
      currentTx = null
      inTransaction = false
    }
  }

  if (currentTx && currentTx.accounts.length > 0) {
    currentTx.matchStatus =
      currentTx.fixmeCount === 0 ? 'matched'
        : currentTx.fixmeCount >= currentTx.accounts.length ? 'unmatched' : 'partial'
    result.push(currentTx)
  }
  return result
})

const sortedTransactions = computed(() =>
  [...transactions.value].sort((a, b) => {
    const order = { unmatched: 0, partial: 1, matched: 2 }
    return order[a.matchStatus] - order[b.matchStatus]
  })
)

const totalCount = computed(() => transactions.value.length)
const unmatchedCount = computed(() => transactions.value.filter(t => t.matchStatus === 'unmatched').length)
const partialCount = computed(() => transactions.value.filter(t => t.matchStatus === 'partial').length)
const matchedCount = computed(() => transactions.value.filter(t => t.matchStatus === 'matched').length)

const coverageRate = computed(() =>
  totalCount.value === 0 ? 0 : (matchedCount.value / totalCount.value) * 100
)

const getStatusTagType = (status: 'unmatched' | 'partial' | 'matched') => {
  const map = { unmatched: 'danger', partial: 'warning', matched: 'success' }
  return map[status]
}

const getStatusText = (status: 'unmatched' | 'partial' | 'matched') => {
  const texts = { unmatched: '未匹配', partial: '半匹配', matched: '全匹配' }
  return texts[status]
}

const suggestions = computed(() => {
  const result: string[] = []
  if (unmatchedCount.value > 0 || partialCount.value > 0) {
    const peers = new Map<string, number>()
    transactions.value
      .filter(tx => tx.matchStatus === 'unmatched' || tx.matchStatus === 'partial')
      .forEach(tx => {
        if (tx.payee && tx.payee !== '/') peers.set(tx.payee, (peers.get(tx.payee) || 0) + 1)
      })
    const topPeer = Array.from(peers.entries()).sort((a, b) => b[1] - a[1])[0]
    if (topPeer && topPeer[1] > 1) {
      result.push(`发现 ${topPeer[1]} 笔来自「${topPeer[0]}」的交易需配置规则`)
    }
    if (unmatchedCount.value + partialCount.value > 5) {
      result.push('建议使用通配符或正则匹配相似交易')
    }
    if (partialCount.value > 0) {
      result.push(`有 ${partialCount.value} 笔半匹配，建议完善规则`)
    }
  }
  return result
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.rule-match-analysis {
  margin-top: 16px;
  border-radius: var(--van-radius-lg);
  overflow: hidden;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.stats-group {
  margin-bottom: 0;
}
.match-success { color: var(--van-success-color); }
.match-partial { color: var(--van-warning-color); }
.match-unmatch { color: var(--van-danger-color); }
.pa-4 { padding: 16px; }
.pt-0 { padding-top: 0; }
.mr-2 { margin-right: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mt-2 { margin-top: 8px; }
.pl-4 { padding-left: 16px; }
.space-y-1 > * + * { margin-top: 4px; }
.negative { color: var(--van-danger-color); }
.positive { color: var(--van-success-color); }
.transaction-list {
  max-height: 520px;
  overflow-y: auto;
}
.transaction-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .transaction-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .transaction-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.tx-card {
  margin-bottom: 0;
  border-radius: var(--van-radius-md);
  border: 1px solid var(--van-gray-2, #ebedf0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
/* 账户名过长时省略显示，金额始终在右侧可见 */
.tx-card :deep(.van-cell__title) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tx-card :deep(.van-cell__value) {
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: 8px;
}
.suggestions-section {
  padding-top: 16px;
}
.suggestions-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--van-radius-md, 10px);
  border: 1px solid var(--van-gray-2, #ebedf0);
  background: var(--van-gray-1, #f7f8fa);
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  white-space: normal;
}
.suggestion-icon {
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1.3;
}
.suggestion-text {
  flex: 1;
  min-width: 0;
  color: var(--van-text-color, #323233);
}
.text-secondary { color: var(--van-text-color-2, #969799); }
</style>
