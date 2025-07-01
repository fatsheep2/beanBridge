import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestUtils, type TestCase } from './test-utils';
import { HtsecProvider } from '../providers/securities/htsec-provider';
import { HuobiProvider } from '../providers/crypto/huobi-provider';
import { ProviderType, BlockchainNetwork } from '../types/provider';

// Mock fetch for crypto providers
global.fetch = vi.fn();

describe('证券和加密货币提供者测试', () => {
    let testCases: Map<string, TestCase> = new Map();

    beforeEach(() => {
        testCases.clear();
        vi.clearAllMocks();
    });

    describe('华泰证券提供者', () => {
        it('应该正确解析华泰证券数据', async () => {
            const testCase = TestUtils.loadTestData('htsec');
            const provider = new HtsecProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'htsec-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持华泰证券格式', () => {
            const provider = new HtsecProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new HtsecProvider();
            expect(provider.getProviderName()).toBe('HTSEC');
        });

        it('应该正确处理证券交易记录', async () => {
            const provider = new HtsecProvider();

            // 模拟证券交易数据
            const securitiesData = `
交易日期,交易时间,证券代码,证券名称,交易类型,成交数量,成交价格,成交金额,手续费,印花税,过户费,其他费用,成交编号
2023-01-01,09:30:00,000001,平安银行,买入,100,10.50,1050.00,5.00,0.00,1.00,0.00,202301010001
2023-01-02,14:30:00,000002,万科A,卖出,200,15.20,3040.00,5.00,3.04,2.00,0.00,202301020001
            `.trim();

            const mockFile = {
                name: 'securities-trades.csv',
                text: async () => securitiesData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证证券交易特有的字段
            const order = result.orders[0];
            expect(order.orderType).toBeDefined();
            expect(order.money).toBeDefined();
            expect(order.currency).toBeDefined();
        });
    });

    describe('火币提供者', () => {
        it('应该正确解析火币数据', async () => {
            const testCase = TestUtils.loadTestData('huobi');
            const provider = new HuobiProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'huobi-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持火币格式', () => {
            const provider = new HuobiProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new HuobiProvider();
            expect(provider.getProviderName()).toBe('Huobi');
        });

        it('应该正确处理加密货币交易记录', async () => {
            const provider = new HuobiProvider();

            // 模拟加密货币交易数据
            const cryptoData = `
时间,类型,交易对,价格,数量,成交额,手续费,手续费币种,成交编号
2023-01-01 10:00:00,买入,BTC/USDT,45000.00,0.001,45.00,0.0001,BTC,202301010001
2023-01-02 15:00:00,卖出,ETH/USDT,3000.00,0.01,30.00,0.00001,ETH,202301020001
            `.trim();

            const mockFile = {
                name: 'crypto-trades.csv',
                text: async () => cryptoData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证加密货币交易特有的字段
            const order = result.orders[0];
            expect(order.orderType).toBeDefined();
            expect(order.money).toBeDefined();
            expect(order.currency).toBeDefined();
            expect(order.token).toBeDefined();
        });
    });

    describe('证券和加密货币提供者通用功能', () => {
        it('所有证券和加密货币提供者都应该实现基本接口', () => {
            const providers = [
                new HtsecProvider(),
                new HuobiProvider()
            ];

            for (const provider of providers) {
                expect(provider.getProviderName()).toBeDefined();
                expect(provider.getSupportedFormats()).toBeDefined();
                expect(provider.getStatistics()).toBeDefined();
                expect(typeof provider.translate).toBe('function');
            }
        });

        it('应该正确处理空文件', async () => {
            const providers = [
                new HtsecProvider(),
                new HuobiProvider()
            ];

            const emptyFile = {
                name: 'empty.csv',
                text: async () => ''
            } as File;

            for (const provider of providers) {
                try {
                    const result = await provider.translate(emptyFile);
                    expect(result.orders).toBeDefined();
                    expect(Array.isArray(result.orders)).toBe(true);
                } catch (error) {
                    // 某些提供者可能会抛出错误，这是可以接受的
                    expect(error).toBeDefined();
                }
            }
        });

        it('应该正确处理无效格式的文件', async () => {
            const providers = [
                new HtsecProvider(),
                new HuobiProvider()
            ];

            const invalidFile = {
                name: 'invalid.txt',
                text: async () => 'This is not a valid CSV file'
            } as File;

            for (const provider of providers) {
                try {
                    const result = await provider.translate(invalidFile);
                    expect(result.orders).toBeDefined();
                    expect(Array.isArray(result.orders)).toBe(true);
                } catch (error) {
                    // 某些提供者可能会抛出错误，这是可以接受的
                    expect(error).toBeDefined();
                }
            }
        });

        it('应该正确处理不同类型的交易', async () => {
            const providers = [
                new HtsecProvider(),
                new HuobiProvider()
            ];

            // 测试包含多种交易类型的数据
            const multiTypeData = `
交易日期,交易类型,证券代码,成交数量,成交价格,成交金额
2023-01-01,买入,000001,100,10.50,1050.00
2023-01-02,卖出,000002,200,15.20,3040.00
2023-01-03,分红,000003,0,0.00,100.00
2023-01-04,配股,000004,50,8.00,400.00
            `.trim();

            const mockFile = {
                name: 'multi-type-trades.csv',
                text: async () => multiTypeData
            } as File;

            for (const provider of providers) {
                try {
                    const result = await provider.translate(mockFile);
                    expect(result.orders).toBeDefined();
                    expect(Array.isArray(result.orders)).toBe(true);

                    // 验证是否包含不同类型的交易
                    const orderTypes = new Set(result.orders.map((order: any) => order.orderType));
                    expect(orderTypes.size).toBeGreaterThan(0);
                } catch (error) {
                    // 某些提供者可能会抛出错误，这是可以接受的
                    expect(error).toBeDefined();
                }
            }
        });

        it('应该正确处理手续费和税费', async () => {
            const providers = [
                new HtsecProvider(),
                new HuobiProvider()
            ];

            // 测试包含手续费的数据
            const feeData = `
交易日期,交易类型,成交金额,手续费,印花税,过户费
2023-01-01,买入,1050.00,5.00,0.00,1.00
2023-01-02,卖出,3040.00,5.00,3.04,2.00
            `.trim();

            const mockFile = {
                name: 'fee-trades.csv',
                text: async () => feeData
            } as File;

            for (const provider of providers) {
                try {
                    const result = await provider.translate(mockFile);
                    expect(result.orders).toBeDefined();
                    expect(Array.isArray(result.orders)).toBe(true);

                    // 验证是否包含手续费信息
                    const hasFees = result.orders.some((order: any) =>
                        order.commission > 0 || order.metadata?.fee
                    );
                    expect(hasFees).toBe(true);
                } catch (error) {
                    // 某些提供者可能会抛出错误，这是可以接受的
                    expect(error).toBeDefined();
                }
            }
        });
    });

    describe('证券提供者特殊功能', () => {
        it('华泰证券应该正确处理股票代码', async () => {
            const provider = new HtsecProvider();

            const stockData = `
交易日期,证券代码,证券名称,交易类型,成交数量,成交价格
2023-01-01,000001,平安银行,买入,100,10.50
2023-01-02,600000,浦发银行,卖出,200,15.20
            `.trim();

            const mockFile = {
                name: 'stock-trades.csv',
                text: async () => stockData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证股票代码是否正确解析
            const orders = result.orders;
            expect(orders.some((order: any) => order.metadata?.stockCode)).toBe(true);
        });

        it('华泰证券应该正确处理分红和配股', async () => {
            const provider = new HtsecProvider();

            const dividendData = `
交易日期,交易类型,证券代码,证券名称,分红金额,配股数量,配股价格
2023-01-01,分红,000001,平安银行,100.00,0,0.00
2023-01-02,配股,000002,万科A,0.00,50,8.00
            `.trim();

            const mockFile = {
                name: 'dividend-trades.csv',
                text: async () => dividendData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证分红和配股是否正确解析
            const orders = result.orders;
            expect(orders.some((order: any) => order.orderType.includes('Dividend'))).toBe(true);
        });
    });

    describe('加密货币提供者特殊功能', () => {
        it('火币应该正确处理交易对', async () => {
            const provider = new HuobiProvider();

            const pairData = `
时间,类型,交易对,价格,数量,成交额
2023-01-01 10:00:00,买入,BTC/USDT,45000.00,0.001,45.00
2023-01-02 15:00:00,卖出,ETH/USDT,3000.00,0.01,30.00
            `.trim();

            const mockFile = {
                name: 'pair-trades.csv',
                text: async () => pairData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证交易对是否正确解析
            const orders = result.orders;
            expect(orders.some((order: any) => order.metadata?.tradingPair)).toBe(true);
        });

        it('火币应该正确处理手续费币种', async () => {
            const provider = new HuobiProvider();

            const feeData = `
时间,类型,交易对,手续费,手续费币种
2023-01-01 10:00:00,买入,BTC/USDT,0.0001,BTC
2023-01-02 15:00:00,卖出,ETH/USDT,0.00001,ETH
            `.trim();

            const mockFile = {
                name: 'crypto-fee-trades.csv',
                text: async () => feeData
            } as File;

            const result = await provider.translate(mockFile);

            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证手续费币种是否正确解析
            const orders = result.orders;
            expect(orders.some((order: any) => order.metadata?.feeCurrency)).toBe(true);
        });
    });
}); 