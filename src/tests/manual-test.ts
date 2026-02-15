// 手动测试脚本 - 可以在浏览器控制台中运行
// 使用方法: 复制此代码到浏览器控制台并运行

export class ManualTester {
    private static instance: ManualTester;

    static getInstance(): ManualTester {
        if (!ManualTester.instance) {
            ManualTester.instance = new ManualTester();
        }
        return ManualTester.instance;
    }

    // 测试以太坊提供者
    async testEthereumProvider() {
        console.log('🧪 开始测试以太坊提供者...');

        try {
            // 注意：这里需要真实的API密钥
            const apiKey = prompt('请输入Etherscan API密钥（可选）:') || '';
            const address = prompt('请输入以太坊地址:') || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

            const { EthereumProvider } = await import('../providers/crypto/ethereum-provider');
            const provider = new EthereumProvider(apiKey);

            console.log('✅ 提供者创建成功:', provider.getProviderName());
            console.log('📋 支持的链:', provider.getSupportedChains());
            console.log('🪙 支持的代币:', provider.getSupportedTokens('ETH'));

            const data = await provider.fetchData({
                chain: 'ETH',
                address: address,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
                endDate: new Date()
            });

            console.log('📊 获取到的交易数据:', data);
            console.log('📈 统计信息:', provider.getStatistics());

            return data;
        } catch (error) {
            console.error('❌ 测试失败:', error);
            throw error;
        }
    }

    // 测试规则引擎
    async testRuleEngine() {
        console.log('🧪 开始测试规则引擎...');

        try {
            const { RuleEngine } = await import('../rule-engine');
            const { cryptoPresetConfigs } = await import('../data/crypto-preset-configs');
            const { ProviderType } = await import('../types/provider');

            // 加载以太坊预设配置
            const ethereumConfig = cryptoPresetConfigs.find(config => config.provider === ProviderType.Ethereum);
            if (!ethereumConfig) {
                throw new Error('未找到以太坊预设配置');
            }

            const ruleEngine = new RuleEngine(
                ethereumConfig.config.rules,
                ethereumConfig.config.defaultMinusAccount,
                ethereumConfig.config.defaultPlusAccount
            );

            console.log('✅ 规则引擎创建成功');
            console.log('📋 加载的规则数量:', ruleEngine.getRules().length);
            console.log('🔧 规则列表:', ruleEngine.getRules());

            return ruleEngine;
        } catch (error) {
            console.error('❌ 测试失败:', error);
            throw error;
        }
    }

    // 测试完整流程
    async testFullWorkflow() {
        console.log('🧪 开始测试完整流程...');

        try {
            // 1. 获取数据
            const data = await this.testEthereumProvider();

            // 2. 应用规则
            const ruleEngine = await this.testRuleEngine();
            const processedData = ruleEngine.applyRulesToIR(data);

            console.log('✅ 完整流程测试成功');
            console.log('📊 处理后的数据:', processedData);

            // 3. 分析结果
            this.analyzeResults(processedData);

            return processedData;
        } catch (error) {
            console.error('❌ 完整流程测试失败:', error);
            throw error;
        }
    }

    // 分析结果
    analyzeResults(data: any) {
        console.log('📈 结果分析:');

        const orders = data.orders;
        const totalOrders = orders.length;
        const gasTransactions = orders.filter((o: any) => o.isGasTransaction);
        const mainTransactions = orders.filter((o: any) => !o.isGasTransaction);

        console.log(`📊 总交易数: ${totalOrders}`);
        console.log(`💰 主交易数: ${mainTransactions.length}`);
        console.log(`⛽ 矿工费交易数: ${gasTransactions.length}`);

        // 按代币统计
        const tokenStats = orders.reduce((acc: any, order: any) => {
            const token = order.token || 'Unknown';
            acc[token] = (acc[token] || 0) + 1;
            return acc;
        }, {});

        console.log('🪙 代币分布:', tokenStats);

        // 按交易类型统计
        const typeStats = orders.reduce((acc: any, order: any) => {
            const type = order.transactionType || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        console.log('🔄 交易类型分布:', typeStats);

        // 总矿工费
        const totalGasFees = gasTransactions.reduce((sum: number, order: any) => sum + (order.gasFee || 0), 0);
        console.log(`⛽ 总矿工费: ${totalGasFees} ETH`);
    }

    // 测试预设配置
    async testPresetConfigs() {
        console.log('🧪 开始测试预设配置...');

        try {
            const { cryptoPresetConfigs } = await import('../data/crypto-preset-configs');

            console.log('📋 预设配置列表:');
            cryptoPresetConfigs.forEach((config, index) => {
                console.log(`${index + 1}. ${config.name} (${config.provider})`);
                console.log(`   描述: ${config.description}`);
                console.log(`   规则数量: ${config.config.rules.length}`);
                console.log(`   默认账户: ${config.config.defaultMinusAccount} -> ${config.config.defaultPlusAccount}`);
                console.log('');
            });

            return cryptoPresetConfigs;
        } catch (error) {
            console.error('❌ 测试失败:', error);
            throw error;
        }
    }

    // 测试工厂模式
    async testFactory() {
        console.log('🧪 开始测试工厂模式...');

        try {
            const { CryptoProviderFactory } = await import('../providers/factories/crypto-provider-factory');
            const { ProviderType } = await import('../types/provider');

            console.log('🏭 支持的提供者:', CryptoProviderFactory.getSupportedProviders());

            // 测试创建以太坊提供者
            const ethereumProvider = CryptoProviderFactory.create(ProviderType.Ethereum);
            console.log('✅ 以太坊提供者创建成功:', ethereumProvider.getProviderName());

            // 测试缓存功能
            const ethereumProvider2 = CryptoProviderFactory.create(ProviderType.Ethereum);
            console.log('🔄 缓存测试:', ethereumProvider === ethereumProvider2 ? '✅ 缓存工作正常' : '❌ 缓存失效');

            // 测试不支持的提供者
            try {
                CryptoProviderFactory.create(ProviderType.BinanceSmartChain);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log('✅ 错误处理正常:', errorMessage);
            }

            return CryptoProviderFactory;
        } catch (error: unknown) {
            console.error('❌ 测试失败:', error);
            throw error;
        }
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始运行所有测试...');
        console.log('='.repeat(50));

        try {
            await this.testPresetConfigs();
            console.log('='.repeat(50));

            await this.testFactory();
            console.log('='.repeat(50));

            await this.testRuleEngine();
            console.log('='.repeat(50));

            // 注意：这个测试需要真实的API密钥
            const runEthereumTest = confirm('是否要运行以太坊API测试？（需要API密钥）');
            if (runEthereumTest) {
                await this.testEthereumProvider();
                console.log('='.repeat(50));

                await this.testFullWorkflow();
            }

            console.log('🎉 所有测试完成！');
        } catch (error) {
            console.error('❌ 测试过程中出现错误:', error);
        }
    }
}

// 导出到全局对象，方便在控制台中使用
(window as any).ManualTester = ManualTester;
(window as any).tester = ManualTester.getInstance();

console.log('📝 手动测试器已加载！');
console.log('使用方法:');
console.log('1. tester.testPresetConfigs() - 测试预设配置');
console.log('2. tester.testFactory() - 测试工厂模式');
console.log('3. tester.testRuleEngine() - 测试规则引擎');
console.log('4. tester.testEthereumProvider() - 测试以太坊提供者（需要API密钥）');
console.log('5. tester.testFullWorkflow() - 测试完整流程');
console.log('6. tester.runAllTests() - 运行所有测试'); 