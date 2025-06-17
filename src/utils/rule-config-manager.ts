import type { DataSource } from '../types/data-source';

export interface RuleConfig {
  id: string;
  dataSourceId: string;
  name: string;
  encoding: string;
  delimiter: string;
  skipRows: number;
  currency: string;
  minusAccount: string;
  plusAccount: string;
  commissionAccount: string;
  dateField: string;
  amountField: string;
  descriptionField: string;
  payeeField: string;
  fieldMappings: Record<string, string>;
  rules: any[];
  createdAt: string;
  updatedAt: string;
}

class RuleConfigManager {
  private storageKey = 'beanbridge_rule_configs';

  // 检查 localStorage 是否可用
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage 不可用:', e);
      return false;
    }
  }

  // 获取所有规则配置
  getAllConfigs(): RuleConfig[] {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('localStorage 不可用，返回空配置列表');
        return [];
      }
      
      const configs = localStorage.getItem(this.storageKey);
      return configs ? JSON.parse(configs) : [];
    } catch (error) {
      console.error('获取规则配置失败:', error);
      return [];
    }
  }

  // 根据数据源ID获取规则配置
  getConfigByDataSourceId(dataSourceId: string): RuleConfig | null {
    const configs = this.getAllConfigs();
    return configs.find(config => config.dataSourceId === dataSourceId) || null;
  }

  // 保存规则配置
  saveConfig(config: RuleConfig): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.error('localStorage 不可用，无法保存配置');
        throw new Error('localStorage 不可用');
      }
      
      const configs = this.getAllConfigs();
      const existingIndex = configs.findIndex(c => c.id === config.id);
      
      if (existingIndex >= 0) {
        configs[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
      } else {
        configs.push({ ...config, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(configs));
      console.log(`配置保存成功: ${config.name} (${config.id})`);
    } catch (error) {
      console.error('保存规则配置失败:', error);
      throw error;
    }
  }

  // 删除规则配置
  deleteConfig(configId: string): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.error('localStorage 不可用，无法删除配置');
        return;
      }
      
      const configs = this.getAllConfigs();
      const filteredConfigs = configs.filter(config => config.id !== configId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredConfigs));
      console.log(`配置删除成功: ${configId}`);
    } catch (error) {
      console.error('删除规则配置失败:', error);
    }
  }

  // 创建默认配置
  createDefaultConfig(dataSource: DataSource): RuleConfig {
    return {
      id: `config_${dataSource.id}_${Date.now()}`,
      dataSourceId: dataSource.id,
      name: `${dataSource.name} 默认配置`,
      encoding: 'utf-8',
      delimiter: ',',
      skipRows: dataSource.skipLines || 0,
      currency: 'CNY',
      minusAccount: dataSource.defaultMinusAccount || 'Expenses:Other',
      plusAccount: dataSource.defaultPlusAccount || 'Assets:Bank:Default',
      commissionAccount: dataSource.defaultCommissionAccount || 'Expenses:Commission',
      dateField: '',
      amountField: '',
      descriptionField: '',
      payeeField: '',
      fieldMappings: {},
      rules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 应用规则配置到数据
  applyConfig(data: any[], config: RuleConfig): any[] {
    if (!config) return data;

    return data.map(row => {
      const processedRow: any = {};
      
      // 应用字段映射
      Object.entries(config.fieldMappings).forEach(([targetField, sourceField]) => {
        if (sourceField && row[sourceField] !== undefined) {
          processedRow[targetField] = row[sourceField];
        }
      });

      // 应用规则
      config.rules.forEach(rule => {
        // 这里可以添加更复杂的规则处理逻辑
        if (rule.condition && rule.action) {
          // 规则处理逻辑
        }
      });

      return processedRow;
    });
  }

  // 导出所有配置为JSON字符串
  exportAllConfigs(): string {
    try {
      const configs = this.getAllConfigs();
      return JSON.stringify(configs, null, 2);
    } catch (error) {
      console.error('导出配置失败:', error);
      return '[]';
    }
  }

  // 从JSON字符串导入配置
  importConfigs(jsonString: string): boolean {
    try {
      const configs = JSON.parse(jsonString);
      if (!Array.isArray(configs)) {
        throw new Error('配置格式错误：必须是数组');
      }
      
      // 验证每个配置的格式
      for (const config of configs) {
        if (!config.id || !config.dataSourceId || !config.name) {
          throw new Error('配置格式错误：缺少必要字段');
        }
      }
      
      // 保存到 localStorage
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.storageKey, JSON.stringify(configs));
        console.log(`成功导入 ${configs.length} 个配置`);
        return true;
      } else {
        console.error('localStorage 不可用，无法导入配置');
        return false;
      }
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }

  // 下载配置文件
  downloadConfigs(): void {
    try {
      const jsonString = this.exportAllConfigs();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beanbridge-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('配置文件下载成功');
    } catch (error) {
      console.error('下载配置文件失败:', error);
    }
  }
}

export const ruleConfigManager = new RuleConfigManager(); 