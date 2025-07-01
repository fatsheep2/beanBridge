import { RuleEngine } from './dist/rule-engine.js';

// 测试规则引擎的账户设置优先级
function testRuleEngine() {
  console.log('开始测试规则引擎...');

  // 创建规则引擎
  const ruleEngine = new RuleEngine([
    {
      pattern: '测试商户',
      account: 'Expenses:Test',
      methodAccount: 'Assets:Test'
    }
  ]);

  // 测试1：提供者已经设置了账户，不应该被覆盖
  console.log('\n测试1：提供者已设置账户');
  const order1 = {
    orderType: 'Normal',
    peer: '测试商户',
    item: '商品',
    category: '日用百货',
    money: 100,
    note: '测试订单',
    payTime: new Date(),
    type: 'Send',
    typeOriginal: '支出',
    txTypeOriginal: '支出',
    method: '余额',
    amount: 100,
    price: 1,
    currency: 'CNY',
    commission: 0,
    units: {},
    extraAccounts: {},
    minusAccount: 'Assets:Alipay', // 提供者已经设置的账户
    plusAccount: 'Expenses:Food',   // 提供者已经设置的账户
    metadata: {},
    tags: []
  };

  const result1 = ruleEngine.applyRules(order1);
  console.log('原始账户:', { minusAccount: order1.minusAccount, plusAccount: order1.plusAccount });
  console.log('结果账户:', { minusAccount: result1.minusAccount, plusAccount: result1.plusAccount });
  console.log('测试1结果:', result1.minusAccount === 'Assets:Alipay' && result1.plusAccount === 'Expenses:Food' ? '通过' : '失败');

  // 测试2：没有设置账户，应该应用规则
  console.log('\n测试2：没有设置账户');
  const order2 = {
    orderType: 'Normal',
    peer: '测试商户',
    item: '商品',
    category: '日用百货',
    money: 100,
    note: '测试订单',
    payTime: new Date(),
    type: 'Send',
    typeOriginal: '支出',
    txTypeOriginal: '支出',
    method: '余额',
    amount: 100,
    price: 1,
    currency: 'CNY',
    commission: 0,
    units: {},
    extraAccounts: {},
    minusAccount: '', // 没有设置账户
    plusAccount: '',  // 没有设置账户
    metadata: {},
    tags: []
  };

  const result2 = ruleEngine.applyRules(order2);
  console.log('原始账户:', { minusAccount: order2.minusAccount, plusAccount: order2.plusAccount });
  console.log('结果账户:', { minusAccount: result2.minusAccount, plusAccount: result2.plusAccount });
  console.log('测试2结果:', result2.minusAccount === 'Assets:Test' && result2.plusAccount === 'Expenses:Test' ? '通过' : '失败');

  // 测试3：账户为FIXME，应该应用规则
  console.log('\n测试3：账户为FIXME');
  const order3 = {
    orderType: 'Normal',
    peer: '测试商户',
    item: '商品',
    category: '日用百货',
    money: 100,
    note: '测试订单',
    payTime: new Date(),
    type: 'Send',
    typeOriginal: '支出',
    txTypeOriginal: '支出',
    method: '余额',
    amount: 100,
    price: 1,
    currency: 'CNY',
    commission: 0,
    units: {},
    extraAccounts: {},
    minusAccount: 'Assets:FIXME', // FIXME账户
    plusAccount: 'Expenses:FIXME', // FIXME账户
    metadata: {},
    tags: []
  };

  const result3 = ruleEngine.applyRules(order3);
  console.log('原始账户:', { minusAccount: order3.minusAccount, plusAccount: order3.plusAccount });
  console.log('结果账户:', { minusAccount: result3.minusAccount, plusAccount: result3.plusAccount });
  console.log('测试3结果:', result3.minusAccount === 'Assets:Test' && result3.plusAccount === 'Expenses:Test' ? '通过' : '失败');

  console.log('\n测试完成！');
}

// 运行测试
testRuleEngine(); 