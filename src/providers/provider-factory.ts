import type { ProviderInterface } from '../types/provider';
import { ProviderType } from '../types/provider';
import { AlipayProvider } from './alipay-provider';
import { WechatProvider } from './wechat-provider';

export class ProviderFactory {
  private static providers = new Map<ProviderType, new () => ProviderInterface>([
    [ProviderType.Alipay, AlipayProvider],
    [ProviderType.Wechat, WechatProvider],
    // 可以继续添加其他解析器
  ]);

  static create(providerType: ProviderType): ProviderInterface {
    const ProviderClass = this.providers.get(providerType);
    
    if (!ProviderClass) {
      throw new Error(`不支持的解析器类型: ${providerType}`);
    }
    
    return new ProviderClass();
  }

  static getSupportedProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }

  static getProviderInfo(providerType: ProviderType): { name: string; formats: string[] } | null {
    try {
      const provider = this.create(providerType);
      return {
        name: provider.getProviderName(),
        formats: provider.getSupportedFormats()
      };
    } catch (error) {
      return null;
    }
  }

  static detectProvider(filename: string, headers?: string[]): ProviderType | null {
    const lowerFilename = filename.toLowerCase();
    
    // 根据文件名检测
    if (lowerFilename.includes('alipay') || lowerFilename.includes('支付宝')) {
      return ProviderType.Alipay;
    }
    
    if (lowerFilename.includes('wechat') || lowerFilename.includes('微信')) {
      return ProviderType.Wechat;
    }
    
    // 根据文件头检测
    if (headers && headers.length > 0) {
      const headerText = headers.join(' ').toLowerCase();
      
      if (headerText.includes('支付宝') || headerText.includes('alipay')) {
        return ProviderType.Alipay;
      }
      
      if (headerText.includes('微信') || headerText.includes('wechat')) {
        return ProviderType.Wechat;
      }
    }
    
    return null;
  }
} 