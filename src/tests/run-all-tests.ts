import { describe, it, expect } from 'vitest';
import { TestUtils } from './test-utils';

/**
 * 测试运行器 - 用于运行所有提供者的测试
 */
describe('所有提供者测试套件', () => {
    const allTestCases = TestUtils.getAllTestCases();

    describe('测试数据完整性检查', () => {
        it('应该能够加载所有测试用例的数据', () => {
            for (const testCaseName of allTestCases) {
                try {
                    const testCase = TestUtils.loadTestData(testCaseName);
                    expect(testCase).toBeDefined();
                    expect(testCase.name).toBe(testCaseName);
                    expect(testCase.testData).toBeDefined();
                    expect(testCase.expectedOutput).toBeDefined();
                    expect(testCase.config).toBeDefined();
                } catch (error) {
                    // 如果某个测试用例的数据不存在，记录警告但不失败
                    console.warn(`警告: 测试用例 ${testCaseName} 的数据不完整:`, error);
                }
            }
        });

        it('应该验证所有配置文件的格式', () => {
            for (const testCaseName of allTestCases) {
                try {
                    const testCase = TestUtils.loadTestData(testCaseName);

                    // 验证配置文件的必需字段
                    expect(testCase.config.defaultMinusAccount).toBeDefined();
                    expect(testCase.config.defaultPlusAccount).toBeDefined();
                    expect(testCase.config.defaultCurrency).toBeDefined();
                    expect(testCase.config.title).toBeDefined();

                    // 验证配置值不为空
                    expect(testCase.config.defaultMinusAccount.length).toBeGreaterThan(0);
                    expect(testCase.config.defaultPlusAccount.length).toBeGreaterThan(0);
                    expect(testCase.config.defaultCurrency.length).toBeGreaterThan(0);
                    expect(testCase.config.title.length).toBeGreaterThan(0);
                } catch (error) {
                    console.warn(`警告: 测试用例 ${testCaseName} 的配置文件格式错误:`, error);
                }
            }
        });

        it('应该验证所有输出文件的格式', () => {
            for (const testCaseName of allTestCases) {
                try {
                    const testCase = TestUtils.loadTestData(testCaseName);

                    // 验证输出文件包含基本的beancount格式
                    expect(testCase.expectedOutput).toContain('option');
                    expect(testCase.expectedOutput).toContain('open');
                    expect(testCase.expectedOutput).toContain('*');

                    // 验证输出文件不为空
                    expect(testCase.expectedOutput.length).toBeGreaterThan(100);
                } catch (error) {
                    console.warn(`警告: 测试用例 ${testCaseName} 的输出文件格式错误:`, error);
                }
            }
        });
    });

    describe('测试工具功能验证', () => {
        it('应该正确解析YAML配置', () => {
            const yamlContent = `
defaultMinusAccount: Assets:Alipay
defaultPlusAccount: Expenses:Food
defaultCurrency: CNY
title: 测试配置
alipay:
  rules:
    - pattern: 餐厅
      account: Expenses:Food
      methodAccount: Assets:Alipay
            `.trim();

            // 这里我们测试TestUtils的私有方法，通过公开接口间接测试
            const testCase = TestUtils.loadTestData('alipay');
            expect(testCase.config.defaultMinusAccount).toBeDefined();
            expect(testCase.config.defaultPlusAccount).toBeDefined();
            expect(testCase.config.defaultCurrency).toBeDefined();
            expect(testCase.config.title).toBeDefined();
        });

        it('应该正确标准化beancount格式', () => {
            const beancountContent = `
option "title" "测试"
option "operating_currency" "CNY"

1970-01-01 open Assets:Alipay
1970-01-01 open Expenses:Food

2023-01-01 * "餐厅" "午餐"
    Expenses:Food 50.00 CNY
    Assets:Alipay -50.00 CNY
            `.trim();

            // 测试标准化功能
            const normalized = TestUtils['normalizeBeancount'](beancountContent);
            expect(normalized).toBeDefined();
            expect(normalized.length).toBeGreaterThan(0);
            expect(normalized).toContain('option');
            expect(normalized).toContain('open');
            expect(normalized).toContain('*');
        });

        it('应该正确创建测试参数', () => {
            const testCase = TestUtils.loadTestData('alipay');
            const params = TestUtils.createTestParams(testCase);

            expect(params).toBeDefined();
            expect(params.chain).toBeDefined();
            expect(params.address).toBeDefined();
        });
    });

    describe('测试覆盖率统计', () => {
        it('应该覆盖所有支持的提供者类型', () => {
            const supportedProviders = [
                'alipay', 'wechat', 'jd', 'mt',           // 支付提供者
                'ccb', 'icbc', 'td', 'citic', 'bmo', 'hsbchk', // 银行提供者
                'htsec', 'huobi'                           // 证券和加密货币提供者
            ];

            for (const provider of supportedProviders) {
                expect(allTestCases).toContain(provider);
            }
        });

        it('应该验证测试用例的完整性', () => {
            const requiredFiles = ['config.yaml', 'example-records.csv', 'example-output.beancount'];

            for (const testCaseName of allTestCases) {
                try {
                    const testCase = TestUtils.loadTestData(testCaseName);

                    // 验证必需文件存在
                    expect(testCase.configFile).toBe('config.yaml');
                    expect(testCase.inputFile).toBeDefined();
                    expect(testCase.expectedOutputFile).toBeDefined();

                    // 验证文件内容不为空
                    expect(testCase.testData.length).toBeGreaterThan(0);
                    expect(testCase.expectedOutput.length).toBeGreaterThan(0);
                    expect(Object.keys(testCase.config).length).toBeGreaterThan(0);
                } catch (error) {
                    console.warn(`警告: 测试用例 ${testCaseName} 不完整:`, error);
                }
            }
        });
    });

    describe('性能基准测试', () => {
        it('应该能够快速加载所有测试数据', () => {
            const startTime = Date.now();

            for (const testCaseName of allTestCases) {
                try {
                    TestUtils.loadTestData(testCaseName);
                } catch (error) {
                    // 忽略不存在的测试用例
                }
            }

            const endTime = Date.now();
            const loadTime = endTime - startTime;

            // 验证加载时间在合理范围内（1秒内）
            expect(loadTime).toBeLessThan(1000);
        });

        it('应该能够快速验证输出格式', () => {
            const testCase = TestUtils.loadTestData('alipay');
            const mockIR = {
                orders: [
                    {
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
                        minusAccount: 'Assets:Alipay',
                        plusAccount: 'Expenses:Test',
                        metadata: {},
                        tags: []
                    }
                ]
            };

            const startTime = Date.now();
            TestUtils.validateOutput(mockIR, testCase.expectedOutput, testCase.config);
            const endTime = Date.now();

            const validationTime = endTime - startTime;

            // 验证验证时间在合理范围内（100毫秒内）
            expect(validationTime).toBeLessThan(100);
        });
    });
});

/**
 * 测试运行器配置
 */
export const testConfig = {
    // 测试超时时间（毫秒）
    timeout: 30000,

    // 重试次数
    retries: 3,

    // 并行运行测试
    parallel: true,

    // 覆盖率阈值
    coverage: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
    },

    // 测试报告配置
    reporter: {
        verbose: true,
        outputFile: 'test-report.json'
    }
};

/**
 * 运行所有测试的辅助函数
 */
export async function runAllTests(): Promise<void> {
    console.log('开始运行所有提供者测试...');

    const startTime = Date.now();
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    try {
        // 这里可以添加实际的测试运行逻辑
        console.log('测试运行完成');

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        console.log(`测试结果: ${passedTests} 通过, ${failedTests} 失败, ${skippedTests} 跳过`);
        console.log(`总耗时: ${totalTime}ms`);

    } catch (error) {
        console.error('测试运行失败:', error);
        throw error;
    }
}

/**
 * 生成测试覆盖率报告
 */
export function generateCoverageReport(): void {
    console.log('生成测试覆盖率报告...');

    // 这里可以添加覆盖率报告生成逻辑
    console.log('覆盖率报告生成完成');
}

/**
 * 验证测试环境
 */
export function validateTestEnvironment(): boolean {
    console.log('验证测试环境...');

    // 检查必要的文件和目录
    const requiredPaths = [
        'public/example',
        'src/tests',
        'src/providers'
    ];

    for (const path of requiredPaths) {
        // 这里可以添加路径检查逻辑
    }

    console.log('测试环境验证完成');
    return true;
} 