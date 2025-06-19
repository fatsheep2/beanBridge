import { ref, computed } from 'vue';
import { FileProcessorV2 } from '../utils/file-processor-v2';
import type { ProviderConfig } from '../types/provider';
import { ProviderType, Account } from '../types/provider';
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

      // 处理各个字段，支持分隔符
      const processField = (field: string | undefined, sep: string | undefined) => {
        if (!field) return;
        if (sep && field.includes(sep)) {
          // 如果有分隔符，拆分为多个模式
          const parts = field.split(sep).map(p => p.trim()).filter(p => p.length > 0);
          patterns.push(...parts);
        } else {
          patterns.push(field);
        }
      };

      processField(rule.peer, rule.sep);
      processField(rule.item, rule.sep);
      processField(rule.type, rule.sep);
      processField(rule.method, rule.sep);
      processField(rule.category, rule.sep);
      processField(rule.txType, rule.sep);

      // 如果没有明确的匹配字段，使用规则名称作为备选
      const pattern = patterns.length > 0 ? patterns.join('|') : rule.name;

      return {
        pattern: pattern,
        account: rule.targetAccount || ruleConfig.defaultPlusAccount,
        methodAccount: rule.methodAccount || ruleConfig.defaultMinusAccount,
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
    // 如果有文件且解析器，或者有缓存的处理结果，都可以处理
    return (selectedFile.value && selectedProvider.value && !isProcessing.value) ||
      (processingResult.value && selectedProvider.value && !isProcessing.value);
  });

  // 检查是否有可用的数据源（文件或缓存结果）
  const hasDataSource = computed(() => {
    return selectedFile.value || processingResult.value;
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
    if (!selectedProvider.value) {
      error.value = '请选择解析器';
      return;
    }

    // 如果没有文件但有缓存结果，直接重新处理缓存数据
    if (!selectedFile.value && processingResult.value) {
      await reprocessCachedData();
      return;
    }

    if (!selectedFile.value) {
      error.value = '请选择文件';
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
        saveFileState(); // 保存状态
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

  // 重新处理缓存数据
  const reprocessCachedData = async () => {
    if (!processingResult.value || !selectedProvider.value) {
      error.value = '没有可用的缓存数据';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      // 获取规则配置并转换
      const ruleConfig = ruleConfigService.getConfig(selectedProvider.value);
      if (!ruleConfig) {
        error.value = '没有找到规则配置';
        return;
      }

      // 转换规则配置
      const providerConfig = convertRuleConfigToProviderConfig(ruleConfig);

      // 创建规则引擎并重新处理
      const { RuleEngine } = await import('../rule-engine');
      const ruleEngine = new RuleEngine(providerConfig.rules);

      // 获取缓存的数据，确保格式正确
      let cachedData;
      if (processingResult.value.statistics?.processedIR) {
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.data) {
        // 如果缓存的是字符串数据，需要重新解析
        error.value = '缓存数据格式不支持重新处理，请重新上传文件';
        return;
      } else {
        error.value = '没有可用的缓存数据';
        return;
      }

      // 确保数据是 IR 格式
      if (!cachedData || !cachedData.orders || !Array.isArray(cachedData.orders)) {
        error.value = '缓存数据格式错误';
        return;
      }

      // 应用规则到缓存的数据
      const processedIR = ruleEngine.applyRulesToIR(cachedData);

      // 生成新的 Beancount 格式
      const result = {
        success: true,
        data: `重新处理完成\n\n规则数量: ${providerConfig.rules.length}\n处理结果:\n${processedIR.orders.map(order => {
          const targetAccount = order.extraAccounts?.[Account.PlusAccount] || ruleConfig.defaultPlusAccount;
          const methodAccount = order.extraAccounts?.[Account.MinusAccount] || ruleConfig.defaultMinusAccount;
          return `${order.payTime} * "${order.peer}" "${order.note}"\n  ${targetAccount} ${order.money} CNY\n  ${methodAccount} -${order.money} CNY`;
        }).join('\n\n')}`,
        statistics: {
          rules: providerConfig.rules,
          processedIR: processedIR
        },
        provider: selectedProvider.value
      };

      processingResult.value = result;
      saveFileState(); // 保存状态

    } catch (err) {
      console.error('重新处理缓存数据失败:', err);
      error.value = '重新处理失败';
    } finally {
      isProcessing.value = false;
    }
  };

  const previewFile = async () => {
    if (!selectedProvider.value) {
      error.value = '请选择解析器';
      return;
    }

    // 如果没有文件但有缓存结果，直接显示缓存数据
    if (!selectedFile.value && processingResult.value) {
      // 直接显示缓存的结果，不需要重新处理
      return;
    }

    if (!selectedFile.value) {
      error.value = '请选择文件';
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
        saveFileState(); // 保存状态
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

  const testRules = async () => {
    if (!selectedProvider.value) {
      error.value = '请选择解析器';
      return;
    }

    // 如果没有文件但有缓存结果，使用缓存数据进行测试
    if (!selectedFile.value && processingResult.value) {
      await testRulesWithCachedData();
      return;
    }

    if (!selectedFile.value) {
      error.value = '请选择文件';
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

      saveFileState(); // 保存状态

    } catch (err) {
      console.error('规则测试失败:', err);
      error.value = '规则测试失败';
    } finally {
      isProcessing.value = false;
    }
  };

  // 使用缓存数据测试规则
  const testRulesWithCachedData = async () => {
    if (!processingResult.value || !selectedProvider.value) {
      error.value = '没有可用的缓存数据';
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

      // 转换规则配置
      const providerConfig = convertRuleConfigToProviderConfig(ruleConfig);

      // 创建规则引擎并测试
      const { RuleEngine } = await import('../rule-engine');
      const ruleEngine = new RuleEngine(providerConfig.rules);

      // 获取缓存的数据，确保格式正确
      let cachedData;
      if (processingResult.value.statistics?.processedIR) {
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.data) {
        // 如果缓存的是字符串数据，无法进行规则测试
        error.value = '缓存数据格式不支持规则测试，请重新上传文件';
        return;
      } else {
        error.value = '没有可用的缓存数据';
        return;
      }

      // 确保数据是 IR 格式
      if (!cachedData || !cachedData.orders || !Array.isArray(cachedData.orders)) {
        error.value = '缓存数据格式错误';
        return;
      }

      const stats = ruleEngine.getRuleStats(cachedData);

      console.log('规则配置:', ruleConfig);
      console.log('转换后的配置:', providerConfig);
      console.log('规则统计:', stats);

      // 显示结果
      processingResult.value = {
        success: true,
        data: `规则测试完成（使用缓存数据）\n\n规则数量: ${providerConfig.rules.length}\n匹配统计:\n${stats.map(s => `- ${s.rule.pattern}: ${s.count} 条`).join('\n')}`,
        statistics: {
          rules: providerConfig.rules,
          stats: stats,
          processedIR: cachedData
        },
        provider: selectedProvider.value
      };

      saveFileState(); // 保存状态

    } catch (err) {
      console.error('规则测试失败:', err);
      error.value = '规则测试失败';
    } finally {
      isProcessing.value = false;
    }
  };

  // 从本地存储恢复文件状态
  const restoreFileState = () => {
    try {
      const cachedFile = localStorage.getItem('beancount_cached_file');
      const cachedProvider = localStorage.getItem('beancount_cached_provider');
      const cachedResult = localStorage.getItem('beancount_cached_result');

      if (cachedProvider) {
        detectedProvider.value = cachedProvider as ProviderType;
        loadConfig(cachedProvider as ProviderType);
      }

      if (cachedResult) {
        processingResult.value = JSON.parse(cachedResult);
      }
    } catch (err) {
      console.warn('恢复缓存状态失败:', err);
    }
  };

  // 保存文件状态到本地存储
  const saveFileState = () => {
    try {
      if (detectedProvider.value) {
        localStorage.setItem('beancount_cached_provider', detectedProvider.value);
      }
      if (processingResult.value) {
        localStorage.setItem('beancount_cached_result', JSON.stringify(processingResult.value));
      }
    } catch (err) {
      console.warn('保存缓存状态失败:', err);
    }
  };

  // 清除缓存状态
  const clearFileState = () => {
    try {
      localStorage.removeItem('beancount_cached_file');
      localStorage.removeItem('beancount_cached_provider');
      localStorage.removeItem('beancount_cached_result');
    } catch (err) {
      console.warn('清除缓存状态失败:', err);
    }
  };

  // 初始化时恢复状态
  restoreFileState();

  const reset = () => {
    selectedFile.value = null;
    detectedProvider.value = null;
    processingResult.value = null;
    error.value = null;
    isProcessing.value = false;
    clearFileState();
  };

  return {
    selectedFile,
    selectedProvider,
    detectedProvider,
    processingResult,
    isProcessing,
    error,
    providers,
    processFile,
    previewFile,
    testRules,
    testRulesWithCachedData,
    reset,
    hasDataSource,
    canProcess,
    handleFileSelect,
    setProvider,
    restoreFileState,
    saveFileState,
    clearFileState
  };
} 