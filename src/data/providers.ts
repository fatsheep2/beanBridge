import { ProviderType } from '../types/provider';

export interface ProviderInfo {
  type: ProviderType;
  name: string;
  formats: string[];
  description: string;
  category: string;
  color: string;
  icon: string;
  fieldMappings?: FieldMapping[];
}

export interface FieldMapping {
  originalField: string;
  mappedField: string;
  description: string;
  examples?: string[];
}

// 获取正确的图标路径
function getIconPath(filename: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}assets/icons/${filename}`;
}

export const providers: ProviderInfo[] = [
  {
    type: ProviderType.Alipay,
    name: '支付宝',
    formats: ['CSV', 'Excel'],
    description: '支付宝交易记录解析器',
    category: 'payment',
    color: '#1677FF',
    icon: getIconPath('alipay.png'),
    fieldMappings: [
      { originalField: '记录时间', mappedField: 'payTime', description: '交易时间' },
      { originalField: '收支类型', mappedField: 'type', description: '收入/支出类型' },
      { originalField: '对方', mappedField: 'peer', description: '交易对方/商家' },
      { originalField: '备注', mappedField: 'item', description: '商品说明/备注' },
      { originalField: '收/付款方式', mappedField: 'method', description: '支付方式' },
      { originalField: '金额', mappedField: 'money', description: '交易金额' },
      { originalField: '状态', mappedField: 'status', description: '交易状态' },
      { originalField: '分类', mappedField: 'category', description: '交易分类' },
      { originalField: '交易订单号', mappedField: 'orderID', description: '支付宝订单号' },
      { originalField: '商家订单号', mappedField: 'merchantOrderID', description: '商家订单号' }
    ]
  },
  {
    type: ProviderType.Wechat,
    name: '微信支付',
    formats: ['CSV', 'Excel'],
    description: '微信支付交易记录解析器',
    category: 'payment',
    color: '#07C160',
    icon: getIconPath('weixin.png'),
    fieldMappings: [
      { originalField: '时间', mappedField: 'payTime', description: '交易时间' },
      { originalField: '收/支', mappedField: 'type', description: '收入/支出类型' },
      { originalField: '对方', mappedField: 'peer', description: '交易对方/商家' },
      { originalField: '商品', mappedField: 'item', description: '商品说明' },
      { originalField: '收/付款方式', mappedField: 'method', description: '支付方式' },
      { originalField: '金额', mappedField: 'money', description: '交易金额' },
      { originalField: '状态', mappedField: 'status', description: '交易状态' },
      { originalField: '分类', mappedField: 'category', description: '交易分类' },
      { originalField: '交易单号', mappedField: 'orderID', description: '微信交易单号' }
    ]
  },
  {
    type: ProviderType.Huobi,
    name: '火币',
    formats: ['CSV'],
    description: '火币交易记录解析器',
    category: 'crypto',
    color: '#F6851B',
    icon: getIconPath('火币.png'),
    fieldMappings: [
      { originalField: '时间', mappedField: 'payTime', description: '交易时间' },
      { originalField: '类型', mappedField: 'type', description: '交易类型(买入/卖出)' },
      { originalField: '币种', mappedField: 'currency', description: '交易币种' },
      { originalField: '数量', mappedField: 'amount', description: '交易数量' },
      { originalField: '价格', mappedField: 'price', description: '交易价格' },
      { originalField: '手续费', mappedField: 'commission', description: '交易手续费' },
      { originalField: '总额', mappedField: 'total', description: '交易总额' },
      { originalField: '状态', mappedField: 'status', description: '交易状态' },
      { originalField: '订单号', mappedField: 'orderID', description: '火币订单号' }
    ]
  },
  {
    type: ProviderType.Htsec,
    name: '华泰证券',
    formats: ['CSV', 'Excel'],
    description: '华泰证券交易记录解析器',
    category: 'securities',
    color: '#1E40AF',
    icon: getIconPath('海通证券.png'),
    fieldMappings: [
      { originalField: '交易日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '交易时间', mappedField: 'time', description: '交易时间' },
      { originalField: '证券代码', mappedField: 'symbol', description: '证券代码' },
      { originalField: '证券名称', mappedField: 'item', description: '证券名称' },
      { originalField: '交易类型', mappedField: 'type', description: '买入/卖出' },
      { originalField: '成交数量', mappedField: 'amount', description: '成交数量' },
      { originalField: '成交价格', mappedField: 'price', description: '成交价格' },
      { originalField: '成交金额', mappedField: 'money', description: '成交金额' },
      { originalField: '手续费', mappedField: 'commission', description: '交易手续费' },
      { originalField: '印花税', mappedField: 'stampTax', description: '印花税' },
      { originalField: '过户费', mappedField: 'transferFee', description: '过户费' },
      { originalField: '委托编号', mappedField: 'orderID', description: '委托编号' }
    ]
  },
  {
    type: ProviderType.Icbc,
    name: '工商银行',
    formats: ['CSV', 'Excel'],
    description: '工商银行交易记录解析器',
    category: 'bank',
    color: '#C7000B',
    icon: getIconPath('工商银行.png'),
    fieldMappings: [
      { originalField: '日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '时间', mappedField: 'time', description: '交易时间' },
      { originalField: '金额', mappedField: 'money', description: '交易金额' },
      { originalField: '类型', mappedField: 'type', description: '业务类型' },
      { originalField: '摘要', mappedField: 'item', description: '交易摘要' },
      { originalField: '对方户名', mappedField: 'peer', description: '交易对方户名' },
      { originalField: '对方账号', mappedField: 'peerAccount', description: '交易对方账号' },
      { originalField: '余额', mappedField: 'balance', description: '账户余额' },
      { originalField: '流水号', mappedField: 'orderID', description: '交易流水号' }
    ]
  },
  {
    type: ProviderType.Td,
    name: '多伦多道明银行',
    formats: ['CSV', 'PDF'],
    description: '多伦多道明银行交易记录解析器',
    category: 'bank',
    color: '#00A3E0',
    icon: getIconPath('信用卡银行卡.png'),
    fieldMappings: [
      { originalField: 'Date', mappedField: 'payTime', description: '交易日期' },
      { originalField: 'Description', mappedField: 'item', description: '交易描述' },
      { originalField: 'Amount', mappedField: 'money', description: '交易金额' },
      { originalField: 'Type', mappedField: 'type', description: '交易类型' },
      { originalField: 'Account', mappedField: 'account', description: '账户信息' },
      { originalField: 'Reference', mappedField: 'orderID', description: '交易参考号' }
    ]
  },
  {
    type: ProviderType.Bmo,
    name: '蒙特利尔银行',
    formats: ['CSV', 'PDF'],
    description: '蒙特利尔银行交易记录解析器',
    category: 'bank',
    color: '#0074D9',
    icon: getIconPath('蒙特利尔银行.png'),
    fieldMappings: [
      { originalField: 'Date', mappedField: 'payTime', description: '交易日期' },
      { originalField: 'Description', mappedField: 'item', description: '交易描述' },
      { originalField: 'Amount', mappedField: 'money', description: '交易金额' },
      { originalField: 'Type', mappedField: 'type', description: '交易类型' },
      { originalField: 'Account', mappedField: 'account', description: '账户信息' },
      { originalField: 'Reference', mappedField: 'orderID', description: '交易参考号' }
    ]
  },
  {
    type: ProviderType.Jd,
    name: '京东金融',
    formats: ['CSV', 'Excel'],
    description: '京东金融交易记录解析器',
    category: 'payment',
    color: '#E1251B',
    icon: getIconPath('京东.png'),
    fieldMappings: [
      { originalField: '交易时间', mappedField: 'payTime', description: '交易时间' },
      { originalField: '商户名称', mappedField: 'peer', description: '商家名称' },
      { originalField: '交易说明', mappedField: 'item', description: '商品说明' },
      { originalField: '交易金额', mappedField: 'money', description: '交易金额' },
      { originalField: '收/付款方式', mappedField: 'method', description: '支付方式' },
      { originalField: '交易状态', mappedField: 'status', description: '交易状态' },
      { originalField: '收/支', mappedField: 'type', description: '收入/支出类型' },
      { originalField: '交易分类', mappedField: 'category', description: '交易分类' },
      { originalField: '交易订单号', mappedField: 'orderID', description: '京东订单号' },
      { originalField: '商家订单号', mappedField: 'merchantOrderID', description: '商家订单号' }
    ]
  },
  {
    type: ProviderType.Citic,
    name: '中信银行',
    formats: ['CSV', 'Excel'],
    description: '中信银行交易记录解析器',
    category: 'bank',
    color: '#1E40AF',
    icon: getIconPath('中信银行.png'),
    fieldMappings: [
      { originalField: '交易日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '交易时间', mappedField: 'time', description: '交易时间' },
      { originalField: '交易金额', mappedField: 'money', description: '交易金额' },
      { originalField: '交易类型', mappedField: 'type', description: '业务类型' },
      { originalField: '交易摘要', mappedField: 'item', description: '交易摘要' },
      { originalField: '对方户名', mappedField: 'peer', description: '交易对方户名' },
      { originalField: '对方账号', mappedField: 'peerAccount', description: '交易对方账号' },
      { originalField: '余额', mappedField: 'balance', description: '账户余额' },
      { originalField: '流水号', mappedField: 'orderID', description: '交易流水号' }
    ]
  },
  {
    type: ProviderType.HsbcHK,
    name: '汇丰香港',
    formats: ['CSV', 'Excel'],
    description: '汇丰香港交易记录解析器',
    category: 'bank',
    color: '#DB0011',
    icon: getIconPath('汇丰银行.png'),
    fieldMappings: [
      { originalField: '交易日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '交易时间', mappedField: 'time', description: '交易时间' },
      { originalField: '交易金额', mappedField: 'money', description: '交易金额' },
      { originalField: '交易类型', mappedField: 'type', description: '业务类型' },
      { originalField: '交易描述', mappedField: 'item', description: '交易描述' },
      { originalField: '对方户名', mappedField: 'peer', description: '交易对方户名' },
      { originalField: '对方账号', mappedField: 'peerAccount', description: '交易对方账号' },
      { originalField: '余额', mappedField: 'balance', description: '账户余额' },
      { originalField: '参考号', mappedField: 'orderID', description: '交易参考号' }
    ]
  },
  {
    type: ProviderType.MT,
    name: '美团',
    formats: ['CSV', 'Excel'],
    description: '美团交易记录解析器',
    category: 'payment',
    color: '#FFC300',
    icon: getIconPath('美团.png'),
    fieldMappings: [
      { originalField: '交易创建时间', mappedField: 'payTime', description: '交易创建时间' },
      { originalField: '交易成功时间', mappedField: 'successTime', description: '交易成功时间' },
      { originalField: '交易类型', mappedField: 'type', description: '交易类型' },
      { originalField: '订单标题', mappedField: 'item', description: '订单标题' },
      { originalField: '收/支', mappedField: 'direction', description: '收入/支出' },
      { originalField: '支付方式', mappedField: 'method', description: '支付方式' },
      { originalField: '订单金额', mappedField: 'money', description: '订单金额' },
      { originalField: '实付金额', mappedField: 'actualMoney', description: '实付金额' },
      { originalField: '交易单号', mappedField: 'orderID', description: '交易单号' },
      { originalField: '商家单号', mappedField: 'merchantOrderID', description: '商家单号' }
    ]
  },
  {
    type: ProviderType.Hxsec,
    name: '华兴证券',
    formats: ['CSV', 'Excel'],
    description: '华兴证券交易记录解析器',
    category: 'securities',
    color: '#1E40AF',
    icon: getIconPath('华兴证券.png'),
    fieldMappings: [
      { originalField: '交易日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '交易时间', mappedField: 'time', description: '交易时间' },
      { originalField: '证券代码', mappedField: 'symbol', description: '证券代码' },
      { originalField: '证券名称', mappedField: 'item', description: '证券名称' },
      { originalField: '交易类型', mappedField: 'type', description: '买入/卖出' },
      { originalField: '成交数量', mappedField: 'amount', description: '成交数量' },
      { originalField: '成交价格', mappedField: 'price', description: '成交价格' },
      { originalField: '成交金额', mappedField: 'money', description: '成交金额' },
      { originalField: '手续费', mappedField: 'commission', description: '交易手续费' },
      { originalField: '印花税', mappedField: 'stampTax', description: '印花税' },
      { originalField: '过户费', mappedField: 'transferFee', description: '过户费' },
      { originalField: '委托编号', mappedField: 'orderID', description: '委托编号' }
    ]
  },
  {
    type: ProviderType.CCB,
    name: '建设银行',
    formats: ['CSV', 'Excel'],
    description: '建设银行交易记录解析器',
    category: 'bank',
    color: '#1E40AF',
    icon: getIconPath('建设银行.png'),
    fieldMappings: [
      { originalField: '交易日期', mappedField: 'payTime', description: '交易日期' },
      { originalField: '交易时间', mappedField: 'time', description: '交易时间' },
      { originalField: '交易金额', mappedField: 'money', description: '交易金额' },
      { originalField: '交易类型', mappedField: 'type', description: '业务类型' },
      { originalField: '交易摘要', mappedField: 'item', description: '交易摘要' },
      { originalField: '对方户名', mappedField: 'peer', description: '交易对方户名' },
      { originalField: '对方账号', mappedField: 'peerAccount', description: '交易对方账号' },
      { originalField: '余额', mappedField: 'balance', description: '账户余额' },
      { originalField: '流水号', mappedField: 'orderID', description: '交易流水号' }
    ]
  },
  {
    type: ProviderType.Ethereum,
    name: '以太坊(聚合链)',
    formats: ['API'],
    description: '以太坊及其EVM兼容链账单解析器，支持ETH/BSC/Polygon等',
    category: 'crypto',
    color: '#627EEA',
    icon: getIconPath('ethereum.png'),
    fieldMappings: [
      { originalField: '交易哈希', mappedField: 'transactionHash', description: '交易哈希' },
      { originalField: '发送地址', mappedField: 'fromAddress', description: '发送方地址' },
      { originalField: '接收地址', mappedField: 'toAddress', description: '接收方地址' },
      { originalField: '代币', mappedField: 'token', description: '代币符号' },
      { originalField: '代币地址', mappedField: 'tokenAddress', description: '代币合约地址' },
      { originalField: '交易类型', mappedField: 'transactionType', description: '交易类别' },
      { originalField: '矿工费', mappedField: 'gasFee', description: '矿工费金额' },
      { originalField: '矿工费代币', mappedField: 'gasToken', description: '矿工费代币' },
      { originalField: '区块号', mappedField: 'blockNumber', description: '区块号' },
      { originalField: '时间戳', mappedField: 'payTime', description: '交易时间' }
    ]
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
  return provider?.icon || getIconPath('default.svg');
};

export const getProviderDescription = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.description || '通用交易记录解析器';
};

export const getProviderCategory = (type: ProviderType): string => {
  const provider = getProviderByType(type);
  return provider?.category || 'other';
};

export const getProviderFieldMappings = (type: ProviderType): FieldMapping[] => {
  const provider = getProviderByType(type);
  return provider?.fieldMappings || [];
}; 