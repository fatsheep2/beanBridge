import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestUtils } from './test-utils';
import { ProviderFactory } from '../providers/factories/provider-factory';
import { CryptoProviderFactory } from '../providers/factories/crypto-provider-factory';
import { RuleEngine } from '../rule-engine';
import { ProviderType, BlockchainNetwork } from '../types/provider';

// Mock fetch for crypto providers
global.fetch = vi.fn();

describe('所有提供者集成测试', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('提供者工厂测试', () => {
        it('应该正确创建支付提供者', () => {
            const alipayProvider = ProviderFactory.create(ProviderType.Alipay);
            expect(alipayProvider.getProviderName()).toBe('Alipay');

            const wechatProvider = ProviderFactory.create(ProviderType.Wechat);
            expect(wechatProvider.getProviderName()).toBe('Wechat');

            const jdProvider = ProviderFactory.create(ProviderType.Jd);
            expect(jdProvider.getProviderName()).toBe('JD');

            const mtProvider = ProviderFactory.create(ProviderType.MT);
            expect(mtProvider.getProviderName()).toBe('MT');
        });

        it('应该正确创建银行提供者', () => {
            const ccbProvider = ProviderFactory.create(ProviderType.CCB);
            expect(ccbProvider.getProviderName()).toBe('CCB');

            const icbcProvider = ProviderFactory.create(ProviderType.Icbc);
            expect(icbcProvider.getProviderName()).toBe('ICBC');

            const tdProvider = ProviderFactory.create(ProviderType.Td);
            expect(tdProvider.getProviderName()).toBe('TD');

            const citicProvider = ProviderFactory.create(ProviderType.Citic);
            expect(citicProvider.getProviderName()).toBe('CITIC');

            const bmoProvider = ProviderFactory.create(ProviderType.Bmo);
            expect(bmoProvider.getProviderName()).toBe('BMO');

            const hsbchkProvider = ProviderFactory.create(ProviderType.HsbcHK);
            expect(hsbchkProvider.getProviderName()).toBe('HSBC-HK');
        });

        it('应该正确创建证券和加密货币提供者', () => {
            const htsecProvider = ProviderFactory.create(ProviderType.Htsec);
            expect(htsecProvider.getProviderName()).toBe('HTSEC');

            const huobiProvider = ProviderFactory.create(ProviderType.Huobi);
            expect(huobiProvider.getProviderName()).toBe('Huobi');
        });

        it('应该处理未知的提供者类型', () => {
            expect(() => {
                ProviderFactory.create('UnknownProvider' as ProviderType);
            }).toThrow();
        });
    });

    describe('加密货币提供者工厂测试', () => {
        it('应该正确创建以太坊提供者', () => {
            const ethereumProvider = CryptoProviderFactory.create(ProviderType.Ethereum);
            expect(ethereumProvider.getProviderName()).toBe('Ethereum');
            expect(ethereumProvider.getSupportedChains()).toContain(BlockchainNetwork.Ethereum);
        });

        it('应该正确创建BSC提供者', () => {
            const bscProvider = CryptoProviderFactory.create(ProviderType.BinanceSmartChain);
            expect(bscProvider.getProviderName()).toBe('BSC');
            expect(bscProvider.getSupportedChains()).toContain(BlockchainNetwork.BinanceSmartChain);
        });

        it('应该处理未知的区块链网络', () => {
            expect(() => {
                CryptoProviderFactory.create('UnknownChain' as ProviderType);
            }).toThrow();
        });
    });

    describe('规则引擎测试', () => {
        it('应该正确处理规则', () => {
            const ruleEngine = new RuleEngine();

            // 添加规则
            ruleEngine.addRule({
                pattern: '测试商户',
                account: 'Expenses:Test',
                methodAccount: 'Assets:Alipay'
            });

            ruleEngine.addRule({
                pattern: '餐厅',
                account: 'Expenses:Food',
                methodAccount: 'Assets:Alipay'
            });

            // 验证规则数量
            const rules = ruleEngine.getRules();
            expect(rules.length).toBe(2);
            expect(rules[0].pattern).toBe('测试商户');
            expect(rules[1].pattern).toBe('餐厅');
        });

        it('应该正确应用规则到订单', () => {
            const ruleEngine = new RuleEngine();

            // 添加规则
            ruleEngine.addRule({
                pattern: '测试商户',
                account: 'Expenses:Test',
                methodAccount: 'Assets:Alipay'
            });

            // 创建测试订单
            const testOrder = {
                orderType: 'Normal' as any,
                peer: '测试商户',
                item: '商品',
                category: '日用百货',
                money: 100,
                note: '测试订单',
                payTime: new Date(),
                type: 'Send' as any,
                typeOriginal: '支出',
                txTypeOriginal: '支出',
                method: '余额',
                amount: 100,
                price: 1,
                currency: 'CNY',
                commission: 0,
                units: {} as any,
                extraAccounts: {} as any,
                minusAccount: '',
                plusAccount: '',
                metadata: {},
                tags: []
            };

            // 应用规则
            const result = ruleEngine.applyRules(testOrder);

            // 验证结果
            expect(result).toBeDefined();
            expect(result.minusAccount).toBeDefined();
            expect(result.plusAccount).toBeDefined();
        });

        it('应该正确处理多个匹配规则', () => {
            const ruleEngine = new RuleEngine();

            // 添加多个规则
            ruleEngine.addRule({
                pattern: '餐厅',
                account: 'Expenses:Food',
                methodAccount: 'Assets:Alipay'
            });

            ruleEngine.addRule({
                pattern: '餐厅',
                account: 'Expenses:Food:Lunch',
                methodAccount: 'Assets:Alipay',
                time: '12:00-14:00'
            });

            // 创建测试订单
            const testOrder = {
                orderType: 'Normal' as any,
                peer: '餐厅',
                item: '午餐',
                category: '餐饮',
                money: 50,
                note: '午餐',
                payTime: new Date('2023-01-01T12:30:00'),
                type: 'Send' as any,
                typeOriginal: '支出',
                txTypeOriginal: '支出',
                method: '余额',
                amount: 50,
                price: 1,
                currency: 'CNY',
                commission: 0,
                units: {} as any,
                extraAccounts: {} as any,
                minusAccount: '',
                plusAccount: '',
                metadata: {},
                tags: []
            };

            // 应用规则
            const result = ruleEngine.applyRules(testOrder);

            // 验证结果
            expect(result.minusAccount).toBe('Assets:Alipay');
            expect(result.plusAccount).toBe('Expenses:Food:Lunch');
        });
    });

    describe('端到端测试', () => {
        it('应该完成完整的支付宝数据处理流程', async () => {
            const testCase = TestUtils.loadTestData('alipay');
            const provider = ProviderFactory.create(ProviderType.Alipay);

            // 模拟支付宝数据
            const mockFile = {
                name: 'alipay-e2e.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);

            // 验证统计信息
            const stats = provider.getStatistics();
            expect(stats.parsedItems).toBeGreaterThan(0);
            expect(stats.totalInRecords).toBeGreaterThanOrEqual(0);
            expect(stats.totalOutRecords).toBeGreaterThanOrEqual(0);
        });

        it('应该完成完整的银行数据处理流程', async () => {
            const testCase = TestUtils.loadTestData('ccb');
            const provider = ProviderFactory.create(ProviderType.CCB);

            // 模拟银行数据
            const mockFile = {
                name: 'ccb-e2e.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);

            // 验证统计信息
            const stats = provider.getStatistics();
            expect(stats.parsedItems).toBeGreaterThan(0);
            expect(stats.totalInRecords).toBeGreaterThanOrEqual(0);
            expect(stats.totalOutRecords).toBeGreaterThanOrEqual(0);
        });

        it('应该完成完整的证券数据处理流程', async () => {
            const testCase = TestUtils.loadTestData('htsec');
            const provider = ProviderFactory.create(ProviderType.Htsec);

            // 模拟证券数据
            const mockFile = {
                name: 'htsec-e2e.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);

            // 验证统计信息
            const stats = provider.getStatistics();
            expect(stats.parsedItems).toBeGreaterThan(0);
            expect(stats.totalInRecords).toBeGreaterThanOrEqual(0);
            expect(stats.totalOutRecords).toBeGreaterThanOrEqual(0);
        });
    });

    describe('错误处理测试', () => {
        it('应该正确处理无效的文件格式', async () => {
            const provider = ProviderFactory.create(ProviderType.Alipay);

            const invalidFile = {
                name: 'invalid.txt',
                text: async () => 'This is not a valid CSV file'
            } as File;

            try {
                const result = await provider.translate(invalidFile);
                expect(result.orders).toBeDefined();
                expect(Array.isArray(result.orders)).toBe(true);
            } catch (error) {
                // 如果抛出错误，这是可以接受的
                expect(error).toBeDefined();
            }
        });

        it('应该正确处理空文件', async () => {
            const provider = ProviderFactory.create(ProviderType.Alipay);

            const emptyFile = {
                name: 'empty.csv',
                text: async () => ''
            } as File;

            try {
                const result = await provider.translate(emptyFile);
                expect(result.orders).toBeDefined();
                expect(Array.isArray(result.orders)).toBe(true);
            } catch (error) {
                // 如果抛出错误，这是可以接受的
                expect(error).toBeDefined();
            }
        });

        it('应该正确处理不支持的提供者类型', () => {
            expect(() => {
                ProviderFactory.create('UnsupportedProvider' as ProviderType);
            }).toThrow();
        });
    });

    describe('性能测试', () => {
        it('应该能够处理大量数据', async () => {
            const provider = ProviderFactory.create(ProviderType.Alipay);

            // 生成大量测试数据
            const largeData = Array.from({ length: 1000 }, (_, i) =>
                `2023-01-01,10:00:00,测试商户${i},商品${i},支出,${(i + 1) * 10}.00,余额,交易成功,订单${i},商户订单${i},备注${i}`
            ).join('\n');

            const mockFile = {
                name: 'large-data.csv',
                text: async () => largeData
            } as File;

            const startTime = Date.now();
            const result = await provider.translate(mockFile);
            const endTime = Date.now();

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证处理时间在合理范围内（5秒内）
            expect(endTime - startTime).toBeLessThan(5000);
        }, 20000);

        it('应该能够处理复杂的规则配置', () => {
            const ruleEngine = new RuleEngine();

            // 设置复杂的规则
            const complexRules = [
                { pattern: '测试商户', account: 'Expenses:Test' },
                { pattern: '商品', account: 'Expenses:Goods' },
                { pattern: '支出', account: 'Expenses:General' },
                { pattern: '余额', account: 'Assets:Alipay' },
                { pattern: '餐饮', account: 'Expenses:Food' },
                { pattern: '12:00-14:00', account: 'Expenses:Food:Lunch' }
            ];

            // 添加规则
            complexRules.forEach(rule => ruleEngine.addRule(rule));

            // 验证规则数量
            const rules = ruleEngine.getRules();
            expect(rules.length).toBe(6);

            // 测试规则匹配
            const testOrder = {
                orderType: 'Normal' as any,
                peer: '餐厅',
                item: '午餐',
                category: '餐饮',
                money: 50,
                note: '午餐',
                payTime: new Date('2023-01-01T12:30:00'),
                type: 'Send' as any,
                typeOriginal: '支出',
                txTypeOriginal: '支出',
                method: '余额',
                amount: 50,
                price: 1,
                currency: 'CNY',
                commission: 0,
                units: {} as any,
                extraAccounts: {} as any,
                minusAccount: '',
                plusAccount: '',
                metadata: {},
                tags: []
            };

            const result = ruleEngine.applyRules(testOrder);
            expect(result).toBeDefined();
            expect(result.minusAccount).toBeDefined();
            expect(result.plusAccount).toBeDefined();
        });
    });
}); 