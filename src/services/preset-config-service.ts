import { ProviderType } from '../types/provider';
import type { ProviderConfig } from '../types/provider';
import type { PresetConfig } from '../types/rule-config';

/**
 * 预设配置服务
 * 负责从文件系统加载和管理预设配置
 */
export class PresetConfigService {
    private static readonly EXAMPLE_BASE_PATH = '/example';
    private static configCache: Map<string, PresetConfig> = new Map();

    /**
     * 获取指定提供者的预设配置
     * @param provider 提供者类型
     * @returns 预设配置
     */
    static async getPresetConfig(provider: ProviderType): Promise<PresetConfig | null> {
        // 检查缓存
        if (this.configCache.has(provider)) {
            return this.configCache.get(provider)!;
        }

        try {
            // 从文件系统加载配置
            const config = await this.loadConfigFromFile(provider);
            if (config) {
                this.configCache.set(provider, config);
            }
            return config;
        } catch (error) {
            console.error(`[PresetConfigService] 加载预设配置失败 (${provider}):`, error);
            return null;
        }
    }

    /**
     * 获取所有可用的预设配置
     * @returns 所有预设配置列表
     */
    static async getAllPresetConfigs(): Promise<PresetConfig[]> {
        const providers = this.getSupportedProviders();
        const configs: PresetConfig[] = [];

        for (const provider of providers) {
            try {
                const config = await this.getPresetConfig(provider);
                if (config) {
                    configs.push(config);
                }
            } catch (error) {
                console.warn(`[PresetConfigService] 跳过加载失败的配置 (${provider}):`, error);
            }
        }

        return configs;
    }

    /**
     * 从文件系统加载配置
     * @param provider 提供者类型
     * @returns 预设配置
     */
    private static async loadConfigFromFile(provider: ProviderType): Promise<PresetConfig | null> {
        const configPath = `${this.EXAMPLE_BASE_PATH}/${provider}/config.json`;

        try {
            // 检查是否在测试环境中
            if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
                // 测试环境：使用 Node.js 文件系统 API
                return await this.loadConfigFromFileSystem(provider);
            } else {
                // 浏览器环境：使用 fetch
                return await this.loadConfigFromFetch(configPath);
            }
        } catch (error) {
            console.error(`[PresetConfigService] 读取配置文件失败: ${configPath}`, error);
            return null;
        }
    }

    /**
     * 使用 Node.js 文件系统 API 加载配置（测试环境）
     * @param provider 提供者类型
     * @returns 预设配置
     */
    private static async loadConfigFromFileSystem(provider: ProviderType): Promise<PresetConfig | null> {
        try {
            // 动态导入 Node.js 模块
            const { readFileSync, existsSync } = await import('fs');
            const { join } = await import('path');

            const configPath = join(process.cwd(), 'public', 'example', provider, 'config.json');

            if (!existsSync(configPath)) {
                console.warn(`[PresetConfigService] 配置文件不存在: ${configPath}`);
                return null;
            }

            const configContent = readFileSync(configPath, 'utf-8');
            const configData = JSON.parse(configContent);

            // 验证配置格式
            if (!this.validateConfig(configData)) {
                console.error(`[PresetConfigService] 配置文件格式无效: ${configPath}`);
                return null;
            }

            return configData as PresetConfig;
        } catch (error) {
            console.error(`[PresetConfigService] 文件系统读取失败:`, error);
            return null;
        }
    }

    /**
     * 使用 fetch API 加载配置（浏览器环境）
     * @param configPath 配置文件路径
     * @returns 预设配置
     */
    private static async loadConfigFromFetch(configPath: string): Promise<PresetConfig | null> {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                console.warn(`[PresetConfigService] 配置文件不存在: ${configPath}`);
                return null;
            }

            const configData = await response.json();

            // 验证配置格式
            if (!this.validateConfig(configData)) {
                console.error(`[PresetConfigService] 配置文件格式无效: ${configPath}`);
                return null;
            }

            return configData as PresetConfig;
        } catch (error) {
            console.error(`[PresetConfigService] fetch 读取失败:`, error);
            return null;
        }
    }

    /**
     * 验证配置格式
     * @param config 配置对象
     * @returns 是否有效
     */
    private static validateConfig(config: any): config is PresetConfig {
        return (
            config &&
            typeof config.provider === 'string' &&
            typeof config.name === 'string' &&
            typeof config.description === 'string' &&
            config.config &&
            typeof config.config.defaultCurrency === 'string' &&
            Array.isArray(config.config.rules)
        );
    }

    /**
     * 获取支持的提供者列表
     * @returns 提供者类型列表
     */
    private static getSupportedProviders(): ProviderType[] {
        return [
            ProviderType.Alipay,
            ProviderType.Wechat,
            ProviderType.Jd,
            ProviderType.MT,
            ProviderType.CCB,
            ProviderType.Icbc,
            ProviderType.Td,
            ProviderType.Citic,
            ProviderType.Bmo,
            ProviderType.HsbcHK,
            ProviderType.Htsec,
            ProviderType.Huobi,
            ProviderType.Ethereum,
            ProviderType.BinanceSmartChain,
            ProviderType.Polygon,
            ProviderType.Arbitrum,
            ProviderType.Optimism,
            ProviderType.Avalanche,
            ProviderType.Solana,
            ProviderType.Bitcoin
        ];
    }

    /**
     * 清除缓存
     */
    static clearCache(): void {
        this.configCache.clear();
    }

    /**
     * 检查提供者是否有预设配置
     * @param provider 提供者类型
     * @returns 是否有预设配置
     */
    static async hasPresetConfig(provider: ProviderType): Promise<boolean> {
        const config = await this.getPresetConfig(provider);
        return config !== null;
    }

    /**
     * 获取预设配置的统计信息
     * @returns 统计信息
     */
    static async getStatistics(): Promise<{
        totalProviders: number;
        availableConfigs: number;
        missingConfigs: string[];
    }> {
        const providers = this.getSupportedProviders();
        const availableConfigs: PresetConfig[] = [];
        const missingConfigs: string[] = [];

        for (const provider of providers) {
            const config = await this.getPresetConfig(provider);
            if (config) {
                availableConfigs.push(config);
            } else {
                missingConfigs.push(provider);
            }
        }

        return {
            totalProviders: providers.length,
            availableConfigs: availableConfigs.length,
            missingConfigs
        };
    }
} 