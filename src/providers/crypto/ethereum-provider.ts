import { BaseCryptoProvider } from '../base/base-crypto-provider';
import type { FetchParams, IR, Order } from '../../types/provider';
import { ProviderType, Type, OrderType, BlockchainNetwork, CryptoTransactionType } from '../../types/provider';

interface EtherscanTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    blockNumber: string;
    timeStamp: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    confirmations: string;
    nonce?: string;
    blockHash?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenDecimal?: string;
    transactionIndex?: string;
    methodId?: string;
    functionName?: string;
}

interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
}

export class EthereumProvider extends BaseCryptoProvider {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.etherscan.io/v2/api';

    constructor(apiKey?: string) {
        super();
        if (apiKey) {
            this.apiKey = apiKey;
        }
    }

    getProviderName(): string {
        return 'Ethereum';
    }

    getSupportedChains(): string[] {
        return [BlockchainNetwork.Ethereum];
    }

    getSupportedTokens(chain: string): string[] {
        if (chain === BlockchainNetwork.Ethereum) {
            return ['ETH', 'USDT', 'USDC', 'DAI', 'WETH', 'UNI', 'LINK', 'AAVE'];
        }
        return [];
    }

    async fetchData(params: FetchParams): Promise<IR> {
        if (!this.validateAddress(params.address, params.chain)) {
            throw new Error('Invalid Ethereum address format');
        }

        this.resetStatistics();

        try {
            const transactions = await this.fetchTransactions(params);
            console.log(`[DEBUG] 获取到 ${transactions.length} 笔交易`);
            if (transactions.length > 0) {
                for (const tx of transactions) {
                    console.log('[DEBUG] 原始交易:', JSON.stringify(tx));
                }
            }

            const orders = this.parseTransactions(transactions, params);
            console.log(`[DEBUG] 解析出 ${orders.length} 条记录`);
            if (orders.length > 0) {
                for (const order of orders) {
                    console.log('[DEBUG] 订单:', JSON.stringify(order));
                }
            }

            // 关联矿工费交易
            const associatedOrders = this.associateGasTransactions(orders);
            console.log(`[DEBUG] 关联后共有 ${associatedOrders.length} 条记录`);

            return {
                orders: associatedOrders
            };
        } catch (error) {
            console.error('Failed to fetch Ethereum data:', error);
            throw new Error(`Failed to fetch Ethereum data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async fetchTransactions(params: FetchParams): Promise<EtherscanTransaction[]> {
        // chainid映射表
        const chainIdMap: Record<string, string> = {
            ETH: '1', // Ethereum Mainnet
            SEPOLIA: '11155111',
            BSC: '56',
            POLYGON: '137',
            ARBITRUM: '42161',
            OPTIMISM: '10',
            AVALANCHE: '43114',
            // 可根据需要继续扩展
        };
        const chainKey = (params.chain || '').toUpperCase();
        const chainId = chainIdMap[chainKey] || '1';

        // 只使用v2 API的tokentx接口，它包含了所有需要的信息
        const tokenTxs = await this.fetchTokenTransactions(params, chainId);

        return tokenTxs;
    }

    private async fetchTokenTransactions(params: FetchParams, chainId: string): Promise<EtherscanTransaction[]> {
        const url = new URL(this.baseUrl);
        url.searchParams.set('chainid', chainId);
        url.searchParams.set('module', 'account');
        url.searchParams.set('action', 'tokentx');
        url.searchParams.set('address', params.address);
        url.searchParams.set('startblock', '0');
        url.searchParams.set('endblock', '99999999');
        url.searchParams.set('sort', 'desc');

        if (this.apiKey) {
            url.searchParams.set('apikey', this.apiKey);
        }

        if (params.startDate) {
            const startTimestamp = Math.floor(params.startDate.getTime() / 1000);
            url.searchParams.set('starttime', startTimestamp.toString());
        }

        if (params.endDate) {
            const endTimestamp = Math.floor(params.endDate.getTime() / 1000);
            url.searchParams.set('endtime', endTimestamp.toString());
        }

        console.log('[DEBUG] API请求URL:', url.toString());
        console.log('[DEBUG] API Key:', this.apiKey ? '已设置' : '未设置');

        const response = await fetch(url.toString());
        console.log('[DEBUG] API响应状态:', response.status, response.statusText);

        const data: EtherscanResponse = await response.json();
        console.log('[DEBUG] API响应数据:', JSON.stringify(data, null, 2));

        if (data.status !== '1') {
            console.error('[DEBUG] API错误:', data.message);
            throw new Error(`Etherscan API error: ${data.message}`);
        }

        const filteredResult = data.result.filter(tx => {
            // v2 API可能没有isError和txreceipt_status字段，需要兼容处理
            const isError = tx.isError === '0' || tx.isError === undefined;
            const txReceiptStatus = tx.txreceipt_status === '1' || tx.txreceipt_status === undefined;
            return isError && txReceiptStatus;
        });
        console.log('[DEBUG] 过滤后交易数量:', filteredResult.length);

        return filteredResult;
    }

    private parseTransactions(transactions: EtherscanTransaction[], params: FetchParams): Order[] {
        const orders: Order[] = [];

        for (const tx of transactions) {
            try {
                // 只处理代币转账（v2 API的tokentx接口）
                const tokenOrder = this.parseTokenTransaction(tx, params);
                if (tokenOrder) {
                    orders.push(tokenOrder);
                }

                // 为支出交易生成矿工费记录
                const gasOrder = this.parseGasTransaction(tx, params);
                if (gasOrder) {
                    orders.push(gasOrder);
                }
            } catch (error) {
                console.warn(`Failed to parse transaction ${tx.hash}:`, error);
                continue;
            }
        }

        return orders;
    }

    private isTokenTransfer(tx: EtherscanTransaction): boolean {
        // v2 API: 检查是否有tokenSymbol字段
        if (tx.tokenSymbol) {
            return true;
        }

        // 兼容v1 API: 检查是否为代币转账
        return !!(tx.input &&
            tx.input.length > 10 &&
            tx.contractAddress &&
            tx.contractAddress !== '0x0000000000000000000000000000000000000000');
    }

    private parseTokenTransaction(tx: EtherscanTransaction, params: FetchParams): Order | null {
        const isIncoming = tx.to.toLowerCase() === params.address.toLowerCase();
        const isOutgoing = tx.from.toLowerCase() === params.address.toLowerCase();

        // 调试日志
        console.log('[DEBUG] 解析交易:', {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            address: params.address,
            isIncoming,
            isOutgoing,
            value: tx.value,
            tokenSymbol: tx.tokenSymbol,
            tokenDecimal: tx.tokenDecimal
        });

        if (!isIncoming && !isOutgoing) {
            console.log('[DEBUG] 跳过非本地址相关交易:', tx.hash);
            return null;
        }

        // 解析代币信息（优先使用v2 API信息）
        const tokenInfo = this.parseTokenInfo(tx);
        const value = this.formatTokenAmount(tx.value, tokenInfo.decimals);
        const payTime = new Date(parseInt(tx.timeStamp) * 1000);

        // 过滤掉小额交易（可选）
        if (value < 0.001) {
            console.log('[DEBUG] 跳过小额交易:', tx.hash, value);
            return null;
        }

        return this.createOrder({
            orderType: OrderType.CryptoTransfer,
            peer: isIncoming ? tx.from : tx.to,
            item: `${tokenInfo.symbol} Transfer`,
            category: 'Token Transfer',
            money: value,
            note: `Token transfer: ${tx.hash}`,
            payTime: payTime,
            type: isIncoming ? Type.Recv : Type.Send,
            typeOriginal: isIncoming ? 'Receive' : 'Send',
            method: 'Ethereum',
            currency: tokenInfo.symbol,
            chain: BlockchainNetwork.Ethereum,
            token: tokenInfo.symbol,
            tokenAddress: tokenInfo.address,
            tokenDecimals: tokenInfo.decimals,
            transactionHash: tx.hash,
            transactionType: CryptoTransactionType.Transfer,
            gasPrice: parseInt(tx.gasPrice),
            gasUsed: parseInt(tx.gasUsed),
            blockNumber: parseInt(tx.blockNumber),
            fromAddress: tx.from,
            toAddress: tx.to,
            isGasTransaction: false
        });
    }

    private parseTokenInfo(tx: EtherscanTransaction): { symbol: string; address: string; decimals: number } {
        // v2 API: 使用准确的代币信息
        if (tx.tokenSymbol && tx.tokenDecimal) {
            return {
                symbol: tx.tokenSymbol,
                address: tx.contractAddress,
                decimals: parseInt(tx.tokenDecimal)
            };
        }

        // 兼容v1 API: 返回合约地址作为标识
        return {
            symbol: `TOKEN_${tx.contractAddress.slice(2, 8).toUpperCase()}`,
            address: tx.contractAddress,
            decimals: 18
        };
    }

    private parseGasTransaction(tx: EtherscanTransaction, params: FetchParams): Order | null {
        // 只有支出交易才需要支付矿工费
        const isOutgoing = tx.from.toLowerCase() === params.address.toLowerCase();

        if (!isOutgoing) {
            return null;
        }

        const gasUsed = parseInt(tx.gasUsed);
        const gasPrice = parseInt(tx.gasPrice);
        // 修复精度问题：直接计算，不使用formatTokenAmount
        const gasFee = (gasUsed * gasPrice) / Math.pow(10, 18);
        const payTime = new Date(parseInt(tx.timeStamp) * 1000);

        // 过滤掉极小的矿工费（可选）
        if (gasFee < 0.000001) {
            return null;
        }

        return this.createOrder({
            orderType: OrderType.CryptoGas,
            peer: 'Ethereum Network',
            item: 'Gas Fee',
            category: 'Transaction Fee',
            money: gasFee,
            note: `Gas fee for transaction: ${tx.hash}`,
            payTime: payTime,
            type: Type.Send,
            typeOriginal: 'Gas Fee',
            method: 'Ethereum',
            currency: 'ETH',
            chain: BlockchainNetwork.Ethereum,
            token: 'ETH',
            tokenDecimals: 18,
            transactionHash: tx.hash,
            transactionType: CryptoTransactionType.Gas,
            gasFee: gasFee,
            gasToken: 'ETH',
            gasPrice: gasPrice,
            gasUsed: gasUsed,
            blockNumber: parseInt(tx.blockNumber),
            fromAddress: tx.from,
            toAddress: tx.to,
            isGasTransaction: true,
            relatedTransactionHash: tx.hash
        });
    }

    // 关联矿工费交易（保持向后兼容）
    protected associateGasTransactions(orders: Order[]): Order[] {
        // 现在矿工费已经在parseTransactions中处理，这里直接返回
        return orders;
    }

    // 设置API密钥
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    // 设置自定义RPC URL（用于备用）
    setRpcUrl(url: string): void {
        this.baseUrl = url;
    }
} 