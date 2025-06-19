<template>
  <div class="bg-white dark:bg-gray-800 border rounded-lg p-6 text-gray-900 dark:text-gray-100">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">{{ isEditing ? '编辑规则' : '新增规则' }}</h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600"
      >
        <span class="material-icons">close</span>
      </button>
    </div>

    <form @submit.prevent="saveRule" class="space-y-4">
      <!-- 基本信息 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">规则名称</label>
          <input
            v-model="ruleForm.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="输入规则名称"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">描述</label>
          <input
            v-model="ruleForm.description"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="规则描述（可选）"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">优先级</label>
          <input
            v-model.number="ruleForm.priority"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="1"
          />
          <p class="text-xs text-gray-500 mt-1">数字越小优先级越高</p>
        </div>
      </div>

      <!-- 匹配条件 -->
      <div class="border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 class="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">匹配条件</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">交易对方 (peer)</label>
            <input
              v-model="ruleForm.peer"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="交易对方名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">商品说明 (item)</label>
            <input
              v-model="ruleForm.item"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="商品或交易说明"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">交易类型 (type)</label>
            <select
              v-model="ruleForm.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">选择类型</option>
              <option value="收入">收入</option>
              <option value="支出">支出</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">支付方式 (method)</label>
            <input
              v-model="ruleForm.method"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="支付方式"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">交易分类 (category)</label>
            <input
              v-model="ruleForm.category"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="交易分类"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">交易类型 (txType)</label>
            <input
              v-model="ruleForm.txType"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="交易类型"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">时间范围 (time)</label>
            <input
              v-model="ruleForm.time"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="11:00-14:00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">最小金额</label>
            <input
              v-model.number="ruleForm.minPrice"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="最小金额"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">最大金额</label>
            <input
              v-model.number="ruleForm.maxPrice"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="最大金额"
            />
          </div>
        </div>

        <!-- 匹配选项 -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center">
            <input
              v-model="ruleForm.fullMatch"
              type="checkbox"
              id="fullMatch"
              class="mr-2"
            />
            <label for="fullMatch" class="text-sm text-gray-700 dark:text-gray-200">精确匹配</label>
          </div>
          <div class="flex items-center">
            <input
              v-model="ruleForm.ignore"
              type="checkbox"
              id="ignore"
              class="mr-2"
            />
            <label for="ignore" class="text-sm text-gray-700 dark:text-gray-200">忽略此交易</label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">分隔符 (sep)</label>
            <input
              v-model="ruleForm.sep"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="," />
          </div>
        </div>
      </div>

      <!-- 账户配置 -->
      <div class="border-t pt-4 border-gray-200 dark:border-gray-700">
        <h4 class="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">账户配置</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">目标账户 (targetAccount)</label>
            <input
              v-model="ruleForm.targetAccount"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Expenses:Food"
            />
            <p class="text-xs text-gray-500 mt-1">支出账户，如：Expenses:Food</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">方法账户 (methodAccount)</label>
            <input
              v-model="ruleForm.methodAccount"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Assets:Alipay"
            />
            <p class="text-xs text-gray-500 mt-1">支付方式账户，如：Assets:Alipay</p>
          </div>
        </div>

        <!-- 高级账户设置 -->
        <details class="mt-4">
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
            <span class="material-icons text-sm mr-1 transition-transform">expand_more</span>
            高级账户设置
          </summary>
          <div class="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">现金账户 (cashAccount)</label>
              <input
                v-model="ruleForm.cashAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Assets:Cash"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">持仓账户 (positionAccount)</label>
              <input
                v-model="ruleForm.positionAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Assets:Positions"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">手续费账户 (commissionAccount)</label>
              <input
                v-model="ruleForm.commissionAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Expenses:Commission"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">损益账户 (pnlAccount)</label>
              <input
                v-model="ruleForm.pnlAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Income:PnL"
              />
            </div>
          </div>
        </details>
      </div>

      <!-- 标签 -->
      <div class="border-t pt-4">
        <h4 class="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">标签</h4>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">标签 (tags)</label>
          <input
            v-model="tagsInput"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="标签1,标签2,标签3"
            @input="updateTags"
          />
          <p class="text-xs text-gray-500 mt-1">使用逗号分隔多个标签</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          取消
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {{ isEditing ? '更新' : '创建' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Rule } from '../types/rule-config';

interface Props {
  rule?: Rule;
  isEditing?: boolean;
}

interface Emits {
  (e: 'save', rule: Rule): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
});

const emit = defineEmits<Emits>();

const ruleForm = ref({
  name: '',
  description: '',
  peer: '',
  item: '',
  type: '',
  method: '',
  category: '',
  txType: '',
  time: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  fullMatch: false,
  sep: '',
  ignore: false,
  targetAccount: '',
  methodAccount: '',
  cashAccount: '',
  positionAccount: '',
  commissionAccount: '',
  pnlAccount: '',
  tags: [] as string[],
  priority: 1
});

const tagsInput = ref('');

const resetForm = () => {
  ruleForm.value = {
    name: '',
    description: '',
    peer: '',
    item: '',
    type: '',
    method: '',
    category: '',
    txType: '',
    time: '',
    minPrice: undefined,
    maxPrice: undefined,
    fullMatch: false,
    sep: '',
    ignore: false,
    targetAccount: '',
    methodAccount: '',
    cashAccount: '',
    positionAccount: '',
    commissionAccount: '',
    pnlAccount: '',
    tags: [],
    priority: 1
  };
  tagsInput.value = '';
};

// 监听规则变化，初始化表单
watch(() => props.rule, (rule) => {
  if (rule) {
    ruleForm.value = {
      name: rule.name,
      description: rule.description || '',
      peer: rule.peer || '',
      item: rule.item || '',
      type: rule.type || '',
      method: rule.method || '',
      category: rule.category || '',
      txType: rule.txType || '',
      time: rule.time || '',
      minPrice: rule.minPrice,
      maxPrice: rule.maxPrice,
      fullMatch: rule.fullMatch || false,
      sep: rule.sep || '',
      ignore: rule.ignore || false,
      targetAccount: rule.targetAccount || '',
      methodAccount: rule.methodAccount || '',
      cashAccount: rule.cashAccount || '',
      positionAccount: rule.positionAccount || '',
      commissionAccount: rule.commissionAccount || '',
      pnlAccount: rule.pnlAccount || '',
      tags: rule.tags || [],
      priority: rule.priority
    };
    tagsInput.value = rule.tags?.join(', ') || '';
  } else {
    resetForm();
  }
}, { immediate: true });

const updateTags = () => {
  ruleForm.value.tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

const saveRule = () => {
  const rule: Rule = {
    id: props.rule?.id || Date.now().toString(),
    name: ruleForm.value.name,
    description: ruleForm.value.description || '',
    peer: ruleForm.value.peer || '',
    item: ruleForm.value.item || '',
    type: ruleForm.value.type || '',
    method: ruleForm.value.method || '',
    category: ruleForm.value.category || '',
    txType: ruleForm.value.txType || '',
    time: ruleForm.value.time || '',
    minPrice: ruleForm.value.minPrice,
    maxPrice: ruleForm.value.maxPrice,
    fullMatch: ruleForm.value.fullMatch,
    sep: ruleForm.value.sep || '',
    ignore: ruleForm.value.ignore,
    targetAccount: ruleForm.value.targetAccount || '',
    methodAccount: ruleForm.value.methodAccount || '',
    cashAccount: ruleForm.value.cashAccount || '',
    positionAccount: ruleForm.value.positionAccount || '',
    commissionAccount: ruleForm.value.commissionAccount || '',
    pnlAccount: ruleForm.value.pnlAccount || '',
    tags: ruleForm.value.tags,
    priority: ruleForm.value.priority
  };
  
  emit('save', rule);
  resetForm();
};
</script> 