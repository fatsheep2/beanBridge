import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EthereumProvider } from '../providers/crypto/ethereum-provider';
import { ProviderType, Type, OrderType, BlockchainNetwork, CryptoTransactionType, Account } from '../types/provider';
import { ruleConfigService } from '../services/rule-config-service';

// Mock ruleConfigService
vi.mock('../services/rule-config-service', () => ({
    ruleConfigService: {
        getConfig: vi.fn()
    }
}));

describe('EthereumProvider 规则配置测试', () => {
    let provider: EthereumProvider;
    const mockRuleConfigService = vi.mocked(ruleConfigService);

    beforeEach(() => {
        provider = new EthereumProvider('test-api-key');
        vi.clearAllMocks();
    });

    describe('账户配置读取', () => {
        it('应该从规则配置中读取账户设置', () => {
            // 模拟规则配置
            const mockConfig = {
                id: 'test-config',
                provider: ProviderType.Ethereum,
                name: 'Test Config',
                description: 'Test configuration',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                defaultMinusAccount: 'Assets:Crypto:MyWallet',
                defaultPlusAccount: 'Expenses:Crypto:MyExpenses',
                defaultCurrency: 'ETH',
                defaultCommissionAccount: 'Expenses:Crypto:GasFees',
                defaultPositionAccount: 'Assets:Crypto:MyPositions',
                rules: []
            };

            mockRuleConfigService.getConfig.mockReturnValue(mockConfig);

            // 创建一个测试订单
            const testOrder = provider['createOrder']({
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1.0,
                note: 'Test transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                method: 'Ethereum',
                currency: 'ETH',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionHash: '0xabcdef1234567890',
                transactionType: CryptoTransactionType.Transfer,
                isGasTransaction: false
            });

            // 验证账户设置 - 现在使用钱包账户
            expect(testOrder.minusAccount).toBe('Assets:Crypto:MyPositions'); // 使用钱包账户
            expect(testOrder.plusAccount).toBe('Expenses:Crypto:MyExpenses');
            expect(testOrder.extraAccounts[Account.CashAccount]).toBe('Assets:Crypto:MyWallet');
            expect(testOrder.extraAccounts[Account.PositionAccount]).toBe('Assets:Crypto:MyPositions');
            expect(testOrder.extraAccounts[Account.CommissionAccount]).toBe('Expenses:Crypto:GasFees');
        });

        it('应该正确处理矿工费交易', () => {
            // 模拟规则配置
            const mockConfig = {
                id: 'test-config',
                provider: ProviderType.Ethereum,
                name: 'Test Config',
                description: 'Test configuration',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                defaultMinusAccount: 'Assets:Crypto:MyWallet',
                defaultPlusAccount: 'Expenses:Crypto:MyExpenses',
                defaultCurrency: 'ETH',
                defaultCommissionAccount: 'Expenses:Crypto:GasFees',
                defaultPositionAccount: 'Assets:Crypto:MyPositions',
                rules: []
            };

            mockRuleConfigService.getConfig.mockReturnValue(mockConfig);

            // 创建一个矿工费交易订单
            const gasOrder = provider['createOrder']({
                orderType: OrderType.CryptoGas,
                peer: 'Ethereum Network',
                item: 'Gas Fee',
                category: 'Transaction Fee',
                money: 0.001,
                note: 'Gas fee for transaction',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Gas Fee',
                method: 'Ethereum',
                currency: 'ETH',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionHash: '0xabcdef1234567890',
                transactionType: CryptoTransactionType.Gas,
                gasFee: 0.001,
                gasToken: 'ETH',
                isGasTransaction: true
            });

            // 验证矿工费交易的账户设置
            expect(gasOrder.minusAccount).toBe('Assets:Crypto:MyPositions'); // 默认手续费支出账户（钱包）
            expect(gasOrder.plusAccount).toBe('Expenses:Crypto:GasFees'); // 默认手续费扣除账户
        });

        it('应该在没有规则配置时使用默认值', () => {
            // 模拟没有规则配置
            mockRuleConfigService.getConfig.mockReturnValue(null);

            const testOrder = provider['createOrder']({
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1.0,
                note: 'Test transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                method: 'Ethereum',
                currency: 'ETH',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionHash: '0xabcdef1234567890',
                transactionType: CryptoTransactionType.Transfer,
                isGasTransaction: false
            });

            // 验证使用默认值 - 现在使用钱包账户
            expect(testOrder.minusAccount).toBe('Assets:Crypto:ETH'); // 使用默认钱包账户
            expect(testOrder.plusAccount).toBe('Expenses:Crypto');
            expect(testOrder.extraAccounts[Account.CashAccount]).toBe('Assets:Crypto:ETH');
            expect(testOrder.extraAccounts[Account.PositionAccount]).toBe('Assets:Crypto:ETH');
            expect(testOrder.extraAccounts[Account.CommissionAccount]).toBe('Expenses:Life:crypto:Commission:手续费');
        });

        it('应该使用实际配置正确映射账户', () => {
            // 使用用户提供的实际配置
            const mockConfig = {
                id: "mcicb2ec1t6awdb778s",
                provider: ProviderType.Ethereum,
                name: "我的配置",
                description: "以太坊及其EVM兼容链账单的基础配置模板，支持ETH/BSC/Polygon等",
                createdAt: "2025-06-30T00:07:41.028Z",
                updatedAt: "2025-07-01T07:14:04.527Z",
                defaultMinusAccount: "Assets:Crypto:Wallet:Software:软件钱包:Ethereum:0xe7e2DA8938C64af29Cd8181918a133CDd598B755",
                defaultPlusAccount: "Expenses:Crypto",
                defaultCurrency: "ETH",
                defaultPositionAccount: "Assets:Crypto:Wallet:Software:软件钱包:Ethereum:0xe7e2DA8938C64af29Cd8181918a133CDd598B755",
                defaultCommissionAccount: "Expenses:Life:crypto:Commission:手续费",
                rules: []
            };

            mockRuleConfigService.getConfig.mockReturnValue(mockConfig);

            // 创建一个USDT转账订单（支出）
            const usdtOrder = provider['createOrder']({
                orderType: OrderType.CryptoTransfer,
                peer: '0x4a14347083b80e5216ca31350a2d21702ac3650d',
                item: 'USDT Transfer',
                category: 'Cryptocurrency',
                money: -100,
                note: 'USDT transfer',
                payTime: new Date('2025-06-29'),
                type: Type.Send,
                typeOriginal: 'Send',
                method: 'Ethereum',
                currency: 'USDT',
                chain: BlockchainNetwork.Ethereum,
                token: 'USDT',
                transactionHash: '0x9b7ef1bb115a0c57a8468c2a854a0c613691cde79cfe7b4fb53401a4cb9d2405',
                transactionType: CryptoTransactionType.Transfer,
                isGasTransaction: false
            });

            // 验证USDT转账的账户设置
            expect(usdtOrder.minusAccount).toBe('Assets:Crypto:Wallet:Software:软件钱包:Ethereum:0xe7e2DA8938C64af29Cd8181918a133CDd598B755');
            expect(usdtOrder.plusAccount).toBe('Expenses:Crypto');

            // 创建一个矿工费交易订单
            const gasOrder = provider['createOrder']({
                orderType: OrderType.CryptoGas,
                peer: 'Ethereum Network',
                item: 'Gas Fee',
                category: 'Transaction Fee',
                money: -0.00022640968458815,
                note: 'Gas fee for transaction',
                payTime: new Date('2025-06-29'),
                type: Type.Send,
                typeOriginal: 'Gas Fee',
                method: 'Ethereum',
                currency: 'ETH',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionHash: '0x9b7ef1bb115a0c57a8468c2a854a0c613691cde79cfe7b4fb53401a4cb9d2405',
                transactionType: CryptoTransactionType.Gas,
                gasFee: 0.00022640968458815,
                gasToken: 'ETH',
                isGasTransaction: true
            });

            // 验证矿工费交易的账户设置
            expect(gasOrder.minusAccount).toBe('Assets:Crypto:Wallet:Software:软件钱包:Ethereum:0xe7e2DA8938C64af29Cd8181918a133CDd598B755');
            expect(gasOrder.plusAccount).toBe('Expenses:Life:crypto:Commission:手续费');
        });
    });

    describe('提供者类型', () => {
        it('应该返回正确的提供者类型', () => {
            expect(provider['getProviderType']()).toBe(ProviderType.Ethereum);
        });
    });
}); 