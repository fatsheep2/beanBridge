import type {
    DataProviderInterface,
    FetchParams,
    IR,
    Order,
    Statistics,
    CryptoTransactionType
} from '../../types/provider';
import { BlockchainNetwork, Type, Unit, Account } from '../../types/provider';
import { ruleConfigService } from '../../services/rule-config-service';
import { ProviderType } from '../../types/provider';

export abstract class BaseCryptoProvider implements DataProviderInterface {
    protected statistics: Statistics = {
        parsedItems: 0,
        start: new Date(),
        end: new Date(),
        totalInRecords: 0,
        totalInMoney: 0,
        totalOutRecords: 0,
        totalOutMoney: 0,
        totalGasFees: 0,
        totalTransactions: 0,
        supportedChains: [],
        supportedTokens: []
    };

    abstract getProviderName(): string;
    abstract getSupportedChains(): string[];
    abstract getSupportedTokens(chain: string): string[];
    abstract fetchData(params: FetchParams): Promise<IR>;

    // 获取提供者类型，用于加载规则配置
    protected getProviderType(): ProviderType {
        // 子类可以重写这个方法
        return ProviderType.Ethereum;
    }

    // 获取规则配置
    protected getRuleConfig() {
        try {
            return ruleConfigService.getConfig(this.getProviderType());
        } catch (error) {
            console.warn(`Failed to load rule config for ${this.getProviderName()} provider:`, error);
            return null;
        }
    }

    getStatistics(): Statistics {
        return { ...this.statistics };
    }

    protected resetStatistics(): void {
        this.statistics = {
            parsedItems: 0,
            start: new Date(),
            end: new Date(),
            totalInRecords: 0,
            totalInMoney: 0,
            totalOutRecords: 0,
            totalOutMoney: 0,
            totalGasFees: 0,
            totalTransactions: 0,
            supportedChains: this.getSupportedChains(),
            supportedTokens: []
        };
    }

    // 更新统计信息
    protected updateStatistics(order: Order): void {
        if (!this.statistics) {
            this.statistics = {
                parsedItems: 0,
                start: order.payTime,
                end: order.payTime,
                totalInRecords: 0,
                totalInMoney: 0,
                totalOutRecords: 0,
                totalOutMoney: 0,
                totalGasFees: 0,
                totalTransactions: 0,
                supportedChains: [],
                supportedTokens: []
            };
        }

        this.statistics.parsedItems++;

        // 更新时间范围
        if (order.payTime < this.statistics.start) {
            this.statistics.start = order.payTime;
        }
        if (order.payTime > this.statistics.end) {
            this.statistics.end = order.payTime;
        }

        if (order.type === Type.Recv) {
            this.statistics.totalInRecords++;
            this.statistics.totalInMoney += order.money;
        } else if (order.type === Type.Send) {
            this.statistics.totalOutRecords++;
            this.statistics.totalOutMoney += order.money;
        }

        // 更新区块链相关统计
        if (order.gasFee) {
            this.statistics.totalGasFees = (this.statistics.totalGasFees || 0) + order.gasFee;
        }
        this.statistics.totalTransactions = (this.statistics.totalTransactions || 0) + 1;

        // 更新支持的代币列表
        if (!this.statistics.supportedTokens) this.statistics.supportedTokens = [];
        if (order.token && !this.statistics.supportedTokens.includes(order.token)) {
            this.statistics.supportedTokens.push(order.token);
        }
    }

    // 关联矿工费交易与主交易
    protected associateGasTransactions(orders: Order[]): Order[] {
        const gasTransactions = orders.filter(order => order.isGasTransaction);
        const mainTransactions = orders.filter(order => !order.isGasTransaction);

        // 按时间窗口关联（5分钟内）
        const timeWindow = 5 * 60 * 1000; // 5分钟

        gasTransactions.forEach(gasTx => {
            const relatedTx = mainTransactions.find(mainTx => {
                if (gasTx.relatedTransactionHash && mainTx.transactionHash === gasTx.relatedTransactionHash) {
                    return true;
                }

                // 时间窗口匹配
                const timeDiff = Math.abs(gasTx.payTime.getTime() - mainTx.payTime.getTime());
                const sameAddress = gasTx.fromAddress === mainTx.fromAddress;
                const sameChain = gasTx.chain === mainTx.chain;

                return timeDiff <= timeWindow && sameAddress && sameChain;
            });

            if (relatedTx) {
                gasTx.relatedTransactionHash = relatedTx.transactionHash;
                relatedTx.gasFee = gasTx.money;
                relatedTx.gasToken = gasTx.token;
            }
        });

        return orders;
    }

    // 创建标准的Order对象
    protected createOrder(params: {
        orderType: string;
        peer: string;
        item: string;
        category: string;
        money: number;
        note: string;
        payTime: Date;
        type: Type;
        typeOriginal: string;
        method: string;
        currency: string;
        chain?: string;
        token?: string;
        tokenAddress?: string;
        tokenDecimals?: number;
        transactionHash?: string;
        transactionType?: CryptoTransactionType;
        gasFee?: number;
        gasToken?: string;
        gasPrice?: number;
        gasUsed?: number;
        blockNumber?: number;
        fromAddress?: string;
        toAddress?: string;
        isGasTransaction?: boolean;
        relatedTransactionHash?: string;
    }): Order {
        // 从规则配置中获取账户配置
        const ruleConfig = this.getRuleConfig();
        const defaultMinusAccount = ruleConfig?.defaultMinusAccount || 'Assets:FIXME';
        const defaultPlusAccount = ruleConfig?.defaultPlusAccount || 'Expenses:FIXME';
        const defaultCommissionAccount = ruleConfig?.defaultCommissionAccount || 'Expenses:FIXME';
        const defaultPositionAccount = ruleConfig?.defaultPositionAccount || 'Assets:FIXME';

        const order: Order = {
            orderType: params.orderType as any,
            peer: params.peer,
            item: params.item,
            category: params.category,
            money: params.money,
            note: params.note,
            payTime: params.payTime,
            type: params.type,
            typeOriginal: params.typeOriginal,
            txTypeOriginal: params.typeOriginal,
            method: params.method,
            amount: params.money,
            price: params.money,
            currency: params.currency,
            commission: 0,
            units: {
                [Unit.BaseUnit]: params.currency,
                [Unit.TargetUnit]: params.currency,
                [Unit.CommissionUnit]: params.currency
            },
            extraAccounts: {
                [Account.CashAccount]: defaultMinusAccount,
                [Account.PositionAccount]: defaultPositionAccount,
                [Account.CommissionAccount]: defaultCommissionAccount,
                [Account.PnlAccount]: 'Income:FIXME',
                [Account.ThirdPartyCustodyAccount]: defaultMinusAccount,
                [Account.PlusAccount]: defaultPlusAccount,
                [Account.MinusAccount]: defaultMinusAccount
            },
            minusAccount: defaultMinusAccount,
            plusAccount: defaultPlusAccount,
            metadata: {},
            tags: [],
            chain: params.chain,
            token: params.token,
            tokenAddress: params.tokenAddress,
            tokenDecimals: params.tokenDecimals,
            transactionHash: params.transactionHash,
            transactionType: params.transactionType,
            gasFee: params.gasFee,
            gasToken: params.gasToken,
            gasPrice: params.gasPrice,
            gasUsed: params.gasUsed,
            blockNumber: params.blockNumber,
            fromAddress: params.fromAddress,
            toAddress: params.toAddress,
            isGasTransaction: params.isGasTransaction,
            relatedTransactionHash: params.relatedTransactionHash
        };

        this.updateStatistics(order);
        return order;
    }

    // 验证地址格式
    protected validateAddress(address: string, chain: string): boolean {
        switch (chain) {
            case BlockchainNetwork.Ethereum:
            case BlockchainNetwork.BinanceSmartChain:
            case BlockchainNetwork.Polygon:
            case BlockchainNetwork.Arbitrum:
            case BlockchainNetwork.Optimism:
            case BlockchainNetwork.Avalanche:
                return /^0x[a-fA-F0-9]{40}$/.test(address);
            case BlockchainNetwork.Solana:
                return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
            case BlockchainNetwork.Bitcoin:
                return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
                    /^bc1[a-z0-9]{39,59}$/.test(address);
            default:
                return true;
        }
    }

    // 格式化代币金额
    protected formatTokenAmount(amount: string | number, decimals: number = 18): number {
        const amountStr = amount.toString();
        if (decimals === 0) return Number(amountStr);

        const integerPart = amountStr.slice(0, -decimals) || '0';
        const decimalPart = amountStr.slice(-decimals).padStart(decimals, '0');

        return Number(`${integerPart}.${decimalPart}`);
    }

    // 获取代币信息
    protected async getTokenInfo(tokenAddress: string, chain: string): Promise<{
        symbol: string;
        decimals: number;
        name: string;
    } | null> {
        // 这里可以集成代币信息API，如CoinGecko、Etherscan等
        // 暂时返回默认值
        return {
            symbol: 'UNKNOWN',
            decimals: 18,
            name: 'Unknown Token'
        };
    }
} 