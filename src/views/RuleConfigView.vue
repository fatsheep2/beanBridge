<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">规则配置</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          返回首页
        </router-link>
      </div>

      <!-- Provider选择 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">选择解析器</h2>
        <ProviderSelector
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
      </div>

      <!-- 配置内容 -->
      <div v-if="selectedProvider && currentConfig" class="space-y-6">
        <!-- 配置头部 -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold">{{ currentConfig.name }}</h3>
            <p class="text-gray-600">{{ currentConfig.description }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="showHistoryModal = true"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <i class="fas fa-history mr-2"></i>
              历史记录
            </button>
            <button
              @click="exportConfig"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <i class="fas fa-download mr-2"></i>
              导出配置
            </button>
            <button
              @click="importConfig"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <i class="fas fa-upload mr-2"></i>
              导入配置
            </button>
          </div>
        </div>

        <!-- 全局配置 -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h4 class="text-lg font-semibold mb-4">全局配置</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">默认负账户(一般是资产账户)</label>
              <input
                v-model="currentConfig.defaultMinusAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assets:FIXME"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">默认增加账户(一般是支出账户)</label>
              <input
                v-model="currentConfig.defaultPlusAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expenses:FIXME"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">默认货币</label>
              <input
                v-model="currentConfig.defaultCurrency"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CNY"
              />
            </div>
            <div v-if="currentConfig.defaultCashAccount">
              <label class="block text-sm font-medium text-gray-700 mb-1">默认现金账户</label>
              <input
                v-model="currentConfig.defaultCashAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assets:Cash"
              />
            </div>
            <div v-if="currentConfig.defaultCommissionAccount">
              <label class="block text-sm font-medium text-gray-700 mb-1">默认手续费账户</label>
              <input
                v-model="currentConfig.defaultCommissionAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expenses:Commission"
              />
            </div>
            <div v-if="currentConfig.defaultPositionAccount">
              <label class="block text-sm font-medium text-gray-700 mb-1">默认持仓账户</label>
              <input
                v-model="currentConfig.defaultPositionAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assets:Positions"
              />
            </div>
          </div>
        </div>

        <!-- 规则列表 -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">规则列表</h4>
            <button
              @click="showRuleEditor = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <i class="fas fa-plus mr-2"></i>
              添加规则
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="(rule, index) in sortedRules"
              :key="rule.id"
              class="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h5 class="font-medium">{{ rule.name }}</h5>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">优先级: {{ rule.priority }}</span>
                    <span v-if="rule.ignore" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">忽略</span>
                  </div>
                  <p v-if="rule.description" class="text-sm text-gray-600 mb-2">{{ rule.description }}</p>
                  
                  <!-- 匹配条件 -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div v-if="rule.peer">
                      <span class="text-gray-500">交易对方:</span>
                      <span class="ml-1">{{ rule.peer }}</span>
                    </div>
                    <div v-if="rule.item">
                      <span class="text-gray-500">商品说明:</span>
                      <span class="ml-1">{{ rule.item }}</span>
                    </div>
                    <div v-if="rule.type">
                      <span class="text-gray-500">交易类型:</span>
                      <span class="ml-1">{{ rule.type }}</span>
                    </div>
                    <div v-if="rule.method">
                      <span class="text-gray-500">支付方式:</span>
                      <span class="ml-1">{{ rule.method }}</span>
                    </div>
                    <div v-if="rule.category">
                      <span class="text-gray-500">交易分类:</span>
                      <span class="ml-1">{{ rule.category }}</span>
                    </div>
                    <div v-if="rule.txType">
                      <span class="text-gray-500">交易类型:</span>
                      <span class="ml-1">{{ rule.txType }}</span>
                    </div>
                    <div v-if="rule.time">
                      <span class="text-gray-500">时间范围:</span>
                      <span class="ml-1">{{ rule.time }}</span>
                    </div>
                    <div v-if="rule.fullMatch">
                      <span class="text-gray-500">精确匹配:</span>
                      <span class="ml-1">是</span>
                    </div>
                  </div>

                  <!-- 账户配置 -->
                  <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div v-if="rule.targetAccount">
                      <span class="text-gray-500">目标账户:</span>
                      <span class="ml-1 font-mono">{{ rule.targetAccount }}</span>
                    </div>
                    <div v-if="rule.methodAccount">
                      <span class="text-gray-500">方法账户:</span>
                      <span class="ml-1 font-mono">{{ rule.methodAccount }}</span>
                    </div>
                    <div v-if="rule.cashAccount">
                      <span class="text-gray-500">现金账户:</span>
                      <span class="ml-1 font-mono">{{ rule.cashAccount }}</span>
                    </div>
                    <div v-if="rule.positionAccount">
                      <span class="text-gray-500">持仓账户:</span>
                      <span class="ml-1 font-mono">{{ rule.positionAccount }}</span>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div v-if="rule.tags && rule.tags.length > 0" class="mt-2">
                    <span class="text-gray-500 text-sm">标签:</span>
                    <span class="ml-1 text-sm">
                      <span
                        v-for="tag in rule.tags"
                        :key="tag"
                        class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-1 mb-1"
                      >
                        {{ tag }}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="flex space-x-2 ml-4">
                  <button
                    @click="editRule(rule)"
                    class="text-blue-600 hover:text-blue-800"
                    title="编辑规则"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteRule(rule.id)"
                    class="text-red-600 hover:text-red-800"
                    title="删除规则"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end pt-6 border-t">
          <button
            @click="saveConfig"
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i class="fas fa-save mr-2"></i>
            保存配置
          </button>
        </div>
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else-if="!selectedProvider" class="text-center py-12">
        <i class="fas fa-database text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">请先选择一个解析器来配置规则</p>
      </div>

      <!-- 无配置的提示 -->
      <div v-else-if="!currentConfig" class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
        <p class="text-gray-600 mb-4">该解析器还没有配置，是否从预设配置创建？</p>
        <button
          @click="createFromPreset"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>
          从预设创建配置
        </button>
      </div>
    </div>

    <!-- 规则编辑器模态框 -->
    <div v-if="showRuleEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <RuleEditor
          :rule="editingRule"
          :is-editing="!!editingRule"
          @save="saveRule"
          @close="closeRuleEditor"
        />
      </div>
    </div>

    <!-- 历史记录模态框 -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">历史记录</h3>
          <button
            @click="showHistoryModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="history in providerHistory"
            :key="history.id"
            class="border rounded p-3 hover:bg-gray-50 cursor-pointer"
            @click="applyHistory(history.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ history.name }}</h4>
                <p class="text-sm text-gray-600">{{ formatDate(history.createdAt) }}</p>
              </div>
              <button
                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                应用
              </button>
            </div>
          </div>
        </div>

        <div v-if="providerHistory.length === 0" class="text-center py-8 text-gray-500">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ProviderType } from '../types/provider';
import type { RuleConfig, Rule, ConfigHistory } from '../types/rule-config';
import { providers } from '../data/providers';
import { ruleConfigService } from '../services/rule-config-service';
import ProviderSelector from '../components/ProviderSelector.vue';
import RuleEditor from '../components/RuleEditor.vue';

const route = useRoute();

// 响应式数据
const selectedProvider = ref<ProviderType | null>(null);
const currentConfig = ref<RuleConfig | null>(null);
const showRuleEditor = ref(false);
const editingRule = ref<Rule | undefined>(undefined);
const showHistoryModal = ref(false);

// 计算属性
const supportedProviders = computed(() => providers);

const sortedRules = computed(() => {
  if (!currentConfig.value) return [];
  return [...currentConfig.value.rules].sort((a, b) => a.priority - b.priority);
});

const providerHistory = computed(() => {
  if (!selectedProvider.value) return [];
  return ruleConfigService.getHistory(selectedProvider.value);
});

// 方法
const setProvider = (provider: ProviderType) => {
  selectedProvider.value = provider;
  loadConfig();
};

const loadConfig = () => {
  if (!selectedProvider.value) return;
  
  const config = ruleConfigService.getConfig(selectedProvider.value);
  currentConfig.value = config;
};

// 从URL参数初始化Provider
const initFromRoute = () => {
  const providerParam = route.query.provider as string;
  if (providerParam && Object.values(ProviderType).includes(providerParam as ProviderType)) {
    selectedProvider.value = providerParam as ProviderType;
    loadConfig();
  }
};

const createFromPreset = () => {
  if (!selectedProvider.value) return;
  
  try {
    const config = ruleConfigService.createFromPreset(selectedProvider.value, '我的配置');
    currentConfig.value = config;
    ruleConfigService.saveConfig(config);
  } catch (error) {
    console.error('Failed to create from preset:', error);
    alert('创建配置失败');
  }
};

const saveConfig = () => {
  if (!currentConfig.value) return;
  
  ruleConfigService.saveConfig(currentConfig.value);
  alert('配置保存成功！');
};

const addRule = () => {
  editingRule.value = undefined;
  showRuleEditor.value = true;
};

const editRule = (rule: Rule) => {
  editingRule.value = rule;
  showRuleEditor.value = true;
};

const saveRule = (rule: Rule) => {
  if (!currentConfig.value) return;
  
  // 确保规则有id
  if (!rule.id) {
    rule.id = Date.now().toString();
  }
  
  const existingIndex = currentConfig.value.rules.findIndex(r => r.id === rule.id);
  
  if (existingIndex >= 0) {
    // 更新现有规则
    currentConfig.value.rules[existingIndex] = rule;
  } else {
    // 添加新规则
    rule.priority = currentConfig.value.rules.length + 1;
    currentConfig.value.rules.push(rule);
  }
  
  closeRuleEditor();
};

const deleteRule = (ruleId: string | undefined) => {
  if (!currentConfig.value || !ruleId) return;
  
  if (confirm('确定要删除这个规则吗？')) {
    currentConfig.value.rules = currentConfig.value.rules.filter(r => r.id !== ruleId);
  }
};

const closeRuleEditor = () => {
  showRuleEditor.value = false;
  editingRule.value = undefined;
};

const exportConfig = async () => {
  if (!selectedProvider.value) return;
  
  const success = await ruleConfigService.exportToClipboard(selectedProvider.value);
  if (success) {
    alert('配置已复制到剪贴板！');
  } else {
    alert('导出失败，请重试');
  }
};

const importConfig = async () => {
  const config = await ruleConfigService.importFromClipboard();
  if (config) {
    currentConfig.value = config;
    alert('配置导入成功！');
  } else {
    alert('导入失败，请检查剪贴板内容格式');
  }
};

const applyHistory = (historyId: string) => {
  const config = ruleConfigService.applyHistory(historyId);
  if (config) {
    currentConfig.value = config;
    showHistoryModal.value = false;
    alert('历史配置应用成功！');
  } else {
    alert('应用历史配置失败');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 监听Provider变化
watch(selectedProvider, () => {
  loadConfig();
});

// 组件挂载时初始化
onMounted(() => {
  initFromRoute();
});
</script> 