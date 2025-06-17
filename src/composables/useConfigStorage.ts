import { ref, watch } from 'vue';

export interface ConfigRule {
  pattern: string;
  account: string;
  tags?: string[];
  payee?: string;
}

export interface ProviderConfig {
  rules: ConfigRule[];
  accounts: string[];
  defaultCurrency: string;
}

export function useConfigStorage() {
  const STORAGE_KEY = 'beancount_configs';
  
  const getConfigs = (): Record<string, ProviderConfig> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('读取配置失败:', error);
      return {};
    }
  };
  
  const saveConfig = (provider: string, config: ProviderConfig) => {
    try {
      const configs = getConfigs();
      configs[provider] = config;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  };
  
  const getConfig = (provider: string): ProviderConfig | null => {
    const configs = getConfigs();
    return configs[provider] || null;
  };
  
  const deleteConfig = (provider: string) => {
    try {
      const configs = getConfigs();
      delete configs[provider];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  };
  
  const getAllProviders = (): string[] => {
    const configs = getConfigs();
    return Object.keys(configs);
  };
  
  // 创建响应式的配置状态
  const currentConfig = ref<ProviderConfig | null>(null);
  const currentProvider = ref<string>('');
  
  const loadConfig = (provider: string) => {
    currentProvider.value = provider;
    currentConfig.value = getConfig(provider);
  };
  
  const updateConfig = (config: ProviderConfig) => {
    if (currentProvider.value) {
      currentConfig.value = config;
      saveConfig(currentProvider.value, config);
    }
  };
  
  // 监听配置变化并自动保存
  watch(currentConfig, (newConfig) => {
    if (newConfig && currentProvider.value) {
      saveConfig(currentProvider.value, newConfig);
    }
  }, { deep: true });
  
  return {
    // 基础方法
    saveConfig,
    getConfig,
    deleteConfig,
    getAllProviders,
    
    // 响应式状态
    currentConfig,
    currentProvider,
    loadConfig,
    updateConfig
  };
} 