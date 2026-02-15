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

  // 区块链相关字段
  chain?: string;                    // 区块链网络 (ETH, BSC, Polygon等)
  token?: string;                    // 代币符号 (USDT, ETH, BTC等)
  tokenAddress?: string;             // 代币合约地址
  tokenDecimals?: number;            // 代币小数位数
  transactionHash?: string;          // 交易哈希
  transactionType?: CryptoTransactionType; // 交易类型
  gasFee?: number;                   // 矿工费金额
  gasToken?: string;                 // 矿工费代币
  gasPrice?: number;                 // 燃料价格
  gasUsed?: number;                  // 使用的燃料量
  blockNumber?: number;              // 区块号
  fromAddress?: string;              // 发送地址
  toAddress?: string;                // 接收地址
  isGasTransaction?: boolean;        // 是否为矿工费交易
  relatedTransactionHash?: string;   // 关联的交易哈希（用于矿工费关联）
}

export enum OrderType {
  Normal = "Normal",
  HuobiTrade = "HuobiTrade",
  SecuritiesTrade = "SecuritiesTrade",
  ChinaSecuritiesBankTransferToBroker = "ChinaSecuritiesBankTransferToBroker",
  ChinaSecuritiesBrokerTransferToBank = "ChinaSecuritiesBrokerTransferToBank",
  ChinaSecuritiesInterestCapitalization = "ChinaSecuritiesInterestCapitalization",
  ChinaSecuritiesEtfMerge = "ChinaSecuritiesEtfMerge",
  ChinaSecuritiesDividend = "ChinaSecuritiesDividend",
  Crypto = "Crypto", // 加密货币交易（需要高精度）
  // 新增区块链交易类型
  CryptoTransfer = "CryptoTransfer",
  CryptoSwap = "CryptoSwap",
  CryptoStake = "CryptoStake",
  CryptoUnstake = "CryptoUnstake",
  CryptoReward = "CryptoReward",
  CryptoGas = "CryptoGas"
}

// 加密货币交易类型
export enum CryptoTransactionType {
  Transfer = "transfer",           // 转账
  Swap = "swap",                   // 代币兑换
  Stake = "stake",                 // 质押
  Unstake = "unstake",             // 解除质押
  Reward = "reward",               // 奖励
  Gas = "gas",                     // 矿工费
  ContractInteraction = "contract" // 合约交互
}

// 支持的区块链网络
export enum BlockchainNetwork {
  Ethereum = "ETH",
  BinanceSmartChain = "BSC",
  Polygon = "POLYGON",
  Arbitrum = "ARBITRUM",
  Optimism = "OPTIMISM",
  Avalanche = "AVALANCHE",
  Solana = "SOLANA",
  Bitcoin = "BTC"
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

// 区块链数据提供者接口
export interface DataProviderInterface {
  fetchData(params: FetchParams): Promise<IR>;
  getSupportedChains(): string[];
  getSupportedTokens(chain: string): string[];
  getProviderName(): string;
  getStatistics(): Statistics;
}

// 数据获取参数
export interface FetchParams {
  chain: string;
  address: string;
  startDate?: Date;
  endDate?: Date;
  tokens?: string[];
  transactionTypes?: CryptoTransactionType[];
  apiKey?: string;
  rpcUrl?: string;
}

// 解析器配置
export interface ProviderConfig {
  rules: ConfigRule[];
  accounts: string[];
  defaultCurrency: string;
  provider: string;
  defaultMinusAccount?: string;
  defaultPlusAccount?: string;
  defaultCashAccount?: string;
  defaultCommissionAccount?: string;
  defaultPositionAccount?: string;
  defaultPnlAccount?: string;
}

export interface ConfigRule {
  pattern: string;
  account: string;
  methodAccount?: string;
  tags?: string[];
  payee?: string;
  category?: string;

  // 新增字段用于精确匹配
  peer?: string;
  item?: string;
  type?: string;
  method?: string;
  txType?: string;
  sep?: string;
  fullMatch?: boolean;
  priority?: number;
  time?: string;

  // 区块链相关字段
  chain?: string;                    // 区块链网络
  token?: string;                    // 代币符号
  transactionType?: string;          // 交易类型
  gasToken?: string;                 // 矿工费代币
  minGasFee?: number;                // 最小矿工费
  maxGasFee?: number;                // 最大矿工费
  fromAddress?: string;              // 发送地址
  toAddress?: string;                // 接收地址
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
  CCB = "ccb",
  OKLink = "oklink",
  // 新增区块链类型
  Ethereum = "ethereum",
  BinanceSmartChain = "bsc",
  Polygon = "polygon",
  Arbitrum = "arbitrum",
  Optimism = "optimism",
  Avalanche = "avalanche",
  Solana = "solana",
  Bitcoin = "bitcoin"
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
  // 规则匹配统计
  ruleStats?: Array<{ rule: ConfigRule; count: number; examples: string[] }>;
  totalMatched?: number;
  totalRules?: number;
  matchedRules?: number;
  // 区块链相关统计
  totalGasFees?: number;
  totalTransactions?: number;
  supportedChains?: string[];
  supportedTokens?: string[];
} 