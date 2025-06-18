import { ProviderType } from '../types/provider';
import type { RuleConfig, ConfigHistory, Rule } from '../types/rule-config';
import { getPresetConfig } from '../data/preset-configs';

class RuleConfigService {
  private readonly STORAGE_KEY = 'beancount_rule_configs';
  private readonly HISTORY_KEY = 'beancount_config_history';

  // 获取指定Provider的配置
  getConfig(provider: ProviderType): RuleConfig | null {
    const configs = this.getAllConfigs();
    return configs[provider] || null;
  }

  // 获取所有配置
  getAllConfigs(): Partial<Record<ProviderType, RuleConfig>> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load configs from localStorage:', error);
      return {};
    }
  }

  // 保存配置
  saveConfig(config: RuleConfig): void {
    try {
      const configs = this.getAllConfigs();
      configs[config.provider] = {
        ...config,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
      
      // 保存到历史记录
      this.saveToHistory(config);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // 删除配置
  deleteConfig(provider: ProviderType): void {
    try {
      const configs = this.getAllConfigs();
      delete configs[provider];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  }

  // 从预设配置创建新配置
  createFromPreset(provider: ProviderType, name: string): RuleConfig {
    const preset = getPresetConfig(provider);
    if (!preset) {
      throw new Error(`No preset config found for provider: ${provider}`);
    }

    const now = new Date().toISOString();
    const config: RuleConfig = {
      id: this.generateId(),
      provider,
      name,
      description: preset.description,
      createdAt: now,
      updatedAt: now,
      ...preset.config,
      rules: preset.config.rules.map((rule, index) => ({
        ...rule,
        id: this.generateId(),
        priority: index + 1
      }))
    };

    return config;
  }

  // 获取历史记录
  getHistory(provider?: ProviderType): ConfigHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      const history: ConfigHistory[] = stored ? JSON.parse(stored) : [];
      
      if (provider) {
        return history.filter(h => h.provider === provider);
      }
      return history;
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
      return [];
    }
  }

  // 应用历史配置
  applyHistory(historyId: string): RuleConfig | null {
    try {
      const history = this.getHistory();
      const historyItem = history.find(h => h.id === historyId);
      
      if (!historyItem) {
        return null;
      }

      // 更新应用时间
      historyItem.appliedAt = new Date().toISOString();
      this.updateHistory(history);

      // 保存配置
      this.saveConfig(historyItem.config);
      
      return historyItem.config;
    } catch (error) {
      console.error('Failed to apply history:', error);
      return null;
    }
  }

  // 导出配置到剪贴板
  exportToClipboard(provider: ProviderType): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const config = this.getConfig(provider);
        if (!config) {
          resolve(false);
          return;
        }

        const configText = JSON.stringify(config, null, 2);
        navigator.clipboard.writeText(configText).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      } catch (error) {
        console.error('Failed to export config:', error);
        resolve(false);
      }
    });
  }

  // 从剪贴板导入配置
  importFromClipboard(): Promise<RuleConfig | null> {
    return new Promise((resolve) => {
      try {
        navigator.clipboard.readText().then((text) => {
          try {
            const config = JSON.parse(text) as RuleConfig;
            
            // 验证配置格式
            if (!this.validateConfig(config)) {
              resolve(null);
              return;
            }

            // 更新配置
            config.updatedAt = new Date().toISOString();
            config.rules = config.rules.map(rule => ({
              ...rule,
              id: rule.id || this.generateId()
            }));

            this.saveConfig(config);
            resolve(config);
          } catch (error) {
            console.error('Failed to parse clipboard content:', error);
            resolve(null);
          }
        }).catch(() => {
          resolve(null);
        });
      } catch (error) {
        console.error('Failed to import config:', error);
        resolve(null);
      }
    });
  }

  // 验证配置格式
  private validateConfig(config: any): config is RuleConfig {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.provider === 'string' &&
      typeof config.name === 'string' &&
      typeof config.defaultMinusAccount === 'string' &&
      typeof config.defaultPlusAccount === 'string' &&
      typeof config.defaultCurrency === 'string' &&
      Array.isArray(config.rules)
    );
  }

  // 保存到历史记录
  private saveToHistory(config: RuleConfig): void {
    try {
      const history = this.getHistory();
      const historyItem: ConfigHistory = {
        id: this.generateId(),
        provider: config.provider,
        name: config.name,
        config: { ...config },
        createdAt: new Date().toISOString()
      };

      // 限制历史记录数量（最多保存50条）
      history.unshift(historyItem);
      if (history.length > 50) {
        history.splice(50);
      }

      this.updateHistory(history);
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }

  // 更新历史记录
  private updateHistory(history: ConfigHistory[]): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to update history:', error);
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const ruleConfigService = new RuleConfigService(); 