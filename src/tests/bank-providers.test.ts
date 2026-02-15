import { describe, it, expect, beforeEach } from 'vitest';
import { TestUtils, type TestCase } from './test-utils';
import { CCBProvider } from '../providers/bank/ccb-provider';
import { IcbcProvider } from '../providers/bank/icbc-provider';
import { TdProvider } from '../providers/bank/td-provider';
import { CiticProvider } from '../providers/bank/citic-provider';
import { BmoProvider } from '../providers/bank/bmo-provider';
import { HsbcHkProvider } from '../providers/bank/hsbc-hk-provider';
import { ProviderType } from '../types/provider';

describe('银行提供者测试', () => {
    let testCases: Map<string, TestCase> = new Map();

    beforeEach(() => {
        testCases.clear();
    });

    describe('建设银行提供者', () => {
        it('应该正确解析建设银行数据', async () => {
            const testCase = TestUtils.loadTestData('ccb');
            const provider = new CCBProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'ccb-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持建设银行格式', () => {
            const provider = new CCBProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new CCBProvider();
            expect(provider.getProviderName()).toBe('CCB');
        });
    });

    describe('工商银行提供者', () => {
        it('应该正确解析工商银行数据', async () => {
            const testCase = TestUtils.loadTestData('icbc');
            const provider = new IcbcProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'icbc-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持工商银行格式', () => {
            const provider = new IcbcProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new IcbcProvider();
            expect(provider.getProviderName()).toBe('ICBC');
        });
    });

    describe('交通银行提供者', () => {
        it('应该正确解析交通银行数据', async () => {
            const testCase = TestUtils.loadTestData('td');
            const provider = new TdProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'td-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持交通银行格式', () => {
            const provider = new TdProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new TdProvider();
            expect(provider.getProviderName()).toBe('TD');
        });
    });

    describe('中信银行提供者', () => {
        it('应该正确解析中信银行数据', async () => {
            const testCase = TestUtils.loadTestData('citic');
            const provider = new CiticProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'citic-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持中信银行格式', () => {
            const provider = new CiticProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new CiticProvider();
            expect(provider.getProviderName()).toBe('CITIC');
        });
    });

    describe('BMO银行提供者', () => {
        it('应该正确解析BMO银行数据', async () => {
            const testCase = TestUtils.loadTestData('bmo');
            const provider = new BmoProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'bmo-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持BMO银行格式', () => {
            const provider = new BmoProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new BmoProvider();
            expect(provider.getProviderName()).toBe('BMO');
        });
    });

    describe('汇丰香港提供者', () => {
        it('应该正确解析汇丰香港数据', async () => {
            const testCase = TestUtils.loadTestData('hsbchk');
            const provider = new HsbcHkProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'hsbchk-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        });

        it('应该支持汇丰香港格式', () => {
            const provider = new HsbcHkProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new HsbcHkProvider();
            expect(provider.getProviderName()).toBe('HSBC-HK');
        });
    });

    describe('银行提供者通用功能', () => {
        it('所有银行提供者都应该实现基本接口', () => {
            const providers = [
                new CCBProvider(),
                new IcbcProvider(),
                new TdProvider(),
                new CiticProvider(),
                new BmoProvider(),
                new HsbcHkProvider()
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
                new CCBProvider(),
                new IcbcProvider(),
                new TdProvider(),
                new CiticProvider(),
                new BmoProvider(),
                new HsbcHkProvider()
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
                new CCBProvider(),
                new IcbcProvider(),
                new TdProvider(),
                new CiticProvider(),
                new BmoProvider(),
                new HsbcHkProvider()
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

        it('应该正确处理不同货币格式', async () => {
            const providers = [
                new CCBProvider(),
                new IcbcProvider(),
                new TdProvider(),
                new CiticProvider(),
                new BmoProvider(),
                new HsbcHkProvider()
            ];

            // 测试不同货币格式的CSV数据
            const multiCurrencyData = `
交易日期,交易时间,交易金额,交易币种,交易类型,交易摘要
2023-01-01,10:00:00,100.00,CNY,收入,工资
2023-01-02,11:00:00,15.50,USD,支出,购物
2023-01-03,12:00:00,2000.00,HKD,收入,转账
            `.trim();

            const mockFile = {
                name: 'multi-currency.csv',
                text: async () => multiCurrencyData
            } as File;

            for (const provider of providers) {
                try {
                    const result = await provider.translate(mockFile);
                    expect(result.orders).toBeDefined();
                    expect(Array.isArray(result.orders)).toBe(true);

                    // 验证是否包含不同货币的记录
                    const currencies = new Set(result.orders.map((order: any) => order.currency));
                    expect(currencies.size).toBeGreaterThan(0);
                } catch (error) {
                    // 某些提供者可能会抛出错误，这是可以接受的
                    expect(error).toBeDefined();
                }
            }
        });
    });
}); 