import { ProviderType } from '../types/provider';
import type { ConfigRule } from '../types/provider';

interface CryptoPresetConfig {
    provider: ProviderType;
    name: string;
    description: string;
    config: {
        defaultMinusAccount: string;
        defaultPlusAccount: string;
        defaultCurrency: string;
        rules: ConfigRule[];
    };
}

export const cryptoPresetConfigs: CryptoPresetConfig[] = [
    {
        provider: ProviderType.Ethereum,
        name: '以太坊基础配置',
        description: '以太坊网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:ETH',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'ETH',
            rules: [
                {
                    pattern: 'ETH Transfer',
                    chain: 'ETH',
                    token: 'ETH',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:ETH',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 1
                },
                {
                    pattern: 'USDT Transfer',
                    chain: 'ETH',
                    token: 'USDT',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:USDT',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 2
                },
                {
                    pattern: 'USDC Transfer',
                    chain: 'ETH',
                    token: 'USDC',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:USDC',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 3
                },
                {
                    pattern: 'Gas Fee',
                    chain: 'ETH',
                    token: 'ETH',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 4
                },
                {
                    pattern: 'DeFi Interaction',
                    chain: 'ETH',
                    transactionType: 'contract',
                    account: 'Expenses:Crypto:DeFi',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 5
                },
                {
                    pattern: 'NFT Transaction',
                    chain: 'ETH',
                    account: 'Assets:Crypto:NFT',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 6
                }
            ]
        }
    },
    {
        provider: ProviderType.BinanceSmartChain,
        name: 'BSC基础配置',
        description: '币安智能链交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:BNB',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'BNB',
            rules: [
                {
                    pattern: 'BNB Transfer',
                    chain: 'BSC',
                    token: 'BNB',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:BNB',
                    methodAccount: 'Assets:Crypto:BNB',
                    priority: 1
                },
                {
                    pattern: 'BUSD Transfer',
                    chain: 'BSC',
                    token: 'BUSD',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:BUSD',
                    methodAccount: 'Assets:Crypto:BNB',
                    priority: 2
                },
                {
                    pattern: 'CAKE Transfer',
                    chain: 'BSC',
                    token: 'CAKE',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:CAKE',
                    methodAccount: 'Assets:Crypto:BNB',
                    priority: 3
                },
                {
                    pattern: 'BSC Gas Fee',
                    chain: 'BSC',
                    token: 'BNB',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:BNB',
                    priority: 4
                }
            ]
        }
    },
    {
        provider: ProviderType.Polygon,
        name: 'Polygon基础配置',
        description: 'Polygon网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:MATIC',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'MATIC',
            rules: [
                {
                    pattern: 'MATIC Transfer',
                    chain: 'POLYGON',
                    token: 'MATIC',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:MATIC',
                    methodAccount: 'Assets:Crypto:MATIC',
                    priority: 1
                },
                {
                    pattern: 'USDC Transfer',
                    chain: 'POLYGON',
                    token: 'USDC',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:USDC',
                    methodAccount: 'Assets:Crypto:MATIC',
                    priority: 2
                },
                {
                    pattern: 'Polygon Gas Fee',
                    chain: 'POLYGON',
                    token: 'MATIC',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:MATIC',
                    priority: 3
                }
            ]
        }
    },
    {
        provider: ProviderType.Arbitrum,
        name: 'Arbitrum基础配置',
        description: 'Arbitrum网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:ETH',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'ETH',
            rules: [
                {
                    pattern: 'Arbitrum ETH Transfer',
                    chain: 'ARBITRUM',
                    token: 'ETH',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:ETH',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 1
                },
                {
                    pattern: 'Arbitrum Gas Fee',
                    chain: 'ARBITRUM',
                    token: 'ETH',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 2
                }
            ]
        }
    },
    {
        provider: ProviderType.Optimism,
        name: 'Optimism基础配置',
        description: 'Optimism网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:ETH',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'ETH',
            rules: [
                {
                    pattern: 'Optimism ETH Transfer',
                    chain: 'OPTIMISM',
                    token: 'ETH',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:ETH',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 1
                },
                {
                    pattern: 'Optimism Gas Fee',
                    chain: 'OPTIMISM',
                    token: 'ETH',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:ETH',
                    priority: 2
                }
            ]
        }
    },
    {
        provider: ProviderType.Avalanche,
        name: 'Avalanche基础配置',
        description: 'Avalanche网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:AVAX',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'AVAX',
            rules: [
                {
                    pattern: 'AVAX Transfer',
                    chain: 'AVALANCHE',
                    token: 'AVAX',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:AVAX',
                    methodAccount: 'Assets:Crypto:AVAX',
                    priority: 1
                },
                {
                    pattern: 'Avalanche Gas Fee',
                    chain: 'AVALANCHE',
                    token: 'AVAX',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:AVAX',
                    priority: 2
                }
            ]
        }
    },
    {
        provider: ProviderType.Solana,
        name: 'Solana基础配置',
        description: 'Solana网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:SOL',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'SOL',
            rules: [
                {
                    pattern: 'SOL Transfer',
                    chain: 'SOLANA',
                    token: 'SOL',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:SOL',
                    methodAccount: 'Assets:Crypto:SOL',
                    priority: 1
                },
                {
                    pattern: 'Solana Transaction Fee',
                    chain: 'SOLANA',
                    token: 'SOL',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:SOL',
                    priority: 2
                }
            ]
        }
    },
    {
        provider: ProviderType.Bitcoin,
        name: 'Bitcoin基础配置',
        description: 'Bitcoin网络交易记录的基础配置模板',
        config: {
            defaultMinusAccount: 'Assets:Crypto:BTC',
            defaultPlusAccount: 'Expenses:Crypto',
            defaultCurrency: 'BTC',
            rules: [
                {
                    pattern: 'BTC Transfer',
                    chain: 'BTC',
                    token: 'BTC',
                    transactionType: 'transfer',
                    account: 'Assets:Crypto:BTC',
                    methodAccount: 'Assets:Crypto:BTC',
                    priority: 1
                },
                {
                    pattern: 'Bitcoin Transaction Fee',
                    chain: 'BTC',
                    token: 'BTC',
                    transactionType: 'gas',
                    account: 'Expenses:Crypto:Gas',
                    methodAccount: 'Assets:Crypto:BTC',
                    priority: 2
                }
            ]
        }
    }
]; 