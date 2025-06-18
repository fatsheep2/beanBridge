// 与 double-entry-generator 兼容的解析器类型定义

export interface IR {
  orders: Order[];
}

export interface Order {
  orderType: OrderType;
  peer: string;
  item: string;
  category: string;
  merchantOrderID?: string;
  orderID?: string;
  money: number;
  note: string;
  payTime: Date;
  type: Type;
  typeOriginal: string;
  txTypeOriginal: string;
  method: string;
  amount: number;
  price: number;
  currency: string;
  commission: number;
  units: Record<Unit, string>;
  extraAccounts: Record<Account, string>;
  minusAccount: string;
  plusAccount: string;
  metadata: Record<string, string>;
  tags: string[];
}

export enum OrderType {
  Normal = "Normal",
  HuobiTrade = "HuobiTrade",
  SecuritiesTrade = "SecuritiesTrade",
  ChinaSecuritiesBankTransferToBroker = "ChinaSecuritiesBankTransferToBroker",
  ChinaSecuritiesBrokerTransferToBank = "ChinaSecuritiesBrokerTransferToBank",
  ChinaSecuritiesInterestCapitalization = "ChinaSecuritiesInterestCapitalization",
  ChinaSecuritiesEtfMerge = "ChinaSecuritiesEtfMerge",
  ChinaSecuritiesDividend = "ChinaSecuritiesDividend"
}

export enum Type {
  Send = "Send",
  Recv = "Recv",
  Unknown = "Unknown"
}

export enum Unit {
  BaseUnit = "BaseUnit",
  TargetUnit = "TargetUnit",
  CommissionUnit = "CommissionUnit"
}

export enum Account {
  CashAccount = "CashAccount",
  PositionAccount = "PositionAccount",
  CommissionAccount = "CommissionAccount",
  PnlAccount = "PnlAccount",
  ThirdPartyCustodyAccount = "ThirdPartyCustodyAccount",
  PlusAccount = "PlusAccount",
  MinusAccount = "MinusAccount"
}

// 解析器接口
export interface ProviderInterface {
  translate(file: File): Promise<IR>;
  getSupportedFormats(): string[];
  getProviderName(): string;
  getStatistics(): Statistics;
}

// 解析器配置
export interface ProviderConfig {
  rules: ConfigRule[];
  accounts: string[];
  defaultCurrency: string;
  provider: string;
}

export interface ConfigRule {
  pattern: string;
  account: string;
  methodAccount?: string;
  tags?: string[];
  payee?: string;
  category?: string;
}

// 支持的解析器类型
export enum ProviderType {
  Alipay = "alipay",
  Wechat = "wechat",
  Huobi = "huobi",
  Htsec = "htsec",
  Icbc = "icbc",
  Td = "td",
  Bmo = "bmo",
  Jd = "jd",
  Citic = "citic",
  HsbcHK = "hsbchk",
  MT = "mt",
  Hxsec = "hxsec",
}

// 文件处理结果
export interface FileData {
  headers: string[];
  rows: string[][];
  provider: ProviderType;
  filename: string;
}

// 统计信息
export interface Statistics {
  userID?: string;
  username?: string;
  parsedItems: number;
  start: Date;
  end: Date;
  totalInRecords: number;
  totalInMoney: number;
  totalOutRecords: number;
  totalOutMoney: number;
} 