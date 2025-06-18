import { RuleEngine } from '../rule-engine';
import type { ConfigRule } from '../types/provider';
import type { IR, Order } from '../types/provider';
import { OrderType, Type, Unit, Account } from '../types/provider';

// 测试规则引擎
export function testRuleEngine() {
  console.log('开始测试规则引擎...');
  
  // 创建规则引擎实例
  const rules: ConfigRule[] = [
    {
      pattern: '支付宝|alipay',
      account: 'Assets:Alipay',
      tags: ['payment'],
      payee: '支付宝',
      category: '支付'
    },
    {
      pattern: '微信|wechat',
      account: 'Assets:WeChat',
      tags: ['payment'],
      payee: '微信支付',
      category: '支付'
    },
    {
      pattern: '餐饮|食品|外卖',
      account: 'Expenses:Food',
      tags: ['food'],
      payee: '',
      category: '餐饮'
    }
  ];
  
  const ruleEngine = new RuleEngine(rules);
  
  // 创建测试数据
  const testOrders: Order[] = [
    {
      orderType: OrderType.Normal,
      peer: '支付宝',
      item: '转账',
      category: '转账',
      money: -100,
      note: '支付宝转账',
      payTime: new Date(),
      type: Type.Send,
      typeOriginal: '支出',
      txTypeOriginal: '转账',
      method: '支付宝',
      amount: 100,
      price: 1,
      currency: 'CNY',
      commission: 0,
      units: {
        [Unit.BaseUnit]: 'CNY',
        [Unit.TargetUnit]: 'CNY',
        [Unit.CommissionUnit]: 'CNY'
      },
      extraAccounts: {
        [Account.CashAccount]: '',
        [Account.PositionAccount]: '',
        [Account.CommissionAccount]: '',
        [Account.PnlAccount]: '',
        [Account.ThirdPartyCustodyAccount]: '',
        [Account.PlusAccount]: '',
        [Account.MinusAccount]: ''
      },
      minusAccount: '',
      plusAccount: '',
      metadata: {},
      tags: []
    },
    {
      orderType: OrderType.Normal,
      peer: '美团外卖',
      item: '午餐',
      category: '餐饮',
      money: -50,
      note: '美团外卖午餐',
      payTime: new Date(),
      type: Type.Send,
      typeOriginal: '支出',
      txTypeOriginal: '消费',
      method: '微信支付',
      amount: 50,
      price: 1,
      currency: 'CNY',
      commission: 0,
      units: {
        [Unit.BaseUnit]: 'CNY',
        [Unit.TargetUnit]: 'CNY',
        [Unit.CommissionUnit]: 'CNY'
      },
      extraAccounts: {
        [Account.CashAccount]: '',
        [Account.PositionAccount]: '',
        [Account.CommissionAccount]: '',
        [Account.PnlAccount]: '',
        [Account.ThirdPartyCustodyAccount]: '',
        [Account.PlusAccount]: '',
        [Account.MinusAccount]: ''
      },
      minusAccount: '',
      plusAccount: '',
      metadata: {},
      tags: []
    }
  ];
  
  const testIR: IR = { orders: testOrders };
  
  // 测试规则应用
  const processedIR = ruleEngine.applyRulesToIR(testIR);
  
  console.log('原始订单:', testOrders);
  console.log('处理后的订单:', processedIR.orders);
  
  // 测试规则统计
  const stats = ruleEngine.getRuleStats(testIR);
  console.log('规则统计:', stats);
  
  return {
    original: testIR,
    processed: processedIR,
    stats: stats
  };
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，将测试函数挂载到全局对象
  (window as any).testRuleEngine = testRuleEngine;
} 