# BeanBridge 测试框架

本测试框架为 BeanBridge 项目提供了完整的测试覆盖，确保所有解析器都能正确处理各种数据格式并输出符合预期的 beancount 格式。

## 测试结构

### 核心文件

- `test-utils.ts` - 通用测试工具类，提供测试数据加载、验证等功能
- `payment-providers.test.ts` - 支付提供者测试（支付宝、微信、京东、美团）
- `bank-providers.test.ts` - 银行提供者测试（建设银行、工商银行、交通银行等）
- `securities-crypto-providers.test.ts` - 证券和加密货币提供者测试
- `all-providers-integration.test.ts` - 所有提供者的集成测试
- `run-all-tests.ts` - 测试运行器和覆盖率统计

### 测试数据

测试数据位于 `public/example/` 目录下，每个提供者都有自己的子目录：

```
public/example/
├── alipay/
│   ├── config.yaml              # 配置文件
│   ├── example-records.csv      # 输入数据
│   └── example-output.beancount # 期望输出
├── wechat/
├── ccb/
├── icbc/
└── ...
```

## 测试功能

### 1. 数据加载和验证

每个测试用例都会：
- 从 `@example` 对应文件夹读取测试账本文件
- 读取预设配置（YAML格式）
- 验证输出是否符合预期结果

### 2. 测试流程

```typescript
// 1. 加载测试数据
const testCase = TestUtils.loadTestData('alipay');

// 2. 创建提供者实例
const provider = new AlipayProvider();

// 3. 模拟文件数据
const mockFile = {
    name: 'alipay-records.csv',
    text: async () => testCase.testData
} as File;

// 4. 执行解析
const result = await provider.translate(mockFile);

// 5. 验证输出
TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
```

### 3. 覆盖的提供者

#### 支付提供者
- ✅ 支付宝 (Alipay)
- ✅ 微信支付 (Wechat)
- ✅ 京东支付 (JD)
- ✅ 美团支付 (MT)

#### 银行提供者
- ✅ 建设银行 (CCB)
- ✅ 工商银行 (ICBC)
- ✅ 交通银行 (TD)
- ✅ 中信银行 (CITIC)
- ✅ BMO银行 (BMO)
- ✅ 汇丰香港 (HSBC-HK)

#### 证券和加密货币提供者
- ✅ 华泰证券 (HTSEC)
- ✅ 火币 (Huobi)
- ✅ 以太坊 (Ethereum)
- ✅ BSC (Binance Smart Chain)

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
npm test payment-providers.test.ts
npm test bank-providers.test.ts
npm test securities-crypto-providers.test.ts
```

### 运行集成测试

```bash
npm test all-providers-integration.test.ts
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

## 测试配置

### 配置文件格式

每个提供者的配置文件 (`config.yaml`) 包含：

```yaml
defaultMinusAccount: Assets:FIXME
defaultPlusAccount: Expenses:FIXME
defaultCurrency: CNY
title: 测试

# 提供者特定配置
alipay:
  rules:
    - pattern: 餐厅
      account: Expenses:Food
      methodAccount: Assets:Alipay
    - pattern: 超市
      account: Expenses:Groceries
      methodAccount: Assets:Alipay
```

### 测试数据格式

输入数据文件 (`example-records.csv`) 应包含：
- 真实的交易记录数据
- 符合提供者预期的格式
- 包含各种交易类型（收入、支出、转账等）

期望输出文件 (`example-output.beancount`) 应包含：
- 标准的 beancount 格式
- 正确的账户映射
- 完整的交易记录

## 添加新的测试用例

### 1. 创建测试数据目录

```bash
mkdir -p public/example/new-provider
```

### 2. 添加配置文件

```yaml
# public/example/new-provider/config.yaml
defaultMinusAccount: Assets:FIXME
defaultPlusAccount: Expenses:FIXME
defaultCurrency: CNY
title: 新提供者测试

new-provider:
  rules:
    - pattern: 测试商户
      account: Expenses:Test
      methodAccount: Assets:NewProvider
```

### 3. 添加测试数据

```csv
# public/example/new-provider/example-records.csv
交易时间,交易对方,商品说明,收/支,金额,收/支方式,交易状态
2023-01-01 10:00:00,测试商户,商品,支出,100.00,余额,交易成功
```

### 4. 添加期望输出

```beancount
# public/example/new-provider/example-output.beancount
option "title" "新提供者测试"
option "operating_currency" "CNY"

1970-01-01 open Assets:NewProvider
1970-01-01 open Expenses:Test

2023-01-01 * "测试商户" "商品"
    Expenses:Test 100.00 CNY
    Assets:NewProvider -100.00 CNY
```

### 5. 添加测试代码

```typescript
// 在相应的测试文件中添加
describe('新提供者', () => {
    it('应该正确解析新提供者数据', async () => {
        const testCase = TestUtils.loadTestData('new-provider');
        const provider = new NewProvider();
        
        const mockFile = {
            name: 'new-provider-records.csv',
            text: async () => testCase.testData
        } as File;

        const result = await provider.translate(mockFile);
        
        expect(result.orders).toBeDefined();
        expect(result.orders.length).toBeGreaterThan(0);
        
        TestUtils.validateOutput(result, testCase.expectedOutput, testCase.config);
    });
});
```

## 测试最佳实践

### 1. 数据完整性

- 确保测试数据包含各种交易类型
- 验证边界条件和异常情况
- 测试不同货币和金额格式

### 2. 规则验证

- 测试规则匹配的准确性
- 验证账户映射的正确性
- 检查时间相关规则的生效

### 3. 错误处理

- 测试无效文件格式的处理
- 验证空文件的处理
- 检查异常数据的容错性

### 4. 性能测试

- 验证大量数据的处理能力
- 测试复杂规则配置的性能
- 检查内存使用情况

## 故障排除

### 常见问题

1. **测试数据不存在**
   - 检查 `public/example/` 目录结构
   - 确保文件名和路径正确

2. **配置文件格式错误**
   - 验证 YAML 语法
   - 检查必需字段是否存在

3. **输出格式不匹配**
   - 检查 beancount 格式是否正确
   - 验证账户名称和金额格式

4. **测试超时**
   - 检查网络连接（对于API测试）
   - 优化测试数据大小

### 调试技巧

1. **启用详细日志**
   ```typescript
   console.log('测试数据:', testCase.testData);
   console.log('期望输出:', testCase.expectedOutput);
   ```

2. **逐步验证**
   ```typescript
   // 验证解析结果
   console.log('解析结果:', result.orders);
   
   // 验证规则应用
   console.log('规则匹配:', matchedRules);
   ```

3. **使用测试工具**
   ```typescript
   // 验证输出格式
   const actualBeancount = TestUtils.convertToBeancount(result, testCase.config);
   console.log('实际输出:', actualBeancount);
   ```

## 持续集成

测试框架支持持续集成环境：

- 自动运行所有测试
- 生成覆盖率报告
- 验证代码质量
- 确保向后兼容性

通过完善的测试覆盖，确保 BeanBridge 项目的稳定性和可靠性。 