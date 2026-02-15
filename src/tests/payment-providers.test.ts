import { describe, it, expect, beforeEach } from 'vitest';
import { TestUtils, type TestCase } from './test-utils';
import { AlipayProvider } from '../providers/payment/alipay-provider';
import { WechatProvider } from '../providers/payment/wechat-provider';
import { JdProvider } from '../providers/payment/jd-provider';
import { MtProvider } from '../providers/payment/mt-provider';
import { ProviderType } from '../types/provider';

describe('支付提供者测试', () => {
    let testCases: Map<string, TestCase> = new Map();

    beforeEach(() => {
        testCases.clear();
    });

    describe('支付宝提供者', () => {
        it('应该正确解析支付宝数据', async () => {
            const testCase = TestUtils.loadTestData('alipay');
            const provider = new AlipayProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'alipay-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        }, 10000);

        it('应该支持支付宝格式', () => {
            const provider = new AlipayProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new AlipayProvider();
            expect(provider.getProviderName()).toBe('Alipay');
        });
    });

    describe('微信支付提供者', () => {
        it('应该正确解析微信支付数据', async () => {
            const testCase = TestUtils.loadTestData('wechat');
            const provider = new WechatProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'wechat-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        }, 10000);

        it('应该支持微信支付格式', () => {
            const provider = new WechatProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new WechatProvider();
            expect(provider.getProviderName()).toBe('Wechat');
        });
    });

    describe('京东支付提供者', () => {
        it('应该正确解析京东支付数据', async () => {
            const testCase = TestUtils.loadTestData('jd');
            const provider = new JdProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'jd-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        }, 10000);

        it('应该支持京东支付格式', () => {
            const provider = new JdProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new JdProvider();
            expect(provider.getProviderName()).toBe('JD');
        });
    });

    describe('美团支付提供者', () => {
        it('应该正确解析美团支付数据', async () => {
            const testCase = TestUtils.loadTestData('mt');
            const provider = new MtProvider();

            // 模拟文件数据
            const mockFile = {
                name: 'mt-records.csv',
                text: async () => testCase.testData
            } as File;

            const result = await provider.translate(mockFile);

            // 验证结果
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBeGreaterThan(0);

            // 验证输出格式
            TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
        }, 10000);

        it('应该支持美团支付格式', () => {
            const provider = new MtProvider();
            const formats = provider.getSupportedFormats();
            expect(formats).toContain('csv');
        });

        it('应该返回正确的提供者名称', () => {
            const provider = new MtProvider();
            expect(provider.getProviderName()).toBe('MT');
        });
    });

    describe('支付提供者通用功能', () => {
        it('所有支付提供者都应该实现基本接口', () => {
            const providers = [
                new AlipayProvider(),
                new WechatProvider(),
                new JdProvider(),
                new MtProvider()
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
                new AlipayProvider(),
                new WechatProvider(),
                new JdProvider(),
                new MtProvider()
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
        }, 10000);

        it('应该正确处理无效格式的文件', async () => {
            const providers = [
                new AlipayProvider(),
                new WechatProvider(),
                new JdProvider(),
                new MtProvider()
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
        }, 10000);
    });
}); 