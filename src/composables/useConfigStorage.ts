import { ref, watch } from 'vue';
import type { ProviderConfig, ConfigRule } from '../types/provider';
import { ProviderType } from '../types/provider';

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

  const createDefaultConfig = (provider: string): ProviderConfig => {
    return {
      rules: [],
      accounts: [],
      defaultCurrency: 'CNY',
      provider
    };
  };

  const getOrCreateConfig = (provider: string): ProviderConfig => {
    const existing = getConfig(provider);
    if (existing) {
      return existing;
    }
    
    const defaultConfig = createDefaultConfig(provider);
    saveConfig(provider, defaultConfig);
    return defaultConfig;
  };
  
  // 创建响应式的配置状态
  const currentConfig = ref<ProviderConfig | null>(null);
  const currentProvider = ref<string>('');
  
  const loadConfig = (provider: string) => {
    currentProvider.value = provider;
    currentConfig.value = getOrCreateConfig(provider);
  };
  
  const updateConfig = (config: ProviderConfig) => {
    if (currentProvider.value) {
      currentConfig.value = config;
      saveConfig(currentProvider.value, config);
    }
  };

  const addRule = (rule: ConfigRule) => {
    if (currentConfig.value) {
      currentConfig.value.rules.push(rule);
      updateConfig(currentConfig.value);
    }
  };

  const updateRule = (index: number, rule: ConfigRule) => {
    if (currentConfig.value && index >= 0 && index < currentConfig.value.rules.length) {
      currentConfig.value.rules[index] = rule;
      updateConfig(currentConfig.value);
    }
  };

  const removeRule = (index: number) => {
    if (currentConfig.value && index >= 0 && index < currentConfig.value.rules.length) {
      currentConfig.value.rules.splice(index, 1);
      updateConfig(currentConfig.value);
    }
  };

  const addAccount = (account: string) => {
    if (currentConfig.value && !currentConfig.value.accounts.includes(account)) {
      currentConfig.value.accounts.push(account);
      updateConfig(currentConfig.value);
    }
  };

  const removeAccount = (account: string) => {
    if (currentConfig.value) {
      const index = currentConfig.value.accounts.indexOf(account);
      if (index > -1) {
        currentConfig.value.accounts.splice(index, 1);
        updateConfig(currentConfig.value);
      }
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
    createDefaultConfig,
    getOrCreateConfig,
    
    // 响应式状态
    currentConfig,
    currentProvider,
    loadConfig,
    updateConfig,
    
    // 规则管理
    addRule,
    updateRule,
    removeRule,
    
    // 账户管理
    addAccount,
    removeAccount
  };
} 