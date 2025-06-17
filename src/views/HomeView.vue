<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">BeanBridge</h1>
      <p class="text-xl text-gray-600 mb-8">智能账单处理工具</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 账单处理卡片 -->
      <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-file-invoice text-2xl text-indigo-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">账单处理</h2>
          <p class="text-gray-600">上传账单文件，自动转换为Beancount格式</p>
        </div>
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            选择数据源（支付宝、微信、银行等）
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            上传账单文件（CSV、Excel等）
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            预览和编辑交易记录
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            导出Beancount格式文件
          </div>
        </div>
        <button 
          @click="goToBillProcessing"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          开始处理账单
        </button>
      </div>

      <!-- 规则配置卡片 -->
      <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-cogs text-2xl text-green-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">规则配置</h2>
          <p class="text-gray-600">配置智能解析规则，提高处理准确性</p>
        </div>
        <div class="space-y-3 mb-6">
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            创建自定义解析规则
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            支持多种匹配条件
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            导入导出规则配置
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-check text-green-500 mr-2"></i>
            剪贴板快速分享
          </div>
        </div>
        <button 
          @click="goToRuleConfig"
          class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          配置规则
        </button>
      </div>
    </div>

    <!-- 最近导入 -->
    <div class="mt-12">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-gray-800">最近导入</h3>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-600">
            总计: {{ importHistory.length }} 次导入
          </div>
          <button 
            @click="clearAllHistory"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            清空历史
          </button>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div v-if="recentImports.length > 0" class="space-y-3">
          <div 
            v-for="item in recentImports" 
            :key="item.id"
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center">
              <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-file-alt text-indigo-600"></i>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ item.name }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ item.date }}</span>
                  <span>{{ item.dataSource }}</span>
                  <span>{{ formatFileSize(item.fileSize) }}</span>
                  <span>{{ item.transactionCount }} 笔交易</span>
                  <span :class="getStatusColor(item.status)">{{ getStatusText(item.status) }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                @click="reimportFile(item)"
                class="text-indigo-600 hover:text-indigo-800 p-1"
                title="重新导入"
              >
                <i class="fas fa-redo"></i>
              </button>
              <button 
                @click="deleteHistoryItem(item.id)"
                class="text-red-600 hover:text-red-800 p-1"
                title="删除记录"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>暂无最近导入记录</p>
          <p class="text-sm mt-2">开始您的第一次账单导入吧！</p>
        </div>
      </div>
    </div>

    <!-- 导入统计 -->
    <div v-if="importHistory.length > 0" class="mt-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">导入统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-800 mb-3">数据源分布</h4>
          <div class="space-y-2">
            <div 
              v-for="(count, source) in statsByDataSource" 
              :key="source"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600">{{ source }}</span>
              <span class="font-medium">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-800 mb-3">导入状态</h4>
          <div class="space-y-2">
            <div 
              v-for="(count, status) in statsByStatus" 
              :key="status"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600">{{ getStatusText(status) }}</span>
              <span class="font-medium">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-800 mb-3">总计</h4>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">总导入次数</span>
              <span class="font-medium">{{ importHistory.length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">总交易笔数</span>
              <span class="font-medium">{{ totalTransactions }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">成功率</span>
              <span class="font-medium">{{ successRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useImportHistory } from '../composables/useImportHistory';

const { 
  importHistory, 
  recentImports, 
  statsByDataSource, 
  statsByStatus, 
  addImportRecord, 
  deleteImportRecord, 
  clearHistory, 
  formatFileSize 
} = useImportHistory();

// 计算属性
const totalTransactions = computed(() => {
  return importHistory.value.reduce((total, record) => total + record.transactionCount, 0);
});

const successRate = computed(() => {
  if (importHistory.value.length === 0) return 0;
  const successCount = importHistory.value.filter(record => record.status === 'success').length;
  return Math.round((successCount / importHistory.value.length) * 100);
});

// 方法
function goToBillProcessing() {
  window.location.href = '/bill-processing';
}

function goToRuleConfig() {
  window.location.href = '/rule-config';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'partial': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'success': return '成功';
    case 'failed': return '失败';
    case 'partial': return '部分成功';
    default: return '未知';
  }
}

function reimportFile(item: any) {
  // 跳转到账单处理页面，并传递文件信息
  window.location.href = `/bill-processing?reimport=${item.id}`;
}

function deleteHistoryItem(id: string) {
  if (confirm('确定要删除这条导入记录吗？')) {
    deleteImportRecord(id);
  }
}

function clearAllHistory() {
  if (confirm('确定要清空所有导入历史吗？此操作不可恢复。')) {
    clearHistory();
  }
}
</script> 