import { ProviderType } from '../types/provider';

export interface ProviderInfo {
  type: ProviderType;
  name: string;
  formats: string[];
  description: string;
  category: string;
  color: string;
  icon: string;
}

export const providers: ProviderInfo[] = [
  {
    type: ProviderType.Alipay,
    name: '支付宝',
    formats: ['CSV', 'Excel'],
    description: '支付宝交易记录解析器',
    category: 'payment',
    color: '#1677FF',
    icon: '/assets/icons/alipay.png'
  },
  {
    type: ProviderType.Wechat,
    name: '微信支付',
    formats: ['CSV', 'Excel'],
    description: '微信支付交易记录解析器',
    category: 'payment',
    color: '#07C160',
    icon: '/assets/icons/weixin.png'
  },
  {
    type: ProviderType.Huobi,
    name: '火币',
    formats: ['CSV'],
    description: '火币交易记录解析器',
    category: 'crypto',
    color: '#F6851B',
    icon: '/assets/icons/火币.png'
  },
  {
    type: ProviderType.Htsec,
    name: '华泰证券',
    formats: ['CSV', 'Excel'],
    description: '华泰证券交易记录解析器',
    category: 'securities',
    color: '#1E40AF',
    icon: '/assets/icons/海通证券.png'
  },
  {
    type: ProviderType.Icbc,
    name: '工商银行',
    formats: ['CSV', 'Excel'],
    description: '工商银行交易记录解析器',
    category: 'bank',
    color: '#C7000B',
    icon: '/assets/icons/工商银行.png'
  },
  {
    type: ProviderType.Td,
    name: '多伦多道明银行',
    formats: ['CSV', 'PDF'],
    description: '多伦多道明银行交易记录解析器',
    category: 'bank',
    color: '#00A3E0',
    icon: '/assets/icons/信用卡银行卡.png'
  },
  {
    type: ProviderType.Bmo,
    name: '蒙特利尔银行',
    formats: ['CSV', 'PDF'],
    description: '蒙特利尔银行交易记录解析器',
    category: 'bank',
    color: '#0074D9',
    icon: '/assets/icons/蒙特利尔银行.png'
  },
  {
    type: ProviderType.Jd,
    name: '京东金融',
    formats: ['CSV', 'Excel'],
    description: '京东金融交易记录解析器',
    category: 'payment',
    color: '#E1251B',
    icon: '/assets/icons/京东.png'
  },
  {
    type: ProviderType.Citic,
    name: '中信银行',
    formats: ['CSV', 'Excel'],
    description: '中信银行交易记录解析器',
    category: 'bank',
    color: '#1E40AF',
    icon: '/assets/icons/中信银行.png'
  },
  {
    type: ProviderType.HsbcHK,
    name: '汇丰香港',
    formats: ['CSV', 'PDF'],
    description: '汇丰香港交易记录解析器',
    category: 'bank',
    color: '#DB0011',
    icon: '/assets/icons/汇丰银行.png'
  },
  {
    type: ProviderType.MT,
    name: '美团',
    formats: ['CSV', 'Excel'],
    description: '美团生活平台交易记录解析器',
    category: 'payment',
    color: '#059669',
    icon: '/assets/icons/美团.png'
  },
  {
    type: ProviderType.Hxsec,
    name: '华鑫证券',
    formats: ['CSV', 'Excel'],
    description: '华鑫证券交易记录解析器',
    category: 'securities',
    color: '#DC2626',
    icon: '/assets/icons/default.svg'
  }
];

export const categories = [
  { value: 'all', label: '全部' },
  { value: 'payment', label: '支付平台' },
  { value: 'bank', label: '银行' },
  { value: 'crypto', label: '加密货币' },
  { value: 'securities', label: '证券' }
];

// 工具函数
export const getProviderByType = (type: ProviderType): ProviderInfo | undefined => {
  return providers.find(provider => provider.type === type);
};

export const getProvidersByCategory = (category: string): ProviderInfo[] => {
  if (category === 'all') {
    return providers;
  }
  return providers.filter(provider => provider.category === category);
};

export const getProviderColor = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.color || '#6B7280';
};

export const getProviderIcon = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.icon || '/assets/icons/default.svg';
};

export const getProviderDescription = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.description || '通用交易记录解析器';
};

export const getProviderCategory = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.category || 'other';
}; 