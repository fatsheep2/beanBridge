export interface DataSource {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: 'payment' | 'bank' | 'crypto' | 'securities';
  supportedFormats: string[];
  defaultMinusAccount?: string;
  defaultPlusAccount?: string;
  defaultCommissionAccount?: string;
}

export interface RuleCondition {
  field: string;
  value: string | string[];
  operator: 'equals' | 'contains' | 'regex' | 'time' | 'fullMatch';
  sep?: string; // 分隔符，用于多个值
  time?: string; // 时间范围，如 "8:00-12:00"
}

export interface RuleAction {
  targetAccount?: string;
  methodAccount?: string;
  commissionAccount?: string;
  ignore?: boolean;
  fullMatch?: boolean;
}

export interface Rule {
  conditions: RuleCondition[];
  actions: RuleAction;
  priority?: number;
}

export interface DataSourceConfig {
  id: string;
  name: string;
  defaultMinusAccount: string;
  defaultPlusAccount: string;
  defaultCommissionAccount: string;
  defaultCurrency: string;
  rules: Rule[];
  fieldMapping: Record<string, string>; // 字段映射
}

export const DATA_SOURCES: DataSource[] = [
  // 支付平台
  { 
    id: 'alipay', 
    name: '支付宝', 
    icon: '/src/components/icons/alipay.png', 
    color: '#00a1e9',
    description: '支付宝账单导入',
    category: 'payment',
    supportedFormats: ['csv', 'xlsx'],
    defaultMinusAccount: 'Expenses:Life:Food',
    defaultPlusAccount: 'Assets:Alipay',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'wechat', 
    name: '微信支付', 
    icon: '/src/components/icons/weixin.png', 
    color: '#07c160',
    description: '微信支付账单导入',
    category: 'payment',
    supportedFormats: ['csv', 'xlsx'],
    defaultMinusAccount: 'Expenses:Life:Food',
    defaultPlusAccount: 'Assets:WeChat',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'jd', 
    name: '京东', 
    icon: '/src/components/icons/京东.png', 
    color: '#e1251b',
    description: '京东账单导入',
    category: 'payment',
    supportedFormats: ['csv', 'xlsx'],
    defaultMinusAccount: 'Expenses:Shopping',
    defaultPlusAccount: 'Assets:JD',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  
  // 银行
  { 
    id: 'icbc', 
    name: '中国工商银行', 
    icon: '/src/components/icons/工商银行.png', 
    color: '#c7000b',
    description: '工商银行对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:ICBC',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'cmb', 
    name: '招商银行', 
    icon: '/src/components/icons/招商银行.png', 
    color: '#a50044',
    description: '招商银行对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:CMB',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'ccb', 
    name: '建设银行', 
    icon: '/src/components/icons/建设银行.png', 
    color: '#0039a6',
    description: '建设银行对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:CCB',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'citic', 
    name: '中信银行信用卡', 
    icon: '/src/components/icons/中信银行.png', 
    color: '#e60012',
    description: '中信银行信用卡对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Liabilities:CreditCard:CITIC',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'hsbchk', 
    name: '香港汇丰银行', 
    icon: '/src/components/icons/汇丰银行.png', 
    color: '#db0011',
    description: '香港汇丰银行对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:HSBC',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'td', 
    name: '多伦多道明银行', 
    icon: '/src/components/icons/信用卡银行卡.png', 
    color: '#0066cc',
    description: 'Toronto-Dominion Bank对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:TD',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  { 
    id: 'bmo', 
    name: '蒙特利尔银行', 
    icon: '/src/components/icons/蒙特利尔银行.png', 
    color: '#0066cc',
    description: 'Bank of Montreal对账单导入',
    category: 'bank',
    supportedFormats: ['csv', 'xlsx', 'txt'],
    defaultMinusAccount: 'Expenses:FIXME',
    defaultPlusAccount: 'Assets:Bank:BMO',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  
  // 证券
  { 
    id: 'htsec', 
    name: '海通证券', 
    icon: '/src/components/icons/海通证券.png', 
    color: '#1e3a8a',
    description: '海通证券交易记录导入',
    category: 'securities',
    supportedFormats: ['csv', 'xlsx'],
    defaultMinusAccount: 'Expenses:Investment',
    defaultPlusAccount: 'Assets:Securities:HT',
    defaultCommissionAccount: 'Expenses:Commission'
  },
  
  // 加密货币
  { 
    id: 'huobi', 
    name: '火币-币币交易', 
    icon: '/src/components/icons/火币.png', 
    color: '#f7931a',
    description: '火币币币交易记录导入',
    category: 'crypto',
    supportedFormats: ['csv', 'xlsx'],
    defaultMinusAccount: 'Expenses:Crypto',
    defaultPlusAccount: 'Assets:Crypto:Huobi',
    defaultCommissionAccount: 'Expenses:Commission'
  }
]; 