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
}

interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
}

export class EthereumProvider extends BaseCryptoProvider {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.etherscan.io/api';

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
            const orders = this.parseTransactions(transactions, params);

            // 关联矿工费交易
            const associatedOrders = this.associateGasTransactions(orders);

            return {
                orders: associatedOrders
            };
        } catch (error) {
            console.error('Failed to fetch Ethereum data:', error);
            throw new Error(`Failed to fetch Ethereum data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async fetchTransactions(params: FetchParams): Promise<EtherscanTransaction[]> {
        const url = new URL(this.baseUrl);
        url.searchParams.set('module', 'account');
        url.searchParams.set('action', 'txlist');
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

        const response = await fetch(url.toString());
        const data: EtherscanResponse = await response.json();

        if (data.status !== '1') {
            throw new Error(`Etherscan API error: ${data.message}`);
        }

        return data.result.filter(tx => tx.isError === '0' && tx.txreceipt_status === '1');
    }

    private parseTransactions(transactions: EtherscanTransaction[], params: FetchParams): Order[] {
        const orders: Order[] = [];

        for (const tx of transactions) {
            try {
                // 解析主交易
                const mainOrder = this.parseMainTransaction(tx, params);
                if (mainOrder) {
                    orders.push(mainOrder);
                }

                // 解析矿工费交易
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

    private parseMainTransaction(tx: EtherscanTransaction, params: FetchParams): Order | null {
        const isIncoming = tx.to.toLowerCase() === params.address.toLowerCase();
        const isOutgoing = tx.from.toLowerCase() === params.address.toLowerCase();

        if (!isIncoming && !isOutgoing) {
            return null;
        }

        const value = this.formatTokenAmount(tx.value, 18); // ETH has 18 decimals
        const payTime = new Date(parseInt(tx.timeStamp) * 1000);

        // 判断是否为代币转账（通过input数据）
        const isTokenTransfer = tx.input && tx.input.length > 10 && tx.contractAddress;

        let token = 'ETH';
        let tokenAddress = '';
        let transactionType: CryptoTransactionType = CryptoTransactionType.Transfer;
        let item = 'Ethereum Transfer';
        let category = 'Cryptocurrency';

        if (isTokenTransfer) {
            // 这里可以解析ERC20代币转账
            // 简化处理，实际应该解析input数据
            token = 'UNKNOWN_TOKEN';
            tokenAddress = tx.contractAddress;
            item = 'Token Transfer';
            category = 'Token Transfer';
        }

        return this.createOrder({
            orderType: OrderType.CryptoTransfer,
            peer: isIncoming ? tx.from : tx.to,
            item: item,
            category: category,
            money: value,
            note: `Transaction: ${tx.hash}`,
            payTime: payTime,
            type: isIncoming ? Type.Recv : Type.Send,
            typeOriginal: isIncoming ? 'Receive' : 'Send',
            method: 'Ethereum',
            currency: token,
            chain: BlockchainNetwork.Ethereum,
            token: token,
            tokenAddress: tokenAddress,
            tokenDecimals: 18,
            transactionHash: tx.hash,
            transactionType: transactionType,
            gasPrice: parseInt(tx.gasPrice),
            gasUsed: parseInt(tx.gasUsed),
            blockNumber: parseInt(tx.blockNumber),
            fromAddress: tx.from,
            toAddress: tx.to,
            isGasTransaction: false
        });
    }

    private parseGasTransaction(tx: EtherscanTransaction, params: FetchParams): Order | null {
        const isOutgoing = tx.from.toLowerCase() === params.address.toLowerCase();

        if (!isOutgoing) {
            return null;
        }

        const gasUsed = parseInt(tx.gasUsed);
        const gasPrice = parseInt(tx.gasPrice);
        const gasFee = this.formatTokenAmount((gasUsed * gasPrice).toString(), 18);
        const payTime = new Date(parseInt(tx.timeStamp) * 1000);

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

    // 设置API密钥
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    // 设置自定义RPC URL（用于备用）
    setRpcUrl(url: string): void {
        this.baseUrl = url;
    }
} 