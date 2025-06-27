import { ref, computed } from 'vue';
import { FileProcessorV2 } from '../utils/file-processor-v2';
import type { ProviderConfig } from '../types/provider';
import { ProviderType, Account } from '../types/provider';
import { useConfigStorage } from './useConfigStorage';
import { providers } from '../data/providers';
import { ruleConfigService } from '../services/rule-config-service';
import type { RuleConfig } from '../types/rule-config';
import { RuleEngine } from '../rule-engine';

// 将RuleConfig转换为ProviderConfig的适配器
function convertRuleConfigToProviderConfig(ruleConfig: RuleConfig): ProviderConfig {
  console.log('Converting rule config:', ruleConfig);

  const result = {
    provider: ruleConfig.provider,
    defaultCurrency: ruleConfig.defaultCurrency,
    defaultMinusAccount: ruleConfig.defaultMinusAccount,
    defaultPlusAccount: ruleConfig.defaultPlusAccount,
    defaultCashAccount: ruleConfig.defaultCashAccount,
    defaultCommissionAccount: ruleConfig.defaultCommissionAccount,
    defaultPositionAccount: ruleConfig.defaultPositionAccount,
    defaultPnlAccount: ruleConfig.defaultPnlAccount,
    accounts: [
      ruleConfig.defaultMinusAccount,
      ruleConfig.defaultPlusAccount,
      ...(ruleConfig.defaultCashAccount ? [ruleConfig.defaultCashAccount] : []),
      ...(ruleConfig.defaultCommissionAccount ? [ruleConfig.defaultCommissionAccount] : []),
      ...(ruleConfig.defaultPositionAccount ? [ruleConfig.defaultPositionAccount] : []),
      ...(ruleConfig.defaultPnlAccount ? [ruleConfig.defaultPnlAccount] : [])
    ],
    rules: ruleConfig.rules.map((rule, index) => {
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

      const convertedRule = {
        pattern: pattern,
        account: rule.targetAccount || ruleConfig.defaultPlusAccount,
        targetAccount: rule.targetAccount || ruleConfig.defaultPlusAccount,
        methodAccount: rule.methodAccount || undefined,
        tags: rule.tags || [],
        payee: rule.peer,
        category: rule.category,

        // 添加精确匹配字段 - 只有明确设置时才传递
        peer: rule.peer || undefined,
        item: rule.item || undefined,
        type: rule.type || undefined,
        method: rule.method || undefined,
        txType: rule.txType || undefined,
        time: rule.time || undefined,
        sep: rule.sep,
        fullMatch: rule.fullMatch,
        priority: rule.priority
      };

      console.log(`Rule ${index + 1} conversion:`, {
        original: rule,
        converted: convertedRule,
        hasFieldMatching: !!(rule.peer || rule.item || rule.type || rule.method || rule.category || rule.txType)
      });

      return convertedRule;
    })
  };

  // 调试：只输出特定记录的规则转换信息
  const hasDebugRules = result.rules.some(rule =>
    rule.peer && (rule.peer.includes('金膳') || rule.peer.includes('午餐') || rule.peer.includes('晚餐'))
  );

  if (hasDebugRules) {
    console.log('Final converted config:', result);
  }
  return result;
}

export function useDataSourceConfig() {
  const fileProcessor = new FileProcessorV2();
  const { currentConfig, currentProvider, loadConfig, updateConfig } = useConfigStorage();

  const selectedFile = ref<File | null>(null);
  const detectedProvider = ref<ProviderType | null>(null);
  const isProcessing = ref(false);
  const processingResult = ref<any>(null);
  const error = ref<string | null>(null);
  const ruleTestResult = ref<any>(null);

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

  const processFile = async (selectedMetadata?: string[]) => {
    if (!selectedProvider.value) {
      error.value = '请选择解析器';
      return;
    }

    // 清除测试规则结果，确保只显示Beancount结果
    ruleTestResult.value = null;

    // 每次都刷新最新规则配置
    await loadConfig(selectedProvider.value);

    // 如果没有文件但有缓存结果，直接重新处理缓存数据
    if (!selectedFile.value && processingResult.value) {
      await reprocessCachedData(selectedMetadata);
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

      // 传递 selectedMetadata
      const result = await fileProcessor.processFile(
        selectedFile.value,
        selectedProvider.value,
        providerConfig,
        selectedMetadata
      );

      if (result.success) {
        // 保存原始IR数据用于测试规则
        if (result.statistics?.processedIR) {
          result.statistics.originalIR = result.statistics.processedIR;
        }
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
  const reprocessCachedData = async (selectedMetadata?: string[]) => {
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
      const ruleEngine = new RuleEngine(
        providerConfig.rules,
        ruleConfig.defaultMinusAccount,
        ruleConfig.defaultPlusAccount
      );

      // 获取缓存的数据，确保格式正确
      let cachedData;
      if (processingResult.value.statistics?.originalIR?.orders) {
        // 使用保存的原始IR数据
        cachedData = processingResult.value.statistics.originalIR;
      } else if (processingResult.value.statistics?.processedIR?.orders) {
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.statistics?.processedIR) {
        // 如果 processedIR 存在但没有 orders，尝试使用原始数据
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.data && typeof processingResult.value.data === 'object' && processingResult.value.data.orders) {
        // 如果data是IR对象
        cachedData = processingResult.value.data;
      } else if (processingResult.value.data && typeof processingResult.value.data === 'string') {
        // 如果缓存的是字符串数据（Beancount格式），无法进行规则测试
        error.value = '当前数据为Beancount格式，无法进行规则测试。请重新上传文件或先进行预览。';
        return;
      } else {
        error.value = '没有可用的缓存数据';
        return;
      }

      // 确保数据是 IR 格式
      if (!cachedData || !cachedData.orders || !Array.isArray(cachedData.orders)) {
        error.value = '缓存数据格式错误，请重新上传文件';
        return;
      }

      // 应用规则到缓存的数据
      const processedIR = ruleEngine.applyRulesToIR(cachedData);

      // 获取规则统计
      const ruleStats = ruleEngine.getRuleStats(cachedData);

      // 使用 BeancountConverter 生成格式，与直接上传保持一致
      const { BeancountConverter } = await import('../utils/beancount-converter');
      const beancountConverter = new BeancountConverter();
      const beancountData = beancountConverter.convertToBeancount(processedIR, providerConfig, selectedMetadata);

      // 构建统计信息
      const statistics = {
        parsedItems: cachedData.orders.length,
        start: new Date(),
        end: new Date(),
        totalInRecords: cachedData.orders.filter((order: any) => order.type === 'Recv').length,
        totalInMoney: cachedData.orders.filter((order: any) => order.type === 'Recv').reduce((sum: number, order: any) => sum + order.money, 0),
        totalOutRecords: cachedData.orders.filter((order: any) => order.type === 'Send').length,
        totalOutMoney: cachedData.orders.filter((order: any) => order.type === 'Send').reduce((sum: number, order: any) => sum + Math.abs(order.money), 0),
        // 规则匹配统计
        ruleStats: ruleStats,
        totalMatched: ruleStats.reduce((sum: number, stat: any) => sum + stat.count, 0),
        totalRules: providerConfig.rules.length,
        matchedRules: ruleStats.filter((stat: any) => stat.count > 0).length
      };

      const result = {
        success: true,
        data: beancountData,
        statistics: {
          ...statistics,
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

  const previewFile = async (selectedMetadata?: string[]) => {
    if (!selectedProvider.value) {
      error.value = '请选择解析器';
      return;
    }

    // 每次都刷新最新规则配置
    await loadConfig(selectedProvider.value);

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
        selectedProvider.value,
        selectedMetadata
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
      const ruleEngine = new RuleEngine(
        providerConfig.rules,
        ruleConfig.defaultMinusAccount,
        ruleConfig.defaultPlusAccount
      );

      // 应用规则
      const processedIR = ruleEngine.applyRulesToIR(previewResult.data);

      // 获取规则统计
      const stats = ruleEngine.getRuleStats(previewResult.data);

      console.log('规则配置:', ruleConfig);
      console.log('转换后的配置:', providerConfig);
      console.log('规则统计:', stats);
      console.log('处理后的数据:', processedIR);

      // 生成详细的测试报告
      let testReport = '';
      testReport += '==========================\n';
      testReport += '🌟 规则测试报告\n';
      testReport += '==========================\n\n';

      testReport += '【基础统计】\n';
      testReport += '--------------------------\n';
      testReport += `规则总数：${providerConfig.rules.length}\n`;
      testReport += `数据记录数：${previewResult.data.orders.length}\n`;
      testReport += `总匹配记录：${stats.reduce((sum: number, stat: any) => sum + stat.count, 0)}\n`;
      testReport += `未匹配记录：${previewResult.data.orders.length - stats.reduce((sum: number, stat: any) => sum + stat.count, 0)}\n`;
      testReport += `匹配率：${((stats.reduce((sum: number, stat: any) => sum + stat.count, 0) / previewResult.data.orders.length) * 100).toFixed(1)}%\n\n`;

      testReport += '【规则匹配统计】\n';
      testReport += '--------------------------\n';
      stats.forEach((stat, index) => {
        testReport += `${index + 1}. 规则名：${stat.rule.pattern || '未命名规则'}\n`;
        testReport += `   匹配数量：${stat.count}\n`;
        // 匹配字段
        const matchedFields = [];
        if (stat.rule.peer) matchedFields.push(`peer: ${stat.rule.peer}`);
        if (stat.rule.item) matchedFields.push(`item: ${stat.rule.item}`);
        if (stat.rule.type) matchedFields.push(`type: ${stat.rule.type}`);
        if (stat.rule.method) matchedFields.push(`method: ${stat.rule.method}`);
        if (stat.rule.category) matchedFields.push(`category: ${stat.rule.category}`);
        if (stat.rule.txType) matchedFields.push(`txType: ${stat.rule.txType}`);
        if (stat.rule.time) matchedFields.push(`time: ${stat.rule.time}`);
        if (matchedFields.length > 0) {
          testReport += `   匹配字段：${matchedFields.join(', ')}\n`;
        }
        if (stat.examples.length > 0) {
          testReport += `   示例：${stat.examples.map(e => `【${e}】`).join('，')}\n`;
        }
        if (stat.rule.account) {
          testReport += `   目标账户：${stat.rule.account}\n`;
        }
        if (stat.rule.methodAccount) {
          testReport += `   方法账户：${stat.rule.methodAccount}\n`;
        }
        if (stat.rule.priority !== undefined) {
          testReport += `   优先级：${stat.rule.priority}\n`;
        }
        testReport += '\n';
      });

      testReport += '【未匹配记录示例】\n';
      testReport += '--------------------------\n';
      const unmatchedOrders = previewResult.data.orders.filter((order: any) => {
        return ruleEngine.findAllMatchingRulesSorted(order).length === 0;
      });
      if (unmatchedOrders.length > 0) {
        unmatchedOrders.slice(0, 5).forEach((order: any, index: number) => {
          testReport += `${index + 1}. 对方：${order.peer || '未知'} | 摘要：${order.item || '无描述'} | 金额：${order.money} ${order.currency} | 类型：${order.type} | 方法：${order.method || '未知'}\n`;
        });
        if (unmatchedOrders.length > 5) {
          testReport += `... 还有 ${unmatchedOrders.length - 5} 条未匹配记录\n`;
        }
      } else {
        testReport += '无未匹配记录\n';
      }
      testReport += '\n';

      testReport += '【未匹配字段聚合统计与推荐规则】\n';
      testReport += '--------------------------\n';
      const fieldStats: Record<string, Record<string, number>> = {
        peer: {}, item: {}, type: {}, method: {}, category: {}
      };
      unmatchedOrders.forEach((order: any) => {
        ['peer', 'item', 'type', 'method', 'category'].forEach(field => {
          const val = order[field] || '';
          if (val) {
            fieldStats[field][val] = (fieldStats[field][val] || 0) + 1;
          }
        });
      });
      Object.entries(fieldStats).forEach(([field, stat]) => {
        const sorted = Object.entries(stat).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          testReport += `${field} 出现最多：\n`;
          sorted.slice(0, 3).forEach(([val, count]) => {
            testReport += `   ${val}：${count} 次\n`;
            testReport += `   ⭐ 推荐规则：{ "${field}": "${val}" }\n`;
          });
        }
      });
      testReport += '\n==========================\n';

      // 显示结果（只存到ruleTestResult，不覆盖processingResult）
      ruleTestResult.value = {
        success: true,
        data: testReport,
        statistics: {
          rules: providerConfig.rules,
          stats: stats,
          processedIR: processedIR,
          totalMatched: stats.reduce((sum: number, stat: any) => sum + stat.count, 0),
          totalRecords: previewResult.data.orders.length,
          unmatchedOrders: unmatchedOrders.slice(0, 10) // 只保存前10条未匹配记录
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
      const ruleEngine = new RuleEngine(
        providerConfig.rules,
        ruleConfig.defaultMinusAccount,
        ruleConfig.defaultPlusAccount
      );

      // 获取缓存的数据，确保格式正确
      let cachedData;
      if (processingResult.value.statistics?.originalIR?.orders) {
        // 使用保存的原始IR数据
        cachedData = processingResult.value.statistics.originalIR;
      } else if (processingResult.value.statistics?.processedIR?.orders) {
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.statistics?.processedIR) {
        // 如果 processedIR 存在但没有 orders，尝试使用原始数据
        cachedData = processingResult.value.statistics.processedIR;
      } else if (processingResult.value.data && typeof processingResult.value.data === 'object' && processingResult.value.data.orders) {
        // 如果data是IR对象
        cachedData = processingResult.value.data;
      } else if (processingResult.value.data && typeof processingResult.value.data === 'string') {
        // 如果缓存的是字符串数据（Beancount格式），无法进行规则测试
        error.value = '当前数据为Beancount格式，无法进行规则测试。请重新上传文件或先进行预览。';
        return;
      } else {
        error.value = '没有可用的缓存数据';
        return;
      }

      // 确保数据是 IR 格式
      if (!cachedData || !cachedData.orders || !Array.isArray(cachedData.orders)) {
        error.value = '缓存数据格式错误，请重新上传文件';
        return;
      }

      // 应用规则到缓存的数据
      const processedIR = ruleEngine.applyRulesToIR(cachedData);

      // 获取规则统计
      const stats = ruleEngine.getRuleStats(cachedData);

      console.log('规则配置:', ruleConfig);
      console.log('转换后的配置:', providerConfig);
      console.log('规则统计:', stats);

      // 生成详细的测试报告
      let testReport = '';
      testReport += '==========================\n';
      testReport += '🌟 规则测试报告\n';
      testReport += '==========================\n\n';

      testReport += '【基础统计】\n';
      testReport += '--------------------------\n';
      testReport += `规则总数：${providerConfig.rules.length}\n`;
      testReport += `数据记录数：${cachedData.orders.length}\n`;
      testReport += `总匹配记录：${stats.reduce((sum: number, stat: any) => sum + stat.count, 0)}\n`;
      testReport += `未匹配记录：${cachedData.orders.length - stats.reduce((sum: number, stat: any) => sum + stat.count, 0)}\n`;
      testReport += `匹配率：${((stats.reduce((sum: number, stat: any) => sum + stat.count, 0) / cachedData.orders.length) * 100).toFixed(1)}%\n\n`;

      testReport += '【规则匹配统计】\n';
      testReport += '--------------------------\n';
      stats.forEach((stat, index) => {
        testReport += `${index + 1}. 规则名：${stat.rule.pattern || '未命名规则'}\n`;
        testReport += `   匹配数量：${stat.count}\n`;
        // 匹配字段
        const matchedFields = [];
        if (stat.rule.peer) matchedFields.push(`peer: ${stat.rule.peer}`);
        if (stat.rule.item) matchedFields.push(`item: ${stat.rule.item}`);
        if (stat.rule.type) matchedFields.push(`type: ${stat.rule.type}`);
        if (stat.rule.method) matchedFields.push(`method: ${stat.rule.method}`);
        if (stat.rule.category) matchedFields.push(`category: ${stat.rule.category}`);
        if (stat.rule.txType) matchedFields.push(`txType: ${stat.rule.txType}`);
        if (stat.rule.time) matchedFields.push(`time: ${stat.rule.time}`);
        if (matchedFields.length > 0) {
          testReport += `   匹配字段：${matchedFields.join(', ')}\n`;
        }
        if (stat.examples.length > 0) {
          testReport += `   示例：${stat.examples.map(e => `【${e}】`).join('，')}\n`;
        }
        if (stat.rule.account) {
          testReport += `   目标账户：${stat.rule.account}\n`;
        }
        if (stat.rule.methodAccount) {
          testReport += `   方法账户：${stat.rule.methodAccount}\n`;
        }
        if (stat.rule.priority !== undefined) {
          testReport += `   优先级：${stat.rule.priority}\n`;
        }
        testReport += '\n';
      });

      testReport += '【未匹配记录示例】\n';
      testReport += '--------------------------\n';
      const unmatchedOrders = cachedData.orders.filter((order: any) => {
        return ruleEngine.findAllMatchingRulesSorted(order).length === 0;
      });
      if (unmatchedOrders.length > 0) {
        unmatchedOrders.slice(0, 5).forEach((order: any, index: number) => {
          testReport += `${index + 1}. 对方：${order.peer || '未知'} | 摘要：${order.item || '无描述'} | 金额：${order.money} ${order.currency} | 类型：${order.type} | 方法：${order.method || '未知'}\n`;
        });
        if (unmatchedOrders.length > 5) {
          testReport += `... 还有 ${unmatchedOrders.length - 5} 条未匹配记录\n`;
        }
      } else {
        testReport += '无未匹配记录\n';
      }
      testReport += '\n';

      testReport += '【未匹配字段聚合统计与推荐规则】\n';
      testReport += '--------------------------\n';
      const fieldStats: Record<string, Record<string, number>> = {
        peer: {}, item: {}, type: {}, method: {}, category: {}
      };
      unmatchedOrders.forEach((order: any) => {
        ['peer', 'item', 'type', 'method', 'category'].forEach(field => {
          const val = order[field] || '';
          if (val) {
            fieldStats[field][val] = (fieldStats[field][val] || 0) + 1;
          }
        });
      });
      Object.entries(fieldStats).forEach(([field, stat]) => {
        const sorted = Object.entries(stat).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          testReport += `${field} 出现最多：\n`;
          sorted.slice(0, 3).forEach(([val, count]) => {
            testReport += `   ${val}：${count} 次\n`;
            testReport += `   ⭐ 推荐规则：{ "${field}": "${val}" }\n`;
          });
        }
      });
      testReport += '\n==========================\n';

      // 显示结果（只存到ruleTestResult，不覆盖processingResult）
      ruleTestResult.value = {
        success: true,
        data: testReport,
        statistics: {
          rules: providerConfig.rules,
          stats: stats,
          processedIR: processedIR,
          totalMatched: stats.reduce((sum: number, stat: any) => sum + stat.count, 0),
          totalRecords: cachedData.orders.length,
          unmatchedOrders: unmatchedOrders.slice(0, 10) // 只保存前10条未匹配记录
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
        const parsedResult = JSON.parse(cachedResult);
        // 只恢复账单IR结构的缓存，规则调试结果不恢复
        if (
          parsedResult &&
          typeof parsedResult === 'object' &&
          parsedResult.statistics &&
          parsedResult.statistics.processedIR &&
          Array.isArray(parsedResult.statistics.processedIR.orders)
        ) {
          processingResult.value = parsedResult;
        } else {
          clearFileState();
        }
      }
    } catch (err) {
      console.warn('恢复缓存状态失败:', err);
      clearFileState();
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
    ruleTestResult,
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