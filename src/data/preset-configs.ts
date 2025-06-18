import { ProviderType } from '../types/provider';
import type { PresetConfig } from '../types/rule-config';

export const presetConfigs: PresetConfig[] = [
  {
    provider: ProviderType.Alipay,
    name: '支付宝基础配置',
    description: '支付宝交易记录的基础配置模板',
    config: {
      defaultMinusAccount: 'Assets:FIXME',
      defaultPlusAccount: 'Expenses:FIXME',
      defaultCurrency: 'CNY',
      rules: [
        {
          name: '余额支付方式',
          description: '使用余额支付时，资金账户为支付宝余额',
          method: '余额',
          fullMatch: true,
          methodAccount: 'Assets:Alipay',
          priority: 1
        },
        {
          name: '余额宝支付方式',
          description: '使用余额宝支付时，资金账户为支付宝余额宝',
          method: '余额宝',
          fullMatch: true,
          methodAccount: 'Assets:Alipay',
          priority: 2
        },
        {
          name: '银行卡支付方式',
          description: '使用银行卡支付时，资金账户为对应银行账户',
          method: '招商银行(9876)',
          fullMatch: true,
          methodAccount: 'Assets:Bank:CN:CMB-9876:Savings',
          priority: 3
        },
        {
          name: '餐饮午餐',
          description: '11:00-14:00的餐饮消费归类为午餐',
          category: '餐饮美食',
          time: '11:00-14:00',
          targetAccount: 'Expenses:Food:Lunch',
          priority: 4
        },
        {
          name: '餐饮晚餐',
          description: '16:00-22:00的餐饮消费归类为晚餐',
          category: '餐饮美食',
          time: '16:00-22:00',
          targetAccount: 'Expenses:Food:Dinner',
          priority: 5
        },
        {
          name: '日用百货',
          description: '日用百货消费归类为杂货',
          category: '日用百货',
          targetAccount: 'Expenses:Groceries',
          priority: 6
        },
        {
          name: '苏宁购物',
          description: '苏宁购物归类为电子产品',
          peer: '苏宁',
          targetAccount: 'Expenses:Electronics',
          priority: 7
        },
        {
          name: '相互宝保险',
          description: '相互宝费用归类为保险',
          item: '相互宝',
          targetAccount: 'Expenses:Insurance',
          priority: 8
        },
        {
          name: '收入转账',
          description: '其他转账收款归类为收入',
          type: '收入',
          targetAccount: 'Income:FIXME',
          methodAccount: 'Assets:Alipay',
          priority: 9
        },
        {
          name: '收款码收入',
          description: '收款码收款归类为支付宝收款码收入',
          type: '收入',
          item: '商品',
          targetAccount: 'Income:Alipay:ShouKuanMa',
          methodAccount: 'Assets:Alipay',
          priority: 10
        }
      ]
    }
  },
  {
    provider: ProviderType.Wechat,
    name: '微信支付基础配置',
    description: '微信支付交易记录的基础配置模板',
    config: {
      defaultMinusAccount: 'Assets:FIXME',
      defaultPlusAccount: 'Expenses:FIXME',
      defaultCommissionAccount: 'Expenses:Commission:FIXME',
      defaultCurrency: 'CNY',
      rules: [
        {
          name: '零钱支付方式',
          description: '使用零钱支付时，资金账户为零钱',
          method: '零钱',
          fullMatch: true,
          methodAccount: 'Assets:Digital:Wechat:Cash',
          priority: 1
        },
        {
          name: '零钱通支付方式',
          description: '使用零钱通支付时，资金账户为零钱通',
          method: '零钱通',
          fullMatch: true,
          methodAccount: 'Assets:Digital:Wechat:MiniFund',
          priority: 2
        },
        {
          name: '微信红包收入',
          description: '微信红包收入归类为红包收入',
          type: '收入',
          method: '/',
          item: '/',
          targetAccount: 'Income:Wechat:RedPacket',
          priority: 3
        },
        {
          name: '转入零钱通',
          description: '转入零钱通操作',
          txType: '转入零钱通',
          peer: '/',
          item: '/',
          targetAccount: 'Assets:Digital:Wechat:MiniFund',
          priority: 4
        },
        {
          name: '零钱提现',
          description: '零钱提现操作',
          txType: '零钱提现',
          targetAccount: 'Assets:Digital:Wechat:Cash',
          commissionAccount: 'Expenses:Wechat:Commission',
          priority: 5
        },
        {
          name: '零钱充值',
          description: '零钱充值操作',
          txType: '零钱充值',
          targetAccount: 'Assets:Digital:Wechat:Cash',
          priority: 6
        },
        {
          name: '餐饮午餐',
          description: '11:00-15:00的餐饮消费归类为午餐',
          peer: '云膳过桥米线,餐厅',
          sep: ',',
          time: '11:00-15:00',
          targetAccount: 'Expenses:Food:Meal:Lunch',
          priority: 7
        },
        {
          name: '餐饮晚餐',
          description: '16:30-21:30的餐饮消费归类为晚餐',
          peer: '云膳过桥米线,餐厅',
          sep: ',',
          time: '16:30-21:30',
          targetAccount: 'Expenses:Food:Meal:Dinner',
          priority: 8
        },
        {
          name: '房东租金',
          description: '房东相关支出归类为房租',
          peer: '房东',
          type: '支出',
          targetAccount: 'Expenses:Housing:Rent',
          priority: 9
        },
        {
          name: '用户收入',
          description: '用户相关收入归类为服务收入',
          peer: '用户',
          type: '收入',
          targetAccount: 'Income:Service',
          priority: 10
        }
      ]
    }
  }
];

// 获取指定Provider的预设配置
export const getPresetConfig = (provider: ProviderType): PresetConfig | undefined => {
  return presetConfigs.find(config => config.provider === provider);
};

// 获取所有Provider的预设配置
export const getPresetConfigs = (): PresetConfig[] => {
  return presetConfigs;
}; 