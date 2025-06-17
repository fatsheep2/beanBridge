<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEdit ? '编辑规则' : '添加规则' }}
          </h2>
          <button @click="$emit('cancel')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 条件配置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-800">条件配置</h3>
            <div class="space-y-3">
              <div 
                v-for="(condition, index) in localRule.conditions" 
                :key="index"
                class="border rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">条件 {{ index + 1 }}</span>
                  <button 
                    @click="removeCondition(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="grid grid-cols-1 gap-2">
                  <select v-model="condition.field" class="border rounded px-2 py-1 text-sm">
                    <option value="">选择字段</option>
                    <option value="peer">对方</option>
                    <option value="item">商品</option>
                    <option value="type">类型</option>
                    <option value="method">支付方式</option>
                    <option value="status">状态</option>
                    <option value="txType">交易类型</option>
                    <option value="time">时间</option>
                  </select>
                  <select v-model="condition.operator" class="border rounded px-2 py-1 text-sm">
                    <option value="equals">等于</option>
                    <option value="contains">包含</option>
                    <option value="regex">正则匹配</option>
                    <option value="time">时间范围</option>
                    <option value="fullMatch">完全匹配</option>
                  </select>
                  <input 
                    v-model="condition.value" 
                    placeholder="值"
                    class="border rounded px-2 py-1 text-sm"
                  />
                  <input 
                    v-if="condition.operator === 'time'"
                    v-model="condition.time" 
                    placeholder="时间范围 (如: 8:00-12:00)"
                    class="border rounded px-2 py-1 text-sm"
                  />
                  <input 
                    v-model="condition.sep" 
                    placeholder="分隔符 (用于多个值)"
                    class="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <button 
                @click="addCondition"
                class="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 rounded-md"
              >
                <i class="fas fa-plus mr-2"></i>添加条件
              </button>
            </div>
          </div>

          <!-- 动作配置 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-800">动作配置</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">目标账户</label>
                <input 
                  v-model="localRule.actions.targetAccount" 
                  placeholder="如: Expenses:Life:Food"
                  class="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">方法账户</label>
                <input 
                  v-model="localRule.actions.methodAccount" 
                  placeholder="如: Assets:Bank:ICBC"
                  class="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">手续费账户</label>
                <input 
                  v-model="localRule.actions.commissionAccount" 
                  placeholder="如: Expenses:Commission"
                  class="w-full border rounded px-3 py-2"
                />
              </div>
              <div class="flex items-center">
                <input 
                  v-model="localRule.actions.ignore" 
                  type="checkbox" 
                  id="ignore"
                  class="mr-2"
                />
                <label for="ignore" class="text-sm text-gray-700">忽略此交易</label>
              </div>
              <div class="flex items-center">
                <input 
                  v-model="localRule.actions.fullMatch" 
                  type="checkbox" 
                  id="fullMatch"
                  class="mr-2"
                />
                <label for="fullMatch" class="text-sm text-gray-700">完全匹配</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button 
            @click="$emit('cancel')"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            取消
          </button>
          <button 
            @click="saveRule"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {{ isEdit ? '更新' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Rule, RuleCondition, RuleAction } from '../types/data-source';

interface Props {
  rule: Rule | null;
  isEdit: boolean;
}

interface Emits {
  save: [rule: Rule];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localRule = ref<Rule>({
  conditions: [],
  actions: {}
});

watch(() => props.rule, (newRule) => {
  if (newRule) {
    localRule.value = JSON.parse(JSON.stringify(newRule));
  } else {
    localRule.value = { conditions: [], actions: {} };
  }
}, { immediate: true });

function addCondition() {
  localRule.value.conditions.push({
    field: '',
    value: '',
    operator: 'equals'
  });
}

function removeCondition(index: number) {
  localRule.value.conditions.splice(index, 1);
}

function saveRule() {
  // 验证规则
  if (localRule.value.conditions.length === 0) {
    alert('请至少添加一个条件');
    return;
  }
  
  emit('save', { ...localRule.value });
}
</script> 