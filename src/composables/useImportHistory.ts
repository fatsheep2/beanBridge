import { ref, computed } from 'vue';

export interface ImportRecord {
  id: string;
  name: string;
  date: string;
  dataSource: string;
  fileSize: number;
  transactionCount: number;
  status: 'success' | 'failed' | 'partial';
}

export function useImportHistory() {
  const STORAGE_KEY = 'beancount_import_history';
  
  // 响应式状态
  const importHistory = ref<ImportRecord[]>([]);
  
  // 加载历史记录
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        importHistory.value = JSON.parse(stored);
      } else {
        // 添加一些示例数据
        importHistory.value = [
          {
            id: '1',
            name: '支付宝账单_202306.csv',
            date: '2023-06-30',
            dataSource: '支付宝',
            fileSize: 245760,
            transactionCount: 156,
            status: 'success'
          },
          {
            id: '2',
            name: '招商银行对账单.pdf',
            date: '2023-05-31',
            dataSource: '招商银行',
            fileSize: 1024000,
            transactionCount: 89,
            status: 'success'
          },
          {
            id: '3',
            name: '微信支付记录.xlsx',
            date: '2023-04-30',
            dataSource: '微信支付',
            fileSize: 512000,
            transactionCount: 234,
            status: 'success'
          },
          {
            id: '4',
            name: '工商银行对账单.csv',
            date: '2023-03-31',
            dataSource: '中国工商银行',
            fileSize: 768000,
            transactionCount: 67,
            status: 'partial'
          },
          {
            id: '5',
            name: '京东账单.xlsx',
            date: '2023-02-28',
            dataSource: '京东',
            fileSize: 128000,
            transactionCount: 45,
            status: 'failed'
          }
        ];
        saveHistory();
      }
    } catch (error) {
      console.error('加载导入历史失败:', error);
      importHistory.value = [];
    }
  };
  
  // 添加导入记录
  const addImportRecord = (record: Omit<ImportRecord, 'id' | 'date'>) => {
    const newRecord: ImportRecord = {
      ...record,
      id: generateId(),
      date: new Date().toISOString().split('T')[0]
    };
    
    importHistory.value.unshift(newRecord);
    
    // 只保留最近50条记录
    if (importHistory.value.length > 50) {
      importHistory.value = importHistory.value.slice(0, 50);
    }
    
    saveHistory();
  };
  
  // 删除导入记录
  const deleteImportRecord = (id: string) => {
    const index = importHistory.value.findIndex(record => record.id === id);
    if (index !== -1) {
      importHistory.value.splice(index, 1);
      saveHistory();
    }
  };
  
  // 清空历史记录
  const clearHistory = () => {
    importHistory.value = [];
    saveHistory();
  };
  
  // 保存历史记录
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importHistory.value));
    } catch (error) {
      console.error('保存导入历史失败:', error);
    }
  };
  
  // 获取最近导入记录
  const recentImports = computed(() => {
    return importHistory.value.slice(0, 10);
  });
  
  // 按数据源统计
  const statsByDataSource = computed(() => {
    const stats: Record<string, number> = {};
    importHistory.value.forEach(record => {
      stats[record.dataSource] = (stats[record.dataSource] || 0) + 1;
    });
    return stats;
  });
  
  // 按状态统计
  const statsByStatus = computed(() => {
    const stats: Record<string, number> = {};
    importHistory.value.forEach(record => {
      stats[record.status] = (stats[record.status] || 0) + 1;
    });
    return stats;
  });
  
  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 初始化时加载历史记录
  loadHistory();
  
  return {
    // 状态
    importHistory,
    recentImports,
    statsByDataSource,
    statsByStatus,
    
    // 方法
    loadHistory,
    addImportRecord,
    deleteImportRecord,
    clearHistory,
    formatFileSize
  };
} 