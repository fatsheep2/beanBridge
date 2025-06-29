import type { DataProviderInterface, FetchParams, IR } from '../../types/provider';
import { ProviderType } from '../../types/provider';
import { EthereumProvider } from '../crypto/ethereum-provider';

export class CryptoProviderFactory {
    private static providers: Map<ProviderType, DataProviderInterface> = new Map();

    static create(providerType: ProviderType, apiKey?: string): DataProviderInterface {
        // 检查是否已经创建过该类型的提供者
        if (this.providers.has(providerType)) {
            return this.providers.get(providerType)!;
        }

        let provider: DataProviderInterface;

        switch (providerType) {
            case ProviderType.Ethereum:
                provider = new EthereumProvider(apiKey);
                break;
            case ProviderType.BinanceSmartChain:
                // TODO: 实现BSC提供者
                throw new Error('BSC provider not implemented yet');
            case ProviderType.Polygon:
                // TODO: 实现Polygon提供者
                throw new Error('Polygon provider not implemented yet');
            case ProviderType.Arbitrum:
                // TODO: 实现Arbitrum提供者
                throw new Error('Arbitrum provider not implemented yet');
            case ProviderType.Optimism:
                // TODO: 实现Optimism提供者
                throw new Error('Optimism provider not implemented yet');
            case ProviderType.Avalanche:
                // TODO: 实现Avalanche提供者
                throw new Error('Avalanche provider not implemented yet');
            case ProviderType.Solana:
                // TODO: 实现Solana提供者
                throw new Error('Solana provider not implemented yet');
            case ProviderType.Bitcoin:
                // TODO: 实现Bitcoin提供者
                throw new Error('Bitcoin provider not implemented yet');
            default:
                throw new Error(`Unsupported crypto provider type: ${providerType}`);
        }

        // 缓存提供者实例
        this.providers.set(providerType, provider);
        return provider;
    }

    static getSupportedProviders(): ProviderType[] {
        return [
            ProviderType.Ethereum,
            // 其他提供者将在实现后添加
        ];
    }

    static isCryptoProvider(providerType: ProviderType): boolean {
        return [
            ProviderType.Ethereum,
            ProviderType.BinanceSmartChain,
            ProviderType.Polygon,
            ProviderType.Arbitrum,
            ProviderType.Optimism,
            ProviderType.Avalanche,
            ProviderType.Solana,
            ProviderType.Bitcoin
        ].includes(providerType);
    }

    static clearCache(): void {
        this.providers.clear();
    }

    static setApiKey(providerType: ProviderType, apiKey: string): void {
        const provider = this.providers.get(providerType);
        if (provider && 'setApiKey' in provider) {
            (provider as any).setApiKey(apiKey);
        }
    }

    static setRpcUrl(providerType: ProviderType, rpcUrl: string): void {
        const provider = this.providers.get(providerType);
        if (provider && 'setRpcUrl' in provider) {
            (provider as any).setRpcUrl(rpcUrl);
        }
    }
} 