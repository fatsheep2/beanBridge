import { ProviderFactory } from '../providers/provider-factory';
import { RuleEngine } from '../rule-engine';
import { BeancountConverter } from './beancount-converter';
import type { IR, ProviderType, ProviderConfig } from '../types/provider';

export interface ProcessingResult {
  success: boolean;
  data?: string;
  error?: string;
  statistics?: any;
  provider?: string;
}

export class FileProcessorV2 {
  private ruleEngine: RuleEngine;
  private beancountConverter: BeancountConverter;

  constructor() {
    this.ruleEngine = new RuleEngine();
    this.beancountConverter = new BeancountConverter();
  }

  async processFile(
    file: File, 
    providerType: ProviderType, 
    config?: ProviderConfig
  ): Promise<ProcessingResult> {
    try {
      // 1. 创建解析器
      const provider = ProviderFactory.create(providerType);
      
      // 2. 解析文件
      const ir = await provider.translate(file);
      
      // 3. 应用规则（如果有配置）
      let processedIR = ir;
      if (config && config.rules.length > 0) {
        this.ruleEngine = new RuleEngine(config.rules);
        processedIR = this.ruleEngine.applyRulesToIR(ir);
      }
      
      // 4. 转换为 Beancount 格式
      const beancountData = this.beancountConverter.convertToBeancount(processedIR, config);
      
      // 5. 获取统计信息
      const statistics = provider.getStatistics();
      
      return {
        success: true,
        data: beancountData,
        statistics,
        provider: provider.getProviderName()
      };
      
    } catch (error) {
      console.error('文件处理失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  async detectProvider(file: File): Promise<ProviderType | null> {
    try {
      // 读取文件头来检测解析器类型
      const text = await this.readFileHeader(file);
      const lines = text.split('\n').slice(0, 5); // 只读取前5行
      
      return ProviderFactory.detectProvider(file.name, lines);
    } catch (error) {
      console.error('解析器检测失败:', error);
      return null;
    }
  }

  private async readFileHeader(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file.slice(0, 1024)); // 只读取前1KB
    });
  }

  getSupportedProviders(): Array<{ type: ProviderType; name: string; formats: string[] }> {
    return ProviderFactory.getSupportedProviders().map(type => {
      const info = ProviderFactory.getProviderInfo(type);
      return {
        type,
        name: info?.name || type,
        formats: info?.formats || []
      };
    });
  }

  validateFile(file: File, providerType: ProviderType): { valid: boolean; error?: string } {
    const info = ProviderFactory.getProviderInfo(providerType);
    if (!info) {
      return { valid: false, error: '不支持的解析器类型' };
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!info.formats.includes(extension)) {
      return { 
        valid: false, 
        error: `不支持的文件格式。支持的格式: ${info.formats.join(', ')}` 
      };
    }

    if (file.size === 0) {
      return { valid: false, error: '文件为空' };
    }

    return { valid: true };
  }

  // 预览解析结果（不生成 Beancount）
  async previewFile(file: File, providerType: ProviderType): Promise<{
    success: boolean;
    data?: IR;
    error?: string;
    statistics?: any;
    provider?: string;
  }> {
    try {
      const provider = ProviderFactory.create(providerType);
      const ir = await provider.translate(file);
      const statistics = provider.getStatistics();
      
      return {
        success: true,
        data: ir,
        statistics,
        provider: provider.getProviderName()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 测试规则
  testRule(rule: any, testText: string): boolean {
    return this.ruleEngine.testRule(rule, testText);
  }

  // 获取规则统计
  getRuleStats(ir: IR): Array<{ rule: any; count: number; examples: string[] }> {
    return this.ruleEngine.getRuleStats(ir);
  }
} 