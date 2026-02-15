<template>
  <van-cell-group class="rule-list-viewer" inset>
    <van-cell title="规则列表" :value="`共 ${totalRuleCount} 条规则`" class="list-header" />

    <van-empty v-if="displayGroups.length === 0" description="暂无配置规则" class="py-8" />

    <template v-else>
      <div v-for="(group, groupIndex) in displayGroups" :key="group.address" class="group-block">
        <!-- 分组标题 -->
        <van-cell-group v-if="group.showHeader" inset class="group-header">
          <van-cell :title="`${groupIndex + 1}. ${group.displayName}`" :label="group.address" :border="false" />
          <van-cell
            v-if="group.defaultCashAccount"
            title="默认现金账户"
            :value="group.defaultCashAccount"
            :border="false"
            class="font-mono text-xs"
          />
        </van-cell-group>

        <!-- 规则卡片网格：小屏 1 列，中屏 2 列，大屏 3 列 -->
        <div class="rule-cards-grid">
        <van-cell-group
          v-for="(rule, ruleIndex) in group.rules"
          :key="`${group.address}-${ruleIndex}`"
          inset
          class="rule-card"
        >
          <van-cell :border="false">
            <template #title>
              <span class="font-semibold">规则 #{{ group.showHeader ? `${groupIndex + 1}-${ruleIndex + 1}` : ruleIndex + 1 }}</span>
              <van-tag v-if="rule.ignore" type="warning" size="medium" class="ml-2">忽略</van-tag>
            </template>
          </van-cell>

          <van-cell v-if="rule.tokenName" title="代币名称" :border="false">
            <template #value><van-tag plain>{{ rule.tokenName }}</van-tag></template>
          </van-cell>
          <van-cell v-if="rule.tokenSymbol" title="代币符号" :border="false">
            <template #value><van-tag plain>{{ rule.tokenSymbol }}</van-tag></template>
          </van-cell>
          <van-cell v-if="rule.direction" title="交易方向" :value="formatDirection(rule.direction)" :border="false" />
          <van-cell v-if="rule.type" title="交易类型" :value="rule.type" :border="false" />
          <van-cell v-if="rule.peer" title="交易对手" :value="rule.peer" :border="false" class="value-break" />
          <van-cell v-if="rule.item" title="商品描述" :value="rule.item" :border="false" />
          <van-cell v-if="rule.category" title="分类" :value="rule.category" :border="false" />
          <van-cell v-if="rule.method" title="支付方式" :value="rule.fullMatch ? `${rule.method} (精确)` : rule.method" :border="false" />
          <van-cell v-if="rule.time" title="时间范围" :value="rule.time" :border="false" />
          <van-cell v-if="rule.currency" title="货币" :value="rule.currency" :border="false" />
          <van-cell
            v-if="rule.minPrice !== undefined || rule.maxPrice !== undefined"
            title="金额范围"
            :value="formatPriceRange(rule)"
            :border="false"
          />
          <van-cell
            v-if="rule.minAmount !== undefined || rule.maxAmount !== undefined"
            title="代币数量"
            :value="formatAmountRange(rule)"
            :border="false"
          />
          <van-cell v-if="rule.contractAddress" title="合约地址" :value="rule.contractAddress" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule._address && !group.showHeader" title="钱包地址" :value="rule._address" :border="false" class="font-mono value-break" />

          <van-cell v-if="parseTags(rule.tags).length > 0" :border="false">
            <template #title>
              <div class="flex flex-wrap gap-1">
                <van-tag v-for="tag in parseTags(rule.tags)" :key="tag" plain size="small">#{{ tag }}</van-tag>
              </div>
            </template>
          </van-cell>

          <!-- 账户 -->
          <van-cell v-if="rule.targetAccount" title="目标账户" :value="rule.targetAccount" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule.methodAccount" title="支付账户" :value="rule.methodAccount" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule.pnlAccount" title="损益账户" :value="rule.pnlAccount" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule.cashAccount" title="现金账户" :value="rule.cashAccount" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule.positionAccount" title="持仓账户" :value="rule.positionAccount" :border="false" class="font-mono value-break" />
          <van-cell v-if="rule.commissionAccount" title="佣金账户" :value="rule.commissionAccount" :border="false" class="font-mono value-break" />
        </van-cell-group>
        </div>
      </div>
    </template>
  </van-cell-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import yaml from 'js-yaml'

interface Props {
  yamlContent: string
  provider: string | null
}

interface Rule {
  type?: string
  peer?: string
  item?: string
  category?: string
  method?: string
  time?: string
  minPrice?: number
  maxPrice?: number
  minAmount?: number
  maxAmount?: number
  fullMatch?: boolean
  ignore?: boolean
  targetAccount?: string
  methodAccount?: string
  pnlAccount?: string
  cashAccount?: string
  positionAccount?: string
  commissionAccount?: string
  tokenSymbol?: string
  tokenName?: string
  contractAddress?: string
  direction?: string
  currency?: string
  tags?: string[] | string
  _address?: string
}

interface RuleGroup {
  address: string
  displayName: string
  showHeader: boolean
  defaultCashAccount?: string
  rules: Rule[]
}

const props = defineProps<Props>()

const isOklink = computed(() => props.provider === 'oklink')

const parseTags = (tags: unknown): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.map(tag => (typeof tag === 'string' ? tag.trim() : String(tag))).filter(Boolean)
  }
  if (typeof tags === 'string') {
    return tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean)
  }
  return []
}

const formatDirection = (direction?: string): string => {
  if (direction === 'recv') return '接收'
  if (direction === 'send') return '发送'
  return direction ?? ''
}

const formatPriceRange = (rule: Rule): string => {
  if (rule.minPrice !== undefined && rule.maxPrice !== undefined) return `${rule.minPrice} - ${rule.maxPrice}`
  if (rule.minPrice !== undefined) return `≥ ${rule.minPrice}`
  if (rule.maxPrice !== undefined) return `≤ ${rule.maxPrice}`
  return ''
}

const formatAmountRange = (rule: Rule): string => {
  if (rule.minAmount !== undefined && rule.maxAmount !== undefined) return `${rule.minAmount} - ${rule.maxAmount}`
  if (rule.minAmount !== undefined) return `≥ ${rule.minAmount}`
  if (rule.maxAmount !== undefined) return `≤ ${rule.maxAmount}`
  return ''
}

const loadYamlConfig = computed(() => {
  if (!props.yamlContent) return null
  try {
    return yaml.load(props.yamlContent) as Record<string, any> | null
  } catch {
    return null
  }
})

const oklinkRuleGroups = computed<RuleGroup[]>(() => {
  if (!isOklink.value || !loadYamlConfig.value) return []
  const providerConfig = loadYamlConfig.value['oklink']
  if (!providerConfig || typeof providerConfig !== 'object') return []
  const groups: RuleGroup[] = []
  for (const [address, info] of Object.entries(providerConfig as Record<string, any>)) {
    if (!info || typeof info !== 'object') continue
    const rulesArray = Array.isArray((info as any).rules) ? (info as any).rules as Rule[] : []
    const normalizedRules = rulesArray.map(rule => ({ ...rule, _address: address }))
    if (normalizedRules.length === 0) continue
    groups.push({
      address,
      displayName: `地址 ${address.slice(0, 6)}...${address.slice(-4)}`,
      showHeader: true,
      defaultCashAccount: typeof (info as any).defaultCashAccount === 'string' ? (info as any).defaultCashAccount : undefined,
      rules: normalizedRules,
    })
  }
  return groups
})

const standardRules = computed<Rule[]>(() => {
  if (!loadYamlConfig.value || !props.provider || isOklink.value) return []
  const providerConfig = loadYamlConfig.value[props.provider]
  if (providerConfig && Array.isArray((providerConfig as any).rules)) {
    return (providerConfig as any).rules as Rule[]
  }
  return []
})

const displayGroups = computed<RuleGroup[]>(() => {
  if (isOklink.value) return oklinkRuleGroups.value
  if (standardRules.value.length === 0) return []
  return [{ address: 'default', displayName: '默认规则', showHeader: false, rules: standardRules.value }]
})

const totalRuleCount = computed(() =>
  displayGroups.value.reduce((sum, group) => sum + group.rules.length, 0)
)
</script>

<style scoped>
.rule-list-viewer {
  margin-top: 16px;
  border-radius: var(--van-radius-lg);
  overflow: hidden;
}
.list-header :deep(.van-cell__title) {
  font-weight: 600;
}
.group-block {
  margin-bottom: 16px;
}
.group-header {
  margin-bottom: 8px;
}
.rule-cards-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}
@media (min-width: 640px) {
  .rule-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .rule-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.rule-card {
  margin-bottom: 0;
  border-radius: var(--van-radius-md);
  border: 1px solid var(--van-gray-2, #ebedf0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.ml-2 { margin-left: 8px; }
.gap-1 { gap: 4px; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.font-mono { font-family: ui-monospace, monospace; }
.text-xs { font-size: 12px; }
.value-break :deep(.van-cell__value) {
  word-break: break-all;
  text-align: left;
}
.py-8 { padding-top: 32px; padding-bottom: 32px; }
</style>
