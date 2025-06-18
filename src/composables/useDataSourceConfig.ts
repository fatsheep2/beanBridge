import { ref, computed } from 'vue';
import { FileProcessorV2 } from '../utils/file-processor-v2';
import type { ProviderConfig } from '../types/provider';
import { ProviderType } from '../types/provider';
import { useConfigStorage } from './useConfigStorage';
import { mockAlipayFile, mockWechatFile } from '../utils/test-data';
import { providers } from '../data/providers';
import { ruleConfigService } from '../services/rule-config-service';
import type { RuleConfig } from '../types/rule-config';

// 将RuleConfig转换为ProviderConfig的适配器
function convertRuleConfigToProviderConfig(ruleConfig: RuleConfig): ProviderConfig {
  return {
    provider: ruleConfig.provider,
    defaultCurrency: ruleConfig.defaultCurrency,
    accounts: [
      ruleConfig.defaultMinusAccount,
      ruleConfig.defaultPlusAccount,
      ...(ruleConfig.defaultCashAccount ? [ruleConfig.defaultCashAccount] : []),
      ...(ruleConfig.defaultCommissionAccount ? [ruleConfig.defaultCommissionAccount] : []),
      ...(ruleConfig.defaultPositionAccount ? [ruleConfig.defaultPositionAccount] : []),
      ...(ruleConfig.defaultPnlAccount ? [ruleConfig.defaultPnlAccount] : [])
    ],
    rules: ruleConfig.rules.map(rule => {
      // 构建匹配模式 - 使用多个字段组合
      const patterns: string[] = [];
      if (rule.peer) patterns.push(rule.peer);
      if (rule.item) patterns.push(rule.item);
      if (rule.type) patterns.push(rule.type);
      if (rule.method) patterns.push(rule.method);
      if (rule.category) patterns.push(rule.category);
      if (rule.txType) patterns.push(rule.txType);
      
      // 如果没有明确的匹配字段，使用规则名称作为备选
      const pattern = patterns.length > 0 ? patterns.join('|') : rule.name;
      
      return {
        pattern: pattern,
        account: rule.targetAccount || ruleConfig.defaultPlusAccount,
        methodAccount: rule.methodAccount,
        tags: rule.tags || [],
        payee: rule.peer,
        category: rule.category
      };
    })
  };
}

export function useDataSourceConfig() {
  const fileProcessor = new FileProcessorV2();
  const { currentConfig, currentProvider, loadConfig, updateConfig } = useConfigStorage();
  
  const selectedFile = ref<File | null>(null);
  const detectedProvider = ref<ProviderType | null>(null);
  const isProcessing = ref(false);
  const processingResult = ref<any>(null);
  const error = ref<string | null>(null);

  const supportedProviders = computed(() => {
    return providers;
  });

  const selectedProvider = computed(() => {
    return detectedProvider.value || (currentProvider.value as ProviderType);
  });

  const canProcess = computed(() => {
    return selectedFile.value && selectedProvider.value && !isProcessing.value;
  });

  const handleFileSelect = async (file: File) => {
    selectedFile.value = file;
    error.value = null;
    processingResult.value = null;

    try {
      // 自动检测解析器类型
      const detected = await fileProcessor.detectProvider(file);
      detectedProvider.value = detected;
      
      if (detected) {
        loadConfig(detected);
      }
    } catch (err) {
      console.error('文件检测失败:', err);
      error.value = '文件检测失败';
    }
  };

  const setProvider = (provider: ProviderType) => {
    detectedProvider.value = provider;
    loadConfig(provider);
  };

  const validateFile = () => {
    if (!selectedFile.value || !selectedProvider.value) {
      return { valid: false, error: '请选择文件和解析器' };
    }

    return fileProcessor.validateFile(selectedFile.value, selectedProvider.value);
  };

  const processFile = async () => {
    if (!selectedFile.value || !selectedProvider.value) {
      error.value = '请选择文件和解析器';
      return;
    }

    const validation = validateFile();
    if (!validation.valid) {
      error.value = validation.error || '文件验证失败';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      // 获取规则配置并转换
      const ruleConfig = ruleConfigService.getConfig(selectedProvider.value);
      const providerConfig = ruleConfig 
        ? convertRuleConfigToProviderConfig(ruleConfig)
        : currentConfig.value || undefined;
      
      const result = await fileProcessor.processFile(
        selectedFile.value,
        selectedProvider.value,
        providerConfig
      );

      if (result.success) {
        processingResult.value = result;
      } else {
        error.value = result.error || '处理失败';
      }
    } catch (err) {
      console.error('文件处理失败:', err);
      error.value = '文件处理失败';
    } finally {
      isProcessing.value = false;
    }
  };

  const previewFile = async () => {
    if (!selectedFile.value || !selectedProvider.value) {
      error.value = '请选择文件和解析器';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      const result = await fileProcessor.previewFile(
        selectedFile.value,
        selectedProvider.value
      );

      if (result.success) {
        processingResult.value = result;
      } else {
        error.value = result.error || '预览失败';
      }
    } catch (err) {
      console.error('文件预览失败:', err);
      error.value = '文件预览失败';
    } finally {
      isProcessing.value = false;
    }
  };

  const downloadResult = (filename?: string) => {
    if (!processingResult.value?.data) {
      error.value = '没有可下载的数据';
      return;
    }

    const blob = new Blob([processingResult.value.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `beancount_${new Date().toISOString().split('T')[0]}.beancount`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    selectedFile.value = null;
    detectedProvider.value = null;
    isProcessing.value = false;
    processingResult.value = null;
    error.value = null;
  };

  const testRules = async () => {
    if (!selectedFile.value || !selectedProvider.value) {
      error.value = '请选择文件和解析器';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      // 获取规则配置
      const ruleConfig = ruleConfigService.getConfig(selectedProvider.value);
      if (!ruleConfig) {
        error.value = '没有找到规则配置';
        return;
      }

      // 预览文件以获取原始数据
      const previewResult = await fileProcessor.previewFile(
        selectedFile.value,
        selectedProvider.value
      );

      if (!previewResult.success || !previewResult.data) {
        error.value = '文件预览失败';
        return;
      }

      // 转换规则配置
      const providerConfig = convertRuleConfigToProviderConfig(ruleConfig);
      
      // 创建规则引擎并测试
      const { RuleEngine } = await import('../rule-engine');
      const ruleEngine = new RuleEngine(providerConfig.rules);
      
      // 应用规则
      const processedIR = ruleEngine.applyRulesToIR(previewResult.data);
      
      // 获取规则统计
      const stats = ruleEngine.getRuleStats(previewResult.data);
      
      console.log('规则配置:', ruleConfig);
      console.log('转换后的配置:', providerConfig);
      console.log('规则统计:', stats);
      console.log('处理后的数据:', processedIR);
      
      // 显示结果
      processingResult.value = {
        success: true,
        data: `规则测试完成\n\n规则数量: ${providerConfig.rules.length}\n匹配统计:\n${stats.map(s => `- ${s.rule.pattern}: ${s.count} 条`).join('\n')}`,
        statistics: {
          rules: providerConfig.rules,
          stats: stats,
          processedIR: processedIR
        },
        provider: selectedProvider.value
      };
      
    } catch (err) {
      console.error('规则测试失败:', err);
      error.value = '规则测试失败';
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    // 状态
    selectedFile,
    detectedProvider,
    selectedProvider,
    isProcessing,
    processingResult,
    error,
    supportedProviders,
    canProcess,

    // 方法
    handleFileSelect,
    setProvider,
    validateFile,
    processFile,
    previewFile,
    downloadResult,
    reset,
    testRules
  };
} 