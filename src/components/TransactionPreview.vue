<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">预览和编辑交易</h2>
    <p class="text-gray-600 mb-6">检查并编辑自动生成的交易记录</p>
    
    <!-- 处理结果状态显示 -->
    <div v-if="processingResult" class="mb-6">
      <div class="bg-white border rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-800">处理结果</h3>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="processingResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ processingResult.success ? '成功' : '失败' }}
            </span>
            <span class="text-sm text-gray-500">{{ processingResult.timestamp }}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ processingResult.stats.total }}</div>
            <div class="text-sm text-gray-600">总记录数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ processingResult.stats.success }}</div>
            <div class="text-sm text-gray-600">成功处理</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ processingResult.stats.warning }}</div>
            <div class="text-sm text-gray-600">警告</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ processingResult.stats.error }}</div>
            <div class="text-sm text-gray-600">错误</div>
          </div>
        </div>
        
        <div v-if="processingResult.messages.length > 0" class="space-y-2">
          <h4 class="font-medium text-gray-700">处理详情：</h4>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div v-for="(message, index) in processingResult.messages" :key="index"
                 class="text-sm p-2 rounded"
                 :class="{
                   'bg-green-50 text-green-800': message.type === 'success',
                   'bg-yellow-50 text-yellow-800': message.type === 'warning',
                   'bg-red-50 text-red-800': message.type === 'error',
                   'bg-blue-50 text-blue-800': message.type === 'info'
                 }">
              <span class="font-medium">{{ message.type.toUpperCase() }}:</span> {{ message.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <button @click="toggleAllTransactions" class="p-2 rounded-md hover:bg-gray-100">
          <i class="fas" :class="allSelected ? 'fa-check-square text-indigo-600' : 'fa-square text-gray-400'"></i>
        </button>
        <span class="text-sm text-gray-600">{{ selectedTransactions.length }} / {{ transactions.length }} 已选择</span>
      </div>
      <div class="flex space-x-2">
        <button @click="showFilter = !showFilter" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center">
          <i class="fas fa-filter mr-1"></i> 筛选
        </button>
        <button @click="showGrouping = !showGrouping" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center">
          <i class="fas fa-layer-group mr-1"></i> 分组
        </button>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="showFilter" class="bg-gray-50 p-4 rounded-lg mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">日期范围</label>
            <div class="flex space-x-2">
              <input type="date" v-model="dateFilter.from" class="w-full rounded-md border-gray-300 shadow-sm">
              <input type="date" v-model="dateFilter.to" class="w-full rounded-md border-gray-300 shadow-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">金额范围</label>
            <div class="flex space-x-2">
              <input type="number" v-model="amountFilter.min" placeholder="最小" class="w-full rounded-md border-gray-300 shadow-sm">
              <input type="number" v-model="amountFilter.max" placeholder="最大" class="w-full rounded-md border-gray-300 shadow-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">账户</label>
            <select v-model="accountFilter" class="w-full rounded-md border-gray-300 shadow-sm">
              <option value="">所有账户</option>
              <option v-for="account in accounts" :key="account" :value="account">{{ account }}</option>
            </select>
          </div>
        </div>
      </div>
    </transition>
    
    <div class="space-y-3">
      <div v-for="transaction in filteredTransactions" :key="transaction.id" 
           :class="{'transaction-item': true, 'border-indigo-200 bg-indigo-50': isSelected(transaction.id)}"
           class="border rounded-lg p-4 hover:shadow-md transition-all">
        <div class="flex items-start justify-between">
          <div class="flex items-start">
            <button @click.stop="toggleTransaction(transaction.id)" class="mt-1 mr-3">
              <i class="fas" :class="isSelected(transaction.id) ? 'fa-check-square text-indigo-600' : 'fa-square text-gray-400'"></i>
            </button>
            <div>
              <div class="flex items-center">
                <p class="font-medium text-gray-800">{{ transaction.payee || '无收款人' }}</p>
                <span v-if="transaction.tags.length > 0" class="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  {{ transaction.tags[0] }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ transaction.narration }}</p>
              <div class="mt-1 flex flex-wrap gap-1">
                <span v-for="(tag, index) in transaction.tags.slice(1)" :key="index" 
                      class="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium" :class="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(transaction.amount) }}
            </p>
            <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ transaction.account }}</p>
          </div>
        </div>
        
        <div v-if="expandedTransaction === transaction.id" class="mt-3 pt-3 border-t">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input type="date" v-model="transaction.date" class="w-full rounded-md border-gray-300 shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
              <input type="number" v-model="transaction.amount" class="w-full rounded-md border-gray-300 shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">收款人</label>
              <input v-model="transaction.payee" class="w-full rounded-md border-gray-300 shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">账户</label>
              <select v-model="transaction.account" class="w-full rounded-md border-gray-300 shadow-sm">
                <option v-for="account in accounts" :key="account" :value="account">{{ account }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea v-model="transaction.narration" rows="2" class="w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, index) in transaction.tags" :key="index" class="flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {{ tag }}
                  <button @click="removeTag(transaction, index)" class="ml-1 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </span>
                <input v-model="newTag" @keydown.enter="addTag(transaction)" placeholder="添加标签" class="text-xs px-2 py-0.5 border rounded">
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3 pt-3 border-t flex justify-between">
          <button @click="toggleExpandTransaction(transaction.id)" class="text-sm text-indigo-600 hover:text-indigo-800">
            <i class="fas" :class="expandedTransaction === transaction.id ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            {{ expandedTransaction === transaction.id ? '收起' : '编辑' }}
          </button>
          <div class="space-x-2">
            <button @click="splitTransaction(transaction)" class="text-sm text-gray-600 hover:text-gray-800">
              <i class="fas fa-cut mr-1"></i>拆分
            </button>
            <button @click="duplicateTransaction(transaction)" class="text-sm text-gray-600 hover:text-gray-800">
              <i class="fas fa-copy mr-1"></i>复制
            </button>
            <button @click="deleteTransaction(transaction.id)" class="text-sm text-red-600 hover:text-red-800">
              <i class="fas fa-trash-alt mr-1"></i>删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-between">
      <button @click="$emit('prev-step')" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
        上一步
      </button>
      <button @click="$emit('next-step')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        下一步
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Transaction } from '../utils/data-converter';
import type { ProcessingResult } from '../utils/dataSourceProcessor';

interface Props {
  transactions: Transaction[];
  processingResult?: ProcessingResult;
}

const props = defineProps<Props>();

defineEmits<{
  'prev-step': [];
  'next-step': [];
  'transactions-updated': [transactions: Transaction[]];
}>();

const selectedTransactions = ref<string[]>([]);
const expandedTransaction = ref<string | null>(null);
const showFilter = ref(false);
const showGrouping = ref(false);
const dateFilter = ref({ from: '', to: '' });
const amountFilter = ref({ min: '', max: '' });
const accountFilter = ref('');
const newTag = ref('');

const accounts = ref([
  'Assets:Alipay',
  'Assets:WeChat',
  'Assets:Bank:CMB',
  'Assets:Bank:ICBC',
  'Liabilities:CreditCard:HuaBei',
  'Liabilities:CreditCard:CMB',
  'Expenses:Food',
  'Expenses:Transport',
  'Expenses:Shopping',
  'Income:Salary'
]);

const allSelected = computed(() => {
  return selectedTransactions.value.length === props.transactions.length;
});

const filteredTransactions = computed(() => {
  return props.transactions.filter(t => {
    // 日期筛选
    if (dateFilter.value.from && t.date < dateFilter.value.from) return false;
    if (dateFilter.value.to && t.date > dateFilter.value.to) return false;
    
    // 金额筛选
    if (amountFilter.value.min !== '' && t.amount < parseFloat(amountFilter.value.min)) return false;
    if (amountFilter.value.max !== '' && t.amount > parseFloat(amountFilter.value.max)) return false;
    
    // 账户筛选
    if (accountFilter.value && t.account !== accountFilter.value) return false;
    
    return true;
  });
});

const toggleTransaction = (id: string) => {
  const index = selectedTransactions.value.indexOf(id);
  if (index === -1) {
    selectedTransactions.value.push(id);
  } else {
    selectedTransactions.value.splice(index, 1);
  }
};

const toggleAllTransactions = () => {
  if (allSelected.value) {
    selectedTransactions.value = [];
  } else {
    selectedTransactions.value = props.transactions.map(t => t.id);
  }
};

const isSelected = (id: string) => {
  return selectedTransactions.value.includes(id);
};

const toggleExpandTransaction = (id: string) => {
  expandedTransaction.value = expandedTransaction.value === id ? null : id;
};

const addTag = (transaction: Transaction) => {
  if (newTag.value.trim() && !transaction.tags.includes(newTag.value.trim())) {
    transaction.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (transaction: Transaction, index: number) => {
  transaction.tags.splice(index, 1);
};

const splitTransaction = (transaction: Transaction) => {
  const newId = Math.max(...props.transactions.map(t => parseInt(t.id))) + 1;
  const newTransaction = JSON.parse(JSON.stringify(transaction));
  newTransaction.id = newId.toString();
  newTransaction.narration = `${transaction.narration} (拆分)`;
  newTransaction.amount = transaction.amount / 2;
  transaction.amount = transaction.amount / 2;
  props.transactions.push(newTransaction);
};

const duplicateTransaction = (transaction: Transaction) => {
  const newId = Math.max(...props.transactions.map(t => parseInt(t.id))) + 1;
  const newTransaction = JSON.parse(JSON.stringify(transaction));
  newTransaction.id = newId.toString();
  newTransaction.date = new Date().toISOString().split('T')[0];
  props.transactions.push(newTransaction);
};

const deleteTransaction = (id: string) => {
  const index = props.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    props.transactions.splice(index, 1);
    selectedTransactions.value = selectedTransactions.value.filter(tid => tid !== id);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
};
</script>

<style scoped>
.transaction-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 