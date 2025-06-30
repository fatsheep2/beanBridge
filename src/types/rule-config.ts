import { ProviderType } from './provider';

// API配置接口
export interface ApiConfig {
  ethereum?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  bsc?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  polygon?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  arbitrum?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  optimism?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  avalanche?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  solana?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  bitcoin?: {
    apiKey?: string;
    rpcUrl?: string;
  };
  ethscan?: {
    apiKey?: string;
  };
  tronscan?: {
    apiKey?: string;
  };
}

// 规则配置接口
export interface RuleConfig {
  id: string;
  provider: ProviderType;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // 全局配置
  defaultMinusAccount: string;
  defaultPlusAccount: string;
  defaultCurrency: string;
  defaultCashAccount?: string;
  defaultCommissionAccount?: string;
  defaultPositionAccount?: string;
  defaultPnlAccount?: string;
  defaultThirdPartyCustodyAccount?: string;

  // API配置
  apiConfig?: ApiConfig;

  // 规则列表
  rules: Rule[];
}

// 单个规则接口
export interface Rule {
  id?: string;
  name: string;
  description?: string;

  // 匹配条件
  peer?: string;
  item?: string;
  type?: string;
  method?: string;
  category?: string;
  txType?: string;
  time?: string;
  minPrice?: number;
  maxPrice?: number;

  // 匹配选项
  fullMatch?: boolean;
  sep?: string;
  ignore?: boolean;

  // 账户配置
  targetAccount?: string;
  methodAccount?: string;
  cashAccount?: string;
  positionAccount?: string;
  commissionAccount?: string;
  pnlAccount?: string;

  // 标签
  tags?: string[];

  // 排序权重
  priority: number;
}

// 规则模板
export interface RuleTemplate {
  name: string;
  description: string;
  rules: Omit<Rule, 'id' | 'priority'>[];
}

// 历史记录
export interface ConfigHistory {
  id: string;
  provider: ProviderType;
  name: string;
  config: RuleConfig;
  createdAt: string;
  appliedAt?: string;
}

// 预设配置
export interface PresetConfig {
  provider: ProviderType;
  name: string;
  description: string;
  config: Omit<RuleConfig, 'id' | 'provider' | 'name' | 'createdAt' | 'updatedAt'> & {
    rules: Omit<Rule, 'id'>[];
  };
} 