import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { BaseProvider } from '../providers/base/base-provider';
import type { FetchParams, IR } from '../types/provider';
import { expect } from 'vitest';

export interface TestConfig {
    defaultMinusAccount: string;
    defaultPlusAccount: string;
    defaultCurrency: string;
    title: string;
    [key: string]: any;
}

export interface TestCase {
    name: string;
    provider: BaseProvider;
    inputFile: string;
    expectedOutputFile: string;
    configFile: string;
    testData: string;
    expectedOutput: string;
    config: TestConfig;
}

export class TestUtils {
    private static readonly EXAMPLE_BASE_PATH = 'public/example';

    /**
     * 从example文件夹读取测试数据
     */
    static loadTestData(providerName: string): TestCase {
        const providerPath = join(this.EXAMPLE_BASE_PATH, providerName);

        // 查找输入文件
        const inputFiles = [
            'example-records.csv',
            'example-data.csv',
            'example-transactions.csv',
            'example-records.xlsx',
            '交易明细_xxxx_2025xxxx_2025xxxx.xls'
        ];
        let inputFile = '';
        for (const file of inputFiles) {
            const fullPath = join(providerPath, file);
            if (existsSync(fullPath)) {
                inputFile = file;
                break;
            }
        }

        if (!inputFile) {
            throw new Error(`未找到${providerName}的输入文件`);
        }

        // 查找输出文件 - 支持多种命名模式
        const outputFiles = [
            'example-output.beancount',
            'expected-output.beancount',
            `example-${providerName}-output.beancount`,
            `expected-${providerName}-output.beancount`,
            'example-output.bean',
            'expected-output.bean',
            `example-${providerName}-output.bean`,
            `expected-${providerName}-output.bean`
        ];
        let expectedOutputFile = '';
        for (const file of outputFiles) {
            const fullPath = join(providerPath, file);
            if (existsSync(fullPath)) {
                expectedOutputFile = file;
                break;
            }
        }

        if (!expectedOutputFile) {
            throw new Error(`未找到${providerName}的期望输出文件`);
        }

        // 读取配置文件
        const configFile = 'config.json';
        const configPath = join(providerPath, configFile);
        if (!existsSync(configPath)) {
            throw new Error(`未找到${providerName}的配置文件`);
        }

        // 读取所有文件内容
        const testData = readFileSync(join(providerPath, inputFile), 'utf-8');
        const expectedOutput = readFileSync(join(providerPath, expectedOutputFile), 'utf-8');
        const configContent = readFileSync(configPath, 'utf-8');

        // 解析JSON配置
        const config = this.parseJsonConfig(configContent);

        return {
            name: providerName,
            provider: null as any, // 将在具体测试中设置
            inputFile,
            expectedOutputFile,
            configFile,
            testData,
            expectedOutput,
            config
        };
    }

    /**
     * 解析JSON配置（简化版本）
     */
    private static parseJsonConfig(content: string): TestConfig {
        const config: TestConfig = {
            defaultMinusAccount: 'Assets:FIXME',
            defaultPlusAccount: 'Expenses:FIXME',
            defaultCurrency: 'CNY',
            title: '测试'
        };

        const json = JSON.parse(content);

        for (const key in json) {
            if (typeof json[key] === 'object' && json[key] !== null) {
                config[key] = json[key];
            } else {
                config[key] = json[key];
            }
        }

        return config;
    }

    /**
     * 验证输出结果
     */
    static validateOutput(actual: IR, expected: string, config: TestConfig): void {
        // 将实际结果转换为beancount格式
        const actualBeancount = this.convertToBeancount(actual, config);

        // 标准化输出格式（移除空白行、排序等）
        const normalizedActual = this.normalizeBeancount(actualBeancount);
        const normalizedExpected = this.normalizeBeancount(expected);

        // 比较结果
        expect(normalizedActual).toBe(normalizedExpected);
    }

    /**
     * 将IR对象转换为beancount格式
     */
    private static convertToBeancount(ir: IR, config: TestConfig): string {
        const lines: string[] = [];

        // 添加头部信息
        lines.push(`option "title" "${config.title}"`);
        lines.push(`option "operating_currency" "${config.defaultCurrency}"`);
        lines.push('');

        // 添加账户声明
        const accounts = new Set<string>();
        for (const order of ir.orders) {
            if (order.minusAccount) accounts.add(order.minusAccount);
            if (order.plusAccount) accounts.add(order.plusAccount);
        }

        for (const account of Array.from(accounts).sort()) {
            lines.push(`1970-01-01 open ${account}`);
        }
        lines.push('');

        // 添加交易记录
        for (const order of ir.orders) {
            const date = order.payTime.toISOString().split('T')[0];
            const description = order.peer || 'Unknown';
            const note = order.note || order.item || '';

            lines.push(`${date} * "${description}" "${note}"`);

            // 添加元数据
            if (order.category) lines.push(`\tcategory: "${order.category}"`);
            if (order.method) lines.push(`\tmethod: "${order.method}"`);
            if (order.orderID) lines.push(`\torderId: "${order.orderID}"`);
            if (order.payTime) {
                const payTimeStr = order.payTime.toISOString().replace('T', ' ').replace('Z', ' +0000 UTC');
                lines.push(`\tpayTime: "${payTimeStr}"`);
            }
            if (order.metadata?.source) lines.push(`\tsource: "${order.metadata.source}"`);
            if (order.metadata?.status) lines.push(`\tstatus: "${order.metadata.status}"`);
            if (order.type) lines.push(`\ttype: "${order.type}"`);

            // 添加账户和金额
            if (order.plusAccount) {
                lines.push(`\t${order.plusAccount} ${order.money} ${order.currency || config.defaultCurrency}`);
            }
            if (order.minusAccount) {
                lines.push(`\t${order.minusAccount} -${order.money} ${order.currency || config.defaultCurrency}`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * 标准化beancount格式
     */
    private static normalizeBeancount(content: string): string {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .sort()
            .join('\n');
    }

    /**
     * 获取所有可用的测试用例
     */
    static getAllTestCases(): string[] {
        // 这里可以根据实际需要返回所有支持的提供者
        return [
            'alipay',
            'wechat',
            'jd',
            'mt',
            'ccb',
            'icbc',
            'td',
            'citic',
            'bmo',
            'hsbchk',
            'htsec',
            'huobi'
        ];
    }

    /**
     * 创建测试参数
     */
    static createTestParams(testCase: TestCase): FetchParams {
        return {
            chain: 'ETH', // 默认值，具体测试中会覆盖
            address: '0x0000000000000000000000000000000000000000', // 默认值，具体测试中会覆盖
            // 其他必要的参数
        };
    }
} 