import type { ProviderConfig } from '../types/provider';

interface ConfigItem {
  id: string;
  dataSourceId: string;
  config: ProviderConfig;
  createdAt: string;
  updatedAt: string;
}

class RuleConfigManager {
  private storageKey = 'beancount_rule_configs';

  private getStorage(): ConfigItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取配置存储失败:', error);
      return [];
    }
  }

  private setStorage(configs: ConfigItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(configs));
    } catch (error) {
      console.error('保存配置存储失败:', error);
    }
  }

  saveConfig(config: ProviderConfig & { id: string; dataSourceId: string }): boolean {
    try {
      const configs = this.getStorage();
      const existingIndex = configs.findIndex(c => c.id === config.id);
      
      const configItem: ConfigItem = {
        id: config.id,
        dataSourceId: config.dataSourceId,
        config: {
          rules: config.rules,
          accounts: config.accounts,
          defaultCurrency: config.defaultCurrency,
          provider: config.provider
        },
        createdAt: existingIndex >= 0 ? configs[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        configs[existingIndex] = configItem;
      } else {
        configs.push(configItem);
      }

      this.setStorage(configs);
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  getConfigByDataSourceId(dataSourceId: string): ProviderConfig | null {
    try {
      const configs = this.getStorage();
      const configItem = configs.find(c => c.dataSourceId === dataSourceId);
      return configItem ? configItem.config : null;
    } catch (error) {
      console.error('读取配置失败:', error);
      return null;
    }
  }

  getAllConfigs(): ConfigItem[] {
    return this.getStorage();
  }

  deleteConfig(configId: string): boolean {
    try {
      const configs = this.getStorage();
      const filteredConfigs = configs.filter(c => c.id !== configId);
      this.setStorage(filteredConfigs);
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  }

  clearAllConfigs(): boolean {
    try {
      this.setStorage([]);
      return true;
    } catch (error) {
      console.error('清空配置失败:', error);
      return false;
    }
  }
}

export const ruleConfigManager = new RuleConfigManager(); 