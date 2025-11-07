import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EthereumProvider } from '../providers/crypto/ethereum-provider';
import { CryptoProviderFactory } from '../providers/factories/crypto-provider-factory';
import { RuleEngine } from '../rule-engine';
import { cryptoPresetConfigs } from '../data/crypto-preset-configs';
import type { ConfigRule, IR, Order } from '../types/provider';
import { ProviderType, BlockchainNetwork, CryptoTransactionType, Type, OrderType } from '../types/provider';

// Mock fetch
global.fetch = vi.fn();

describe('区块链功能集成测试', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('完整流程测试', () => {
        it('应该完成从数据获取到规则应用的完整流程', async () => {
            // 1. 模拟以太坊API响应
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
                        timeStamp: '1640995200',
                        isError: '0',
                        txreceipt_status: '1',
                        input: '0x',
                        contractAddress: '',
                        cumulativeGasUsed: '21000',
                        confirmations: '100'
                    },
                    {
                        hash: '0xabcdef1234567890',
                        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                        to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT合约
                        value: '0',
                        gas: '65000',
                        gasPrice: '25000000000', // 25 Gwei
                        gasUsed: '65000',
                        blockNumber: '12345679',
                        timeStamp: '1640995260',
                        isError: '0',
                        txreceipt_status: '1',
                        input: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b700000000000000000000000000000000000000000000000000000000000186a0', // USDT转账
                        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                        cumulativeGasUsed: '65000',
                        confirmations: '100'
                    }
                ]
            };

            (fetch as any).mockResolvedValue({
                json: async () => mockResponse
            });

            // 2. 创建数据提供者
            const provider = CryptoProviderFactory.create(ProviderType.Ethereum, 'test-api-key');
            expect(provider.getProviderName()).toBe('Ethereum');

            // 3. 获取数据
            const data = await provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            });

            expect(data.orders).toHaveLength(4); // 2个主交易 + 2个矿工费交易

            // 4. 创建规则引擎并加载预设配置
            const ethereumConfig = cryptoPresetConfigs.find(config => config.provider === ProviderType.Ethereum);
            expect(ethereumConfig).toBeDefined();

            // 将Rule类型转换为ConfigRule类型
            const configRules: ConfigRule[] = ethereumConfig!.config.rules.map(rule => ({
                pattern: rule.name || '',
                account: rule.targetAccount || 'Assets:Crypto:ETH',
                methodAccount: rule.methodAccount,
                chain: rule.chain,
                token: rule.token,
                transactionType: rule.transactionType,
                priority: rule.priority
            }));

            const ruleEngine = new RuleEngine(
                configRules,
                ethereumConfig!.config.defaultMinusAccount,
                ethereumConfig!.config.defaultPlusAccount
            );

            // 5. 应用规则
            const processedData = ruleEngine.applyRulesToIR(data);

            // 6. 验证结果
            const ethTransfer = processedData.orders.find(order =>
                order.transactionHash === '0x1234567890abcdef' && !order.isGasTransaction
            );
            expect(ethTransfer).toBeDefined();
            expect(ethTransfer?.minusAccount).toBe('Assets:Crypto:ETH');
            expect(ethTransfer?.plusAccount).toBe('Assets:Crypto:ETH');

            const usdtTransfer = processedData.orders.find(order =>
                order.transactionHash === '0xabcdef1234567890' && !order.isGasTransaction
            );
            expect(usdtTransfer).toBeDefined();
            expect(usdtTransfer?.minusAccount).toBe('Assets:Crypto:ETH');
            expect(usdtTransfer?.plusAccount).toBe('Assets:Crypto:USDT');

            const gasFee = processedData.orders.find(order =>
                order.transactionHash === '0x1234567890abcdef' && order.isGasTransaction
            );
            expect(gasFee).toBeDefined();
            expect(gasFee?.minusAccount).toBe('Assets:Crypto:ETH');
            expect(gasFee?.plusAccount).toBe('Expenses:Crypto:Gas');
        });
    });

    describe('预设配置测试', () => {
        it('应该正确加载所有区块链预设配置', () => {
            const supportedProviders = [
                ProviderType.Ethereum,
                ProviderType.BinanceSmartChain,
                ProviderType.Polygon,
                ProviderType.Arbitrum,
                ProviderType.Optimism,
                ProviderType.Avalanche,
                ProviderType.Solana,
                ProviderType.Bitcoin
            ];

            supportedProviders.forEach(providerType => {
                const config = cryptoPresetConfigs.find(config => config.provider === providerType);
                expect(config).toBeDefined();
                expect(config?.config.rules.length).toBeGreaterThan(0);
                expect(config?.config.defaultMinusAccount).toBeDefined();
                expect(config?.config.defaultPlusAccount).toBeDefined();
            });
        });

        it('应该验证预设配置的规则格式', () => {
            cryptoPresetConfigs.forEach(config => {
                config.config.rules.forEach(rule => {
                    expect(rule.name).toBeDefined();
                    expect(rule.targetAccount).toBeDefined();
                    expect(rule.chain).toBeDefined();
                    expect(rule.token).toBeDefined();
                    expect(rule.transactionType).toBeDefined();
                });
            });
        });
    });

    describe('错误处理测试', () => {
        it('应该处理API错误', async () => {
            const errorResponse = {
                status: '0',
                message: 'Invalid API Key',
                result: []
            };

            (fetch as any).mockResolvedValue({
                json: async () => errorResponse
            });

            const provider = new EthereumProvider('invalid-api-key');

            await expect(provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            })).rejects.toThrow('Etherscan API error: Invalid API Key');
        });

        it('应该处理无效地址', async () => {
            const provider = new EthereumProvider();

            await expect(provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: 'invalid-address'
            })).rejects.toThrow('Invalid Ethereum address format');
        });

        it('应该处理网络错误', async () => {
            (fetch as any).mockRejectedValue(new Error('Network error'));

            const provider = new EthereumProvider();

            await expect(provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            })).rejects.toThrow('Failed to fetch Ethereum data: Network error');
        });
    });

    describe('性能测试', () => {
        it('应该能够处理大量交易', async () => {
            // 生成100个模拟交易
            const mockTransactions = Array.from({ length: 100 }, (_, i) => ({
                hash: `0x${i.toString().padStart(64, '0')}`,
                from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
                value: '1000000000000000000',
                gas: '21000',
                gasPrice: '20000000000',
                gasUsed: '21000',
                blockNumber: (12345678 + i).toString(),
                timeStamp: (1640995200 + i * 60).toString(),
                isError: '0',
                txreceipt_status: '1',
                input: '0x',
                contractAddress: '',
                cumulativeGasUsed: '21000',
                confirmations: '100'
            }));

            const mockResponse = {
                status: '1',
                message: 'OK',
                result: mockTransactions
            };

            (fetch as any).mockResolvedValue({
                json: async () => mockResponse
            });

            const startTime = Date.now();

            const provider = new EthereumProvider('test-api-key');
            const data = await provider.fetchData({
                chain: BlockchainNetwork.Ethereum,
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            });

            const processingTime = Date.now() - startTime;

            expect(data.orders).toHaveLength(200); // 100个主交易 + 100个矿工费交易
            expect(processingTime).toBeLessThan(5000); // 应该在5秒内完成
        });
    });
}); 