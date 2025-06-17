import { ref, computed } from 'vue';
import type { DataSource } from '../types/data-source';
import { ruleConfigManager, type RuleConfig } from '../utils/rule-config-manager';

export function useDataSourceConfig() {
  // 响应式状态
  const configs = ref<RuleConfig[]>([]);
  const currentConfig = ref<RuleConfig | null>(null);
  const selectedDataSource = ref<string>('');
  
  // 加载所有配置
  const loadConfigs = () => {
    try {
      configs.value = ruleConfigManager.getAllConfigs();
    } catch (error) {
      console.error('加载配置失败:', error);
      configs.value = [];
    }
  };
  
  // 保存配置
  const saveConfig = (config: RuleConfig) => {
    try {
      ruleConfigManager.saveConfig(config);
      loadConfigs(); // 重新加载配置列表
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  };
  
  // 获取配置
  const getConfig = (id: string): RuleConfig | null => {
    return configs.value.find(config => config.id === id) || null;
  };

  // 根据数据源ID获取配置
  const getConfigByDataSourceId = (dataSourceId: string): RuleConfig | null => {
    return ruleConfigManager.getConfigByDataSourceId(dataSourceId);
  };
  
  // 删除配置
  const deleteConfig = (id: string) => {
    try {
      ruleConfigManager.deleteConfig(id);
      loadConfigs(); // 重新加载配置列表
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  };
  
  // 选择数据源
  const selectDataSource = (id: string) => {
    selectedDataSource.value = id;
    currentConfig.value = getConfigByDataSourceId(id);
  };
  
  // 更新当前配置
  const updateCurrentConfig = (config: Partial<RuleConfig>) => {
    if (currentConfig.value) {
      currentConfig.value = { ...currentConfig.value, ...config };
      saveConfig(currentConfig.value);
    }
  };
  
  // 创建默认配置
  const createDefaultConfig = (dataSource: DataSource): RuleConfig => {
    return ruleConfigManager.createDefaultConfig(dataSource);
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
  const importConfig = (jsonString: string): RuleConfig | null => {
    try {
      const config = JSON.parse(jsonString);
      // 验证配置格式
      if (config.id && config.dataSourceId && config.name) {
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
  const uploadConfig = async (file: File): Promise<RuleConfig | null> => {
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
  const hasConfig = computed(() => (id: string) => {
    return configs.value.some(config => config.dataSourceId === id);
  });
  
  const configList = computed(() => configs.value);
  
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
    getConfigByDataSourceId,
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