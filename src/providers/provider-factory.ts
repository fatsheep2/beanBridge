import type { ProviderInterface } from '../types/provider';
import { ProviderType } from '../types/provider';
import { AlipayProvider } from './alipay-provider';
import { WechatProvider } from './wechat-provider';
import { HuobiProvider } from './huobi-provider';
import { HtsecProvider } from './htsec-provider';
import { IcbcProvider } from './icbc-provider';
import { TdProvider } from './td-provider';
import { BmoProvider } from './bmo-provider';
import { JdProvider } from './jd-provider';
import { CiticProvider } from './citic-provider';
import { HsbcHkProvider } from './hsbc-hk-provider';
import { MtProvider } from './mt-provider';
import { CCBProvider } from './ccb-provider';
// 其他 provider 文件如有实现可在此处继续导入

export class ProviderFactory {
  private static providers = new Map<ProviderType, new () => ProviderInterface>([
    [ProviderType.Alipay, AlipayProvider],
    [ProviderType.Wechat, WechatProvider],
    [ProviderType.Huobi, HuobiProvider],
    [ProviderType.Htsec, HtsecProvider],
    [ProviderType.Icbc, IcbcProvider],
    [ProviderType.Td, TdProvider],
    [ProviderType.Bmo, BmoProvider],
    [ProviderType.Jd, JdProvider],
    [ProviderType.Citic, CiticProvider],
    [ProviderType.HsbcHK, HsbcHkProvider],
    [ProviderType.MT, MtProvider],
    [ProviderType.CCB, CCBProvider],
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

    if (lowerFilename.includes('huobi') || lowerFilename.includes('火币')) {
      return ProviderType.Huobi;
    }

    if (lowerFilename.includes('htsec') || lowerFilename.includes('华泰') || lowerFilename.includes('ht')) {
      return ProviderType.Htsec;
    }

    if (lowerFilename.includes('icbc') || lowerFilename.includes('工商') || lowerFilename.includes('工行')) {
      return ProviderType.Icbc;
    }

    if (lowerFilename.includes('ccb') || lowerFilename.includes('建设') || lowerFilename.includes('建行')) {
      return ProviderType.CCB;
    }

    // 根据文件头检测
    if (headers && headers.length > 0) {
      // 新增：如果第一行包含China Construction Bank，直接识别为建设银行
      if (headers[0] && headers[0].toLowerCase().includes('china construction bank')) {
        return ProviderType.CCB;
      }
      const headerText = headers.join(' ').toLowerCase();
      if (headerText.includes('支付宝') || headerText.includes('alipay')) {
        return ProviderType.Alipay;
      }
      if (headerText.includes('微信') || headerText.includes('wechat')) {
        return ProviderType.Wechat;
      }
      if (headerText.includes('火币') || headerText.includes('huobi')) {
        return ProviderType.Huobi;
      }
      if (headerText.includes('华泰') || headerText.includes('htsec')) {
        return ProviderType.Htsec;
      }
      if (headerText.includes('工商') || headerText.includes('icbc')) {
        return ProviderType.Icbc;
      }
      if (headerText.includes('建设') || headerText.includes('ccb')) {
        return ProviderType.CCB;
      }
      if (headerText.includes('信用卡') || headerText.includes('银行卡')) {
        return ProviderType.Td;
      }
      if (headerText.includes('蒙特利尔') || headerText.includes('bmo')) {
        return ProviderType.Bmo;
      }
      if (headerText.includes('京东') || headerText.includes('jd')) {
        return ProviderType.Jd;
      }
      if (headerText.includes('中信') || headerText.includes('citic')) {
        return ProviderType.Citic;
      }
      if (headerText.includes('汇丰') || headerText.includes('hsbc')) {
        return ProviderType.HsbcHK;
      }
      if (headerText.includes('海通') || headerText.includes('htsec')) {
        return ProviderType.Htsec;
      }
      if (headerText.includes('蒙特利尔') || headerText.includes('bmo')) {
        return ProviderType.Bmo;
      }
    }
    return null;
  }
} 