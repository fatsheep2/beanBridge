import { describe, it, expect, beforeEach } from 'vitest';
import { RuleEngine } from '../rule-engine';
import type { ConfigRule, IR, Order } from '../types/provider';
import { ProviderType, Type, OrderType, BlockchainNetwork, CryptoTransactionType, Unit, Account } from '../types/provider';

describe('规则引擎区块链功能测试', () => {
    let ruleEngine: RuleEngine;

    beforeEach(() => {
        ruleEngine = new RuleEngine();
    });

    describe('区块链字段匹配', () => {
        it('应该匹配区块链网络', () => {
            const rule: ConfigRule = {
                pattern: 'ETH Transfer',
                account: 'Assets:Crypto:ETH',
                chain: BlockchainNetwork.Ethereum
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1,
                note: 'Ethereum transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 1,
                price: 1,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Transfer
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('ETH Transfer');
        });

        it('应该匹配代币类型', () => {
            const rule: ConfigRule = {
                pattern: 'USDT Transfer',
                account: 'Assets:Crypto:USDT',
                token: 'USDT'
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'USDT Transfer',
                category: 'Token Transfer',
                money: 100,
                note: 'USDT transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 100,
                price: 100,
                currency: 'USDT',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'USDT',
                    [Unit.TargetUnit]: 'USDT',
                    [Unit.CommissionUnit]: 'USDT'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'USDT',
                transactionType: CryptoTransactionType.Transfer
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('USDT Transfer');
        });

        it('应该匹配交易类型', () => {
            const rule: ConfigRule = {
                pattern: 'Gas Fee',
                account: 'Expenses:Crypto:Gas',
                transactionType: CryptoTransactionType.Gas
            };

            const order: Order = {
                orderType: OrderType.CryptoGas,
                peer: 'Ethereum Network',
                item: 'Gas Fee',
                category: 'Transaction Fee',
                money: 0.001,
                note: 'Gas fee for transaction',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Gas Fee',
                txTypeOriginal: 'Gas Fee',
                method: 'Ethereum',
                amount: 0.001,
                price: 0.001,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Gas,
                gasFee: 0.001,
                gasToken: 'ETH',
                isGasTransaction: true
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('Gas Fee');
        });

        it('应该匹配矿工费范围', () => {
            const rule: ConfigRule = {
                pattern: 'High Gas Fee',
                account: 'Expenses:Crypto:Gas:High',
                minGasFee: 0.01,
                maxGasFee: 0.1
            };

            const order: Order = {
                orderType: OrderType.CryptoGas,
                peer: 'Ethereum Network',
                item: 'Gas Fee',
                category: 'Transaction Fee',
                money: 0.05,
                note: 'High gas fee',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Gas Fee',
                txTypeOriginal: 'Gas Fee',
                method: 'Ethereum',
                amount: 0.05,
                price: 0.05,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Gas,
                gasFee: 0.05,
                gasToken: 'ETH',
                isGasTransaction: true
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('High Gas Fee');
        });

        it('应该匹配地址', () => {
            const rule: ConfigRule = {
                pattern: 'From Specific Address',
                account: 'Assets:Crypto:ETH',
                fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1,
                note: 'Transfer from specific address',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 1,
                price: 1,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Transfer,
                fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7'
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('From Specific Address');
        });
    });

    describe('复杂规则匹配', () => {
        it('应该匹配多个区块链字段', () => {
            const rule: ConfigRule = {
                pattern: 'ETH USDT Transfer',
                account: 'Assets:Crypto:USDT',
                chain: BlockchainNetwork.Ethereum,
                token: 'USDT',
                transactionType: CryptoTransactionType.Transfer,
                minGasFee: 0.001,
                maxGasFee: 0.01
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'USDT Transfer',
                category: 'Token Transfer',
                money: 100,
                note: 'USDT transfer on Ethereum',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 100,
                price: 100,
                currency: 'USDT',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'USDT',
                    [Unit.TargetUnit]: 'USDT',
                    [Unit.CommissionUnit]: 'USDT'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'USDT',
                transactionType: CryptoTransactionType.Transfer,
                gasFee: 0.005
            };

            ruleEngine.addRule(rule);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(1);
            expect(matchedRules[0].pattern).toBe('ETH USDT Transfer');
        });

        it('应该按优先级排序规则', () => {
            const rule1: ConfigRule = {
                pattern: 'General ETH Transfer',
                account: 'Assets:Crypto:ETH',
                chain: BlockchainNetwork.Ethereum,
                priority: 1
            };

            const rule2: ConfigRule = {
                pattern: 'Specific ETH Transfer',
                account: 'Assets:Crypto:ETH:Specific',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Transfer,
                priority: 10
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1,
                note: 'Specific ETH transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 1,
                price: 1,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Transfer
            };

            ruleEngine.addRule(rule1);
            ruleEngine.addRule(rule2);
            const matchedRules = ruleEngine.findAllMatchingRulesSorted(order);
            expect(matchedRules).toHaveLength(2);
            expect(matchedRules[0].pattern).toBe('Specific ETH Transfer'); // 更高优先级
            expect(matchedRules[1].pattern).toBe('General ETH Transfer');
        });
    });

    describe('规则应用', () => {
        it('应该正确应用区块链规则', () => {
            const rule: ConfigRule = {
                pattern: 'ETH Transfer',
                account: 'Assets:Crypto:ETH',
                methodAccount: 'Assets:Crypto:ETH',
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH'
            };

            const order: Order = {
                orderType: OrderType.CryptoTransfer,
                peer: '0x1234567890abcdef',
                item: 'ETH Transfer',
                category: 'Cryptocurrency',
                money: 1,
                note: 'Ethereum transfer',
                payTime: new Date(),
                type: Type.Send,
                typeOriginal: 'Send',
                txTypeOriginal: 'Send',
                method: 'Ethereum',
                amount: 1,
                price: 1,
                currency: 'ETH',
                commission: 0,
                units: {
                    [Unit.BaseUnit]: 'ETH',
                    [Unit.TargetUnit]: 'ETH',
                    [Unit.CommissionUnit]: 'ETH'
                },
                extraAccounts: {
                    [Account.CashAccount]: 'Assets:FIXME',
                    [Account.PositionAccount]: 'Assets:FIXME',
                    [Account.CommissionAccount]: 'Expenses:FIXME',
                    [Account.PnlAccount]: 'Income:FIXME',
                    [Account.ThirdPartyCustodyAccount]: 'Assets:FIXME',
                    [Account.PlusAccount]: 'Expenses:FIXME',
                    [Account.MinusAccount]: 'Assets:FIXME'
                },
                minusAccount: 'Assets:FIXME',
                plusAccount: 'Expenses:FIXME',
                metadata: {},
                tags: [],
                chain: BlockchainNetwork.Ethereum,
                token: 'ETH',
                transactionType: CryptoTransactionType.Transfer
            };

            ruleEngine.addRule(rule);
            const result = ruleEngine.applyRules(order);

            expect(result.minusAccount).toBe('Assets:Crypto:ETH');
            expect(result.plusAccount).toBe('Assets:Crypto:ETH');
        });
    });
}); 