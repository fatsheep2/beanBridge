import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PresetConfigService } from '../services/preset-config-service';
import { ProviderType } from '../types/provider';

describe('PresetConfigService', () => {
    beforeEach(() => {
        // 清除缓存
        PresetConfigService.clearCache();
    });

    afterEach(() => {
        // 清理缓存
        PresetConfigService.clearCache();
    });

    describe('getPresetConfig', () => {
        it('应该能够加载支付宝预设配置', async () => {
            const config = await PresetConfigService.getPresetConfig(ProviderType.Alipay);

            expect(config).toBeDefined();
            expect(config?.provider).toBe('alipay');
            expect(config?.name).toBe('支付宝基础配置');
            expect(config?.config.defaultCurrency).toBe('CNY');
            expect(config?.config.rules).toBeInstanceOf(Array);
            expect(config?.config.rules.length).toBeGreaterThan(0);
        });

        it('应该能够加载微信支付预设配置', async () => {
            const config = await PresetConfigService.getPresetConfig(ProviderType.Wechat);

            expect(config).toBeDefined();
            expect(config?.provider).toBe('wechat');
            expect(config?.name).toBe('微信支付基础配置');
            expect(config?.config.defaultCurrency).toBe('CNY');
            expect(config?.config.rules).toBeInstanceOf(Array);
            expect(config?.config.rules.length).toBeGreaterThan(0);
        });

        it('应该能够加载建设银行预设配置', async () => {
            const config = await PresetConfigService.getPresetConfig(ProviderType.CCB);

            expect(config).toBeDefined();
            expect(config?.provider).toBe('ccb');
            expect(config?.name).toBe('建设银行基础配置');
            expect(config?.config.defaultCurrency).toBe('CNY');
            expect(config?.config.rules).toBeInstanceOf(Array);
            expect(config?.config.rules.length).toBeGreaterThan(0);
        });

        it('应该能够加载火币交易所预设配置', async () => {
            const config = await PresetConfigService.getPresetConfig(ProviderType.Huobi);

            expect(config).toBeDefined();
            expect(config?.provider).toBe('huobi');
            expect(config?.name).toBe('火币交易所基础配置');
            expect(config?.config.defaultCurrency).toBe('CNY');
            expect(config?.config.rules).toBeInstanceOf(Array);
            expect(config?.config.rules.length).toBeGreaterThan(0);
        });

        it('应该能够加载以太坊预设配置', async () => {
            const config = await PresetConfigService.getPresetConfig(ProviderType.Ethereum);

            expect(config).toBeDefined();
            expect(config?.provider).toBe('ethereum');
            expect(config?.name).toBe('以太坊基础配置');
            expect(config?.config.defaultCurrency).toBe('ETH');
            expect(config?.config.rules).toBeInstanceOf(Array);
            expect(config?.config.rules.length).toBeGreaterThan(0);
        });

        it('对于不存在的配置应该返回null', async () => {
            const config = await PresetConfigService.getPresetConfig('nonexistent' as ProviderType);
            expect(config).toBeNull();
        });
    });

    describe('getAllPresetConfigs', () => {
        it('应该能够加载所有可用的预设配置', async () => {
            const configs = await PresetConfigService.getAllPresetConfigs();

            expect(configs).toBeInstanceOf(Array);
            expect(configs.length).toBeGreaterThan(0);

            // 验证每个配置都有正确的结构
            for (const config of configs) {
                expect(config.provider).toBeDefined();
                expect(config.name).toBeDefined();
                expect(config.description).toBeDefined();
                expect(config.config).toBeDefined();
                expect(config.config.defaultCurrency).toBeDefined();
                expect(config.config.rules).toBeInstanceOf(Array);
            }
        });
    });

    describe('hasPresetConfig', () => {
        it('应该正确检测有预设配置的提供者', async () => {
            const hasAlipay = await PresetConfigService.hasPresetConfig(ProviderType.Alipay);
            expect(hasAlipay).toBe(true);

            const hasWechat = await PresetConfigService.hasPresetConfig(ProviderType.Wechat);
            expect(hasWechat).toBe(true);
        });

        it('应该正确检测没有预设配置的提供者', async () => {
            const hasNonexistent = await PresetConfigService.hasPresetConfig('nonexistent' as ProviderType);
            expect(hasNonexistent).toBe(false);
        });
    });

    describe('getStatistics', () => {
        it('应该返回正确的统计信息', async () => {
            const stats = await PresetConfigService.getStatistics();

            expect(stats.totalProviders).toBeGreaterThan(0);
            expect(stats.availableConfigs).toBeGreaterThan(0);
            expect(stats.availableConfigs).toBeLessThanOrEqual(stats.totalProviders);
            expect(stats.missingConfigs).toBeInstanceOf(Array);
        });
    });

    describe('缓存机制', () => {
        it('应该正确缓存配置', async () => {
            // 第一次加载
            const config1 = await PresetConfigService.getPresetConfig(ProviderType.Alipay);
            expect(config1).toBeDefined();

            // 第二次加载应该从缓存获取
            const config2 = await PresetConfigService.getPresetConfig(ProviderType.Alipay);
            expect(config2).toBe(config1);
        });

        it('清除缓存后应该重新加载', async () => {
            // 第一次加载
            const config1 = await PresetConfigService.getPresetConfig(ProviderType.Alipay);
            expect(config1).toBeDefined();

            // 清除缓存
            PresetConfigService.clearCache();

            // 重新加载
            const config2 = await PresetConfigService.getPresetConfig(ProviderType.Alipay);
            expect(config2).toBeDefined();
            expect(config2).not.toBe(config1); // 应该是新的对象
        });
    });
}); 