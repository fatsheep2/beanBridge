import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EthereumProvider } from '../providers/crypto/ethereum-provider';
import { BscProvider } from '../providers/crypto/bsc-provider';
import { CryptoProviderFactory } from '../providers/factories/crypto-provider-factory';
import { ProviderType, BlockchainNetwork, CryptoTransactionType, Type, OrderType } from '../types/provider';

// Mock fetch
global.fetch = vi.fn();

describe('区块链数据提供者测试', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('EthereumProvider', () => {
        it('应该正确创建以太坊提供者', () => {
            const provider = new EthereumProvider('test-api-key');
            expect(provider.getProviderName()).toBe('Ethereum');
            expect(provider.getSupportedChains()).toEqual([BlockchainNetwork.Ethereum]);
        });

        it('应该验证以太坊地址格式', () => {
            const provider = new EthereumProvider();

            // 有效地址
            expect(provider['validateAddress']('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', BlockchainNetwork.Ethereum)).toBe(true);

            // 无效地址
            expect(provider['validateAddress']('invalid-address', BlockchainNetwork.Ethereum)).toBe(false);
            expect(provider['validateAddress']('0x123', BlockchainNetwork.Ethereum)).toBe(false);
        });

        it('应该格式化代币金额', () => {
            const provider = new EthereumProvider();

            // 测试18位小数
            expect(provider['formatTokenAmount']('1000000000000000000', 18)).toBe(1);
            expect(provider['formatTokenAmount']('500000000000000000', 18)).toBe(0.5);

            // 测试6位小数（如USDC）
            expect(provider['formatTokenAmount']('1000000', 6)).toBe(1);
            expect(provider['formatTokenAmount']('500000', 6)).toBe(0.5);
        });

        it('应该解析以太坊交易', async () => {
            const mockResponse = {
                status: '1',
                message: 'OK',
                result: [
                    {
                        hash: '0x1234567890abcdef',
                        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
                        value: '1000000000000000000', // 1 ETH
                        gas: '21000',
                        gasPrice: '20000000000', // 20 Gwei
                        gasUsed: '21000',
                        blockNumber: '12345678',
                        timeStamp: '1640995200', // 2022-01-01 00:00:00
                        isError: '0',
                        txreceipt_status: '1',
                        input: '0x',
                        contractAddress: '',
                        cumulativeGasUsed: '21000',
                        confirmations: '100'
                    }
                ]
            };

            (fetch as any).mockResolvedValueOnce({
                json: async () => mockResponse
            });

            const provider = new EthereumProvider('test-api-key');
            const result = await provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            });

            expect(result.orders).toHaveLength(2); // 主交易 + 矿工费交易

            // 检查主交易
            const mainOrder = result.orders.find(order => !order.isGasTransaction);
            expect(mainOrder).toBeDefined();
            expect(mainOrder?.transactionHash).toBe('0x1234567890abcdef');
            expect(mainOrder?.money).toBe(1);
            expect(mainOrder?.token).toBe('ETH');
            expect(mainOrder?.chain).toBe(BlockchainNetwork.Ethereum);
            expect(mainOrder?.orderType).toBe(OrderType.CryptoTransfer);

            // 检查矿工费交易
            const gasOrder = result.orders.find(order => order.isGasTransaction);
            expect(gasOrder).toBeDefined();
            expect(gasOrder?.transactionHash).toBe('0x1234567890abcdef');
            expect(gasOrder?.gasFee).toBe(0.00042); // 21000 * 20000000000 / 10^18
            expect(gasOrder?.gasToken).toBe('ETH');
        });
    });

    describe('BscProvider', () => {
        it('应该正确创建BSC提供者', () => {
            const provider = new BscProvider('test-api-key');
            expect(provider.getProviderName()).toBe('BSC');
            expect(provider.getSupportedChains()).toEqual([BlockchainNetwork.BinanceSmartChain]);
        });

        it('应该验证BSC地址格式', () => {
            const provider = new BscProvider();

            // 有效地址
            expect(provider['validateAddress']('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', BlockchainNetwork.BinanceSmartChain)).toBe(true);

            // 无效地址
            expect(provider['validateAddress']('invalid-address', BlockchainNetwork.BinanceSmartChain)).toBe(false);
            expect(provider['validateAddress']('0x123', BlockchainNetwork.BinanceSmartChain)).toBe(false);
        });

        it('应该解析BSC交易', async () => {
            const mockResponse = {
                status: '1',
                message: 'OK',
                result: [
                    {
                        hash: '0xabcdef1234567890',
                        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
                        value: '2000000000000000000', // 2 BNB
                        gas: '21000',
                        gasPrice: '5000000000', // 5 Gwei
                        gasUsed: '21000',
                        blockNumber: '87654321',
                        timeStamp: '1640995200', // 2022-01-01 00:00:00
                        isError: '0',
                        txreceipt_status: '1',
                        input: '0x',
                        contractAddress: '',
                        cumulativeGasUsed: '21000',
                        confirmations: '100'
                    }
                ]
            };

            (fetch as any).mockResolvedValueOnce({
                json: async () => mockResponse
            });

            const provider = new BscProvider('test-api-key');
            const result = await provider.fetchData({
                chain: BlockchainNetwork.BinanceSmartChain,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            });

            expect(result.orders).toHaveLength(2); // 主交易 + 矿工费交易

            // 检查主交易
            const mainOrder = result.orders.find(order => !order.isGasTransaction);
            expect(mainOrder).toBeDefined();
            expect(mainOrder?.transactionHash).toBe('0xabcdef1234567890');
            expect(mainOrder?.money).toBe(2);
            expect(mainOrder?.token).toBe('BNB');
            expect(mainOrder?.chain).toBe(BlockchainNetwork.BinanceSmartChain);
            expect(mainOrder?.orderType).toBe(OrderType.CryptoTransfer);

            // 检查矿工费交易
            const gasOrder = result.orders.find(order => order.isGasTransaction);
            expect(gasOrder).toBeDefined();
            expect(gasOrder?.transactionHash).toBe('0xabcdef1234567890');
            expect(gasOrder?.gasFee).toBe(0.000105); // 21000 * 5000000000 / 10^18
            expect(gasOrder?.gasToken).toBe('BNB');
        });
    });

    describe('CryptoProviderFactory', () => {
        it('应该创建以太坊提供者', () => {
            const provider = CryptoProviderFactory.create(ProviderType.Ethereum, 'test-api-key');
            expect(provider.getProviderName()).toBe('Ethereum');
        });

        it('应该创建BSC提供者', () => {
            const provider = CryptoProviderFactory.create(ProviderType.BinanceSmartChain, 'test-api-key');
            expect(provider.getProviderName()).toBe('BSC');
        });

        it('应该缓存提供者实例', () => {
            const provider1 = CryptoProviderFactory.create(ProviderType.Ethereum);
            const provider2 = CryptoProviderFactory.create(ProviderType.Ethereum);
            expect(provider1).toBe(provider2);
        });

        it('应该检查是否为加密货币提供者', () => {
            expect(CryptoProviderFactory.isCryptoProvider(ProviderType.Ethereum)).toBe(true);
            expect(CryptoProviderFactory.isCryptoProvider(ProviderType.BinanceSmartChain)).toBe(true);
            expect(CryptoProviderFactory.isCryptoProvider(ProviderType.Alipay)).toBe(false);
        });

        it('应该获取支持的提供者列表', () => {
            const supported = CryptoProviderFactory.getSupportedProviders();
            expect(supported).toContain(ProviderType.Ethereum);
            expect(supported).toContain(ProviderType.BinanceSmartChain);
        });

        it('应该获取提供者信息', () => {
            const ethInfo = CryptoProviderFactory.getProviderInfo(ProviderType.Ethereum);
            expect(ethInfo).toEqual({
                name: 'Ethereum',
                supportedChains: ['ETH'],
                apiUrl: 'https://api.etherscan.io/api'
            });

            const bscInfo = CryptoProviderFactory.getProviderInfo(ProviderType.BinanceSmartChain);
            expect(bscInfo).toEqual({
                name: 'BSC',
                supportedChains: ['BSC'],
                apiUrl: 'https://api.bscscan.com/api'
            });
        });

        it('应该抛出错误对于不支持的提供者', () => {
            expect(() => {
                CryptoProviderFactory.create(ProviderType.Polygon);
            }).toThrow('Polygon provider not implemented yet');
        });
    });

    describe('统计信息', () => {
        it('应该正确更新统计信息', async () => {
            const mockResponse = {
                status: '1',
                message: 'OK',
                result: [
                    {
                        hash: '0x1234567890abcdef',
                        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
                        value: '1000000000000000000',
                        gas: '21000',
                        gasPrice: '20000000000',
                        gasUsed: '21000',
                        blockNumber: '12345678',
                        timeStamp: '1640995200',
                        isError: '0',
                        txreceipt_status: '1',
                        input: '0x',
                        contractAddress: '',
                        cumulativeGasUsed: '21000',
                        confirmations: '100'
                    }
                ]
            };

            (fetch as any).mockResolvedValueOnce({
                json: async () => mockResponse
            });

            const provider = new EthereumProvider('test-api-key');
            await provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            });

            const stats = provider.getStatistics();
            expect(stats.parsedItems).toBe(2);
            expect(stats.totalTransactions).toBe(2);
            expect(stats.totalGasFees).toBeGreaterThan(0);
            expect(stats.supportedChains).toContain(BlockchainNetwork.Ethereum);
        });
    });
}); 