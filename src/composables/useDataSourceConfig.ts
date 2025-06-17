import { ref, computed } from 'vue';
import type { DataSourceConfig, DataSource } from '../types/data-source';

export function useDataSourceConfig() {
  const STORAGE_KEY = 'beancount_datasource_configs';
  
  // 响应式状态
  const configs = ref<Record<string, DataSourceConfig>>({});
  const currentConfig = ref<DataSourceConfig | null>(null);
  const selectedDataSource = ref<string>('');
  
  // 加载所有配置
  const loadConfigs = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        configs.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      configs.value = {};
    }
  };
  
  // 保存配置
  const saveConfig = (config: DataSourceConfig) => {
    try {
      configs.value[config.id] = config;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.value));
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  };
  
  // 获取配置
  const getConfig = (id: string): DataSourceConfig | null => {
    return configs.value[id] || null;
  };
  
  // 删除配置
  const deleteConfig = (id: string) => {
    try {
      delete configs.value[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.value));
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  };
  
  // 选择数据源
  const selectDataSource = (id: string) => {
    selectedDataSource.value = id;
    currentConfig.value = getConfig(id);
  };
  
  // 更新当前配置
  const updateCurrentConfig = (config: Partial<DataSourceConfig>) => {
    if (currentConfig.value) {
      currentConfig.value = { ...currentConfig.value, ...config };
      saveConfig(currentConfig.value);
    }
  };
  
  // 创建默认配置
  const createDefaultConfig = (dataSource: DataSource): DataSourceConfig => {
    return {
      id: dataSource.id,
      name: dataSource.name,
      defaultMinusAccount: `Assets:${dataSource.category}:${dataSource.name}`,
      defaultPlusAccount: 'Expenses:FIXME',
      defaultCommissionAccount: 'Expenses:Commission:手续费',
      defaultCurrency: dataSource.category === 'crypto' ? 'USDT' : 'CNY',
      rules: [],
      fieldMapping: {}
    };
  };
  
  // 导出配置为JSON
  const exportConfig = (id: string): string | null => {
    const config = getConfig(id);
    if (!config) return null;
    
    try {
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error('导出配置失败:', error);
      return null;
    }
  };
  
  // 导入配置从JSON
  const importConfig = (jsonString: string): DataSourceConfig | null => {
    try {
      const config = JSON.parse(jsonString);
      // 验证配置格式
      if (config.id && config.name && config.rules) {
        return config;
      }
      return null;
    } catch (error) {
      console.error('导入配置失败:', error);
      return null;
    }
  };
  
  // 下载配置文件
  const downloadConfig = (id: string) => {
    const jsonString = exportConfig(id);
    if (!jsonString) return;
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 上传配置文件
  const uploadConfig = async (file: File): Promise<DataSourceConfig | null> => {
    try {
      const text = await file.text();
      const config = importConfig(text);
      if (config) {
        saveConfig(config);
        return config;
      }
      return null;
    } catch (error) {
      console.error('上传配置文件失败:', error);
      return null;
    }
  };
  
  // 计算属性
  const hasConfig = computed(() => (id: string) => !!configs.value[id]);
  const configList = computed(() => Object.values(configs.value));
  
  // 初始化时加载配置
  loadConfigs();
  
  return {
    // 状态
    configs,
    currentConfig,
    selectedDataSource,
    
    // 方法
    loadConfigs,
    saveConfig,
    getConfig,
    deleteConfig,
    selectDataSource,
    updateCurrentConfig,
    createDefaultConfig,
    exportConfig,
    importConfig,
    downloadConfig,
    uploadConfig,
    
    // 计算属性
    hasConfig,
    configList
  };
} 