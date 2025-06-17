<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 返回首页按钮 -->
    <div class="mb-6">
      <button 
        @click="goHome"
        class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        返回首页
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 侧边栏 -->
      <AppSidebar
        :currentStep="currentStep"
        :steps="steps"
        @step-change="goToStep"
      />

      <!-- 主面板 -->
      <div class="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">规则配置</h2>
              <p class="text-gray-600">配置数据源的解析规则，支持导入导出和剪贴板操作</p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="exportToClipboard"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <i class="fas fa-copy mr-2"></i>导出到剪贴板
              </button>
              <button 
                @click="importFromClipboard"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <i class="fas fa-paste mr-2"></i>从剪贴板导入
              </button>
              <button 
                @click="addRule"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <i class="fas fa-plus mr-2"></i>添加规则
              </button>
            </div>
          </div>

          <!-- 规则列表 -->
          <div class="space-y-4">
            <div 
              v-for="(rule, index) in rules" 
              :key="index"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium text-gray-800">规则 {{ index + 1 }}</h3>
                <div class="flex space-x-2">
                  <button 
                    @click="editRule(index)"
                    class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    <i class="fas fa-edit mr-1"></i>编辑
                  </button>
                  <button 
                    @click="deleteRule(index)"
                    class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <i class="fas fa-trash mr-1"></i>删除
                  </button>
                </div>
              </div>
              
              <!-- 规则内容预览 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700">条件:</span>
                  <div class="mt-1 space-y-1">
                    <div v-for="(condition, cIndex) in rule.conditions" :key="cIndex" class="text-gray-600">
                      {{ condition.field }} {{ condition.operator }} {{ Array.isArray(condition.value) ? condition.value.join(', ') : condition.value }}
                    </div>
                  </div>
                </div>
                <div>
                  <span class="font-medium text-gray-700">动作:</span>
                  <div class="mt-1 space-y-1">
                    <div v-if="rule.actions.targetAccount" class="text-gray-600">
                      目标账户: {{ rule.actions.targetAccount }}
                    </div>
                    <div v-if="rule.actions.methodAccount" class="text-gray-600">
                      方法账户: {{ rule.actions.methodAccount }}
                    </div>
                    <div v-if="rule.actions.ignore" class="text-gray-600">
                      忽略: 是
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="rules.length === 0" class="text-center py-12">
            <i class="fas fa-cogs text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-600 mb-2">暂无规则</h3>
            <p class="text-gray-500 mb-4">点击"添加规则"开始配置您的解析规则</p>
            <button 
              @click="addRule"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <i class="fas fa-plus mr-2"></i>添加第一个规则
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则编辑对话框 -->
    <RuleEditDialog
      v-if="showRuleDialog"
      :rule="editingRule"
      :isEdit="isEditing"
      @save="saveRule"
      @cancel="closeRuleDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from '../components/AppSidebar.vue';
import RuleEditDialog from '../components/RuleEditDialog.vue';
import { useRuleManager } from '../composables/useRuleManager';
import type { Rule } from '../types/data-source';

const currentStep = ref(0);
const steps = [
  { title: '规则配置', icon: 'fa-cogs' }
];

const { 
  rules, 
  addRule: addRuleToManager, 
  updateRule: updateRuleInManager, 
  deleteRule: deleteRuleFromManager,
  exportToClipboard,
  importFromClipboard
} = useRuleManager();

const showRuleDialog = ref(false);
const editingRule = ref<Rule | null>(null);
const isEditing = ref(false);

function goHome() {
  window.location.href = '/';
}

function goToStep(step: number) {
  currentStep.value = step;
}

function addRule() {
  editingRule.value = {
    conditions: [],
    actions: {}
  };
  isEditing.value = false;
  showRuleDialog.value = true;
}

function editRule(index: number) {
  editingRule.value = { ...rules.value[index] };
  isEditing.value = true;
  showRuleDialog.value = true;
}

function deleteRule(index: number) {
  if (confirm('确定要删除这个规则吗？')) {
    deleteRuleFromManager(index);
  }
}

function saveRule(rule: Rule) {
  if (isEditing.value) {
    // 编辑现有规则
    const index = rules.value.findIndex(r => r === editingRule.value);
    if (index !== -1) {
      updateRuleInManager(index, rule);
    }
  } else {
    // 添加新规则
    addRuleToManager(rule);
  }
  closeRuleDialog();
}

function closeRuleDialog() {
  showRuleDialog.value = false;
  editingRule.value = null;
  isEditing.value = false;
}
</script> 