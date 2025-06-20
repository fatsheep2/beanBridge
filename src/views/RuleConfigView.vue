<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-2xl rounded-2xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-10">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold">规则配置</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <span class="material-icons mr-3">arrow_back</span>
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
            <p class="text-gray-600 dark:text-gray-300">{{ currentConfig.description }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="showHistoryModal = true"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <span class="material-icons mr-2">history</span>
              历史记录
            </button>
            <button
              @click="exportConfig"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <span class="material-icons mr-2">download</span>
              导出配置
            </button>
            <button
              @click="importConfig"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <span class="material-icons mr-2">upload</span>
              导入配置
            </button>
          </div>
        </div>

        <!-- 全局配置 -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h4 class="text-xl font-bold mb-6">全局配置</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认负账户(一般是资产账户)</label>
              <input
                v-model="currentConfig.defaultMinusAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:FIXME"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认增加账户(一般是支出账户)</label>
              <input
                v-model="currentConfig.defaultPlusAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Expenses:FIXME"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认货币</label>
              <input
                v-model="currentConfig.defaultCurrency"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="CNY"
              />
            </div>
            <div v-if="currentConfig.defaultCashAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认现金账户</label>
              <input
                v-model="currentConfig.defaultCashAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:Cash"
              />
            </div>
            <div v-if="currentConfig.defaultCommissionAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认手续费账户</label>
              <input
                v-model="currentConfig.defaultCommissionAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Expenses:Commission"
              />
            </div>
            <div v-if="currentConfig.defaultPositionAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认持仓账户</label>
              <input
                v-model="currentConfig.defaultPositionAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:Positions"
              />
            </div>
          </div>
        </div>

        <!-- 规则列表 -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">规则列表</h4>
            <div class="flex space-x-2">
              <button
                @click="addRule"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <span class="material-icons mr-2">add</span>
                添加规则
              </button>
              <button
                @click="debugRules"
                class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                <span class="material-icons mr-2">bug_report</span>
                调试规则
              </button>
            </div>
          </div>

          <!-- 筛选和搜索 -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">搜索规则</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索规则名称、描述、标签..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">筛选类型</label>
                <select
                  v-model="filterType"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">全部类型</option>
                  <option value="收入">收入</option>
                  <option value="支出">支出</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">排序方式</label>
                <select
                  v-model="sortBy"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="priority">按优先级</option>
                  <option value="name">按名称</option>
                  <option value="created">按创建时间</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="rule in filteredAndSortedRules"
              :key="rule.id"
              class="border-2 border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-150"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h5 class="font-medium text-gray-900 dark:text-gray-100">{{ rule.name }}</h5>
                    <span class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full font-semibold">优先级: {{ rule.priority }}</span>
                    <span v-if="rule.ignore" class="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full font-semibold">忽略</span>
                  </div>
                  <p v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-300 mb-3">{{ rule.description }}</p>
                  
                  <!-- 匹配条件 -->
                  <div class="space-y-1 text-xs">
                    <div v-if="rule.peer" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">交易对方:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">{{ rule.peer }}</span>
                    </div>
                    <div v-if="rule.item" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">商品说明:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">{{ rule.item }}</span>
                    </div>
                    <div v-if="rule.type" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">交易类型:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300">{{ rule.type }}</span>
                    </div>
                    <div v-if="rule.method" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">支付方式:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 truncate">{{ rule.method }}</span>
                    </div>
                  </div>

                  <!-- 账户配置 -->
                  <div class="mt-3 space-y-1 text-xs">
                    <div v-if="rule.targetAccount" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">目标账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono truncate">{{ rule.targetAccount }}</span>
                    </div>
                    <div v-if="rule.methodAccount" class="flex">
                      <span class="text-gray-500 dark:text-gray-400 w-16">方法账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono truncate">{{ rule.methodAccount }}</span>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div v-if="rule.tags && rule.tags.length > 0" class="mt-3">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="tag in rule.tags"
                        :key="tag"
                        class="inline-block bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-semibold"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex space-x-2 ml-3">
                  <button
                    @click="editRule(rule)"
                    class="text-blue-600 hover:text-blue-800 p-1"
                    title="编辑规则"
                  >
                    <span class="material-icons text-lg">edit</span>
                  </button>
                  <button
                    @click="deleteRule(rule.id)"
                    class="text-red-600 hover:text-red-800 p-1"
                    title="删除规则"
                  >
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 无规则提示 -->
          <div v-if="filteredAndSortedRules.length === 0" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">rule</span>
            <p class="text-gray-600 dark:text-gray-300">
              {{ searchQuery || filterType ? '没有找到匹配的规则' : '还没有配置规则' }}
            </p>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <span class="material-icons mr-2 text-green-500">check_circle</span>
            规则已自动保存
          </div>
        </div>
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else-if="!selectedProvider" class="text-center py-12">
        <i class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">storage</i>
        <p class="text-gray-600 dark:text-gray-300">请先选择一个解析器来配置规则</p>
      </div>

      <!-- 无配置的提示 -->
      <div v-else-if="!currentConfig" class="text-center py-12">
        <i class="material-icons text-4xl text-yellow-400 mb-4">warning</i>
        <p class="text-gray-600 dark:text-gray-300 mb-4">该解析器还没有配置，是否从预设配置创建？</p>
        <button
          @click="createFromPreset"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <span class="material-icons mr-2">add</span>
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
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">历史记录</h3>
          <button
            @click="showHistoryModal = false"
            class="text-gray-400 hover:text-gray-600 dark:text-gray-500 text-2xl"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="history in providerHistory"
            :key="history.id"
            class="border-2 border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer font-semibold"
            @click="applyHistory(history.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ history.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ formatDate(history.createdAt) }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 font-semibold"
                >
                  应用
                </button>
                <button
                  @click.stop="deleteHistory(history.id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg text-base hover:bg-red-700 font-semibold"
                  title="删除历史记录"
                >
                  <span class="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="providerHistory.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ProviderType } from '../types/provider';
import type { RuleConfig, Rule, ConfigHistory } from '../types/rule-config';
import { providers } from '../data/providers';
import { ruleConfigService } from '../services/rule-config-service';
import ProviderSelector from '../components/ProviderSelector.vue';
import RuleEditor from '../components/RuleEditor.vue';

const route = useRoute();
const router = useRouter();

// 响应式数据
const selectedProvider = ref<ProviderType | null>(null);
const currentConfig = ref<RuleConfig | null>(null);
const showRuleEditor = ref(false);
const editingRule = ref<Rule | undefined>(undefined);
const showHistoryModal = ref(false);
const searchQuery = ref('');
const filterType = ref('');
const sortBy = ref('');

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

const filteredAndSortedRules = computed(() => {
  let rules = sortedRules.value.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (rule.tags && rule.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())));
    const matchesType = filterType.value === '' || (rule.type === filterType.value);
    return matchesSearch && matchesType;
  });

  // 排序
  if (sortBy.value === 'priority') {
    rules = rules.sort((a, b) => a.priority - b.priority);
  } else if (sortBy.value === 'name') {
    rules = rules.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'created') {
    rules = rules.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  }

  return rules;
});

// 方法
const setProvider = (provider: ProviderType) => {
  selectedProvider.value = provider;
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
  
  // 自动保存配置
  ruleConfigService.saveConfig(currentConfig.value);
  
  // 显示成功提示
  alert('规则保存成功！');
  
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

const debugRules = () => {
  if (selectedProvider.value) {
    router.push({ 
      path: '/bill-processing', 
      query: { 
        provider: selectedProvider.value,
        from: 'rule-config'
      } 
    });
  } else {
    router.push({ 
      path: '/bill-processing',
      query: { from: 'rule-config' }
    });
  }
};

const deleteHistory = (historyId: string) => {
  if (confirm('确定要删除这个历史记录吗？')) {
    ruleConfigService.deleteHistory(historyId);
    showHistoryModal.value = false;
    alert('历史记录删除成功！');
  }
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