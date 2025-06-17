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

  // 获取所有规则配置
  getAllConfigs(): RuleConfig[] {
    try {
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
      const configs = this.getAllConfigs();
      const existingIndex = configs.findIndex(c => c.id === config.id);
      
      if (existingIndex >= 0) {
        configs[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
      } else {
        configs.push({ ...config, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(configs));
    } catch (error) {
      console.error('保存规则配置失败:', error);
    }
  }

  // 删除规则配置
  deleteConfig(configId: string): void {
    try {
      const configs = this.getAllConfigs();
      const filteredConfigs = configs.filter(config => config.id !== configId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredConfigs));
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
}

export const ruleConfigManager = new RuleConfigManager(); 