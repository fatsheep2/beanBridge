# 预设配置系统

## 概述

BeanBridge 的预设配置系统已经重构，现在支持从文件系统动态加载 JSON 格式的配置文件，而不是硬编码在代码中。这使得配置更加灵活、易于维护和扩展。

## 主要改进

### 1. 文件系统配置
- 每个解析器的预设配置现在存储在 `public/example/{provider}/config.json` 文件中
- 配置格式从 YAML 改为 JSON，更易于解析和编辑
- 支持动态加载，无需重新编译代码

### 2. 缓存机制
- 实现了配置缓存，提高加载性能
- 支持缓存清理和重新加载
- 避免重复的文件系统访问

### 3. 向后兼容
- 保留了原有的硬编码配置作为备用
- 如果文件系统配置不存在，会自动回退到硬编码配置
- 确保系统的稳定性和可靠性

## 配置文件结构

每个解析器的配置文件都遵循以下结构：

```json
{
  "provider": "alipay",
  "name": "支付宝基础配置",
  "description": "支付宝交易记录的基础配置模板",
  "config": {
    "defaultMinusAccount": "Assets:FIXME",
    "defaultPlusAccount": "Expenses:FIXME",
    "defaultCurrency": "CNY",
    "rules": [
      {
        "name": "规则名称",
        "description": "规则描述",
        "priority": 1,
        "targetAccount": "目标账户",
        "methodAccount": "方法账户",
        // 其他规则字段...
      }
    ]
  }
}
```

## 支持的解析器

目前已经为以下解析器创建了配置文件：

### 支付平台
- ✅ 支付宝 (`alipay`)
- ✅ 微信支付 (`wechat`)
- ✅ 京东 (`jd`)
- ✅ 美团 (`mt`)

### 银行
- ✅ 建设银行 (`ccb`)
- ✅ 工商银行 (`icbc`)
- ✅ TD银行 (`td`)
- ✅ BMO银行 (`bmo`)
- ✅ 汇丰香港 (`hsbchk`)
- ✅ 中信银行 (`citic`)

### 证券/交易所
- ✅ 火币交易所 (`huobi`)
- ✅ 华泰证券 (`htsec`)

### 区块链
- ✅ 以太坊 (`ethereum`)
- ✅ BSC (`bsc`)

## 使用方法

### 1. 创建预设配置

在规则配置页面，点击"创建预设配置"按钮，系统会自动从对应的 JSON 文件加载配置：

```typescript
// 异步加载预设配置
const config = await ruleConfigService.createFromPreset(provider, '我的配置');
```

### 2. 编程方式加载

```typescript
import { PresetConfigService } from '../services/preset-config-service';

// 加载单个配置
const config = await PresetConfigService.getPresetConfig(ProviderType.Alipay);

// 加载所有配置
const allConfigs = await PresetConfigService.getAllPresetConfigs();

// 检查是否有配置
const hasConfig = await PresetConfigService.hasPresetConfig(ProviderType.Alipay);

// 获取统计信息
const stats = await PresetConfigService.getStatistics();
```

### 3. 添加新的解析器配置

1. 在 `public/example/{provider}/` 目录下创建 `config.json` 文件
2. 按照标准格式编写配置
3. 确保 `provider` 字段与解析器类型匹配
4. 添加相应的测试用例

## 测试

### 单元测试

运行预设配置系统的测试：

```bash
npm run test preset-config.test.ts
```

### 集成测试

测试配置加载和验证：

```bash
npm run test:integration
```

## 配置验证

系统会自动验证配置文件的格式：

- 检查必需字段是否存在
- 验证数据类型是否正确
- 确保规则数组格式正确
- 验证账户名称格式

## 性能优化

### 缓存策略
- 首次加载时缓存配置
- 后续访问直接从缓存获取
- 支持手动清除缓存

### 错误处理
- 文件不存在时返回 null
- 格式错误时记录日志
- 网络错误时使用备用配置

## 扩展性

### 添加新字段
在配置文件中可以轻松添加新字段，无需修改核心代码：

```json
{
  "provider": "alipay",
  "name": "支付宝基础配置",
  "description": "支付宝交易记录的基础配置模板",
  "version": "1.0.0",
  "author": "开发者",
  "config": {
    // 配置内容...
  }
}
```

### 支持多语言
可以为不同语言创建配置文件：

```
public/example/alipay/
├── config.json          # 默认配置
├── config-zh.json       # 中文配置
└── config-en.json       # 英文配置
```

## 故障排除

### 常见问题

1. **配置文件不存在**
   - 检查文件路径是否正确
   - 确保文件名为 `config.json`
   - 验证文件权限

2. **配置格式错误**
   - 检查 JSON 语法
   - 验证必需字段
   - 查看控制台错误信息

3. **缓存问题**
   - 调用 `PresetConfigService.clearCache()` 清除缓存
   - 重新加载配置

### 调试

启用调试模式查看详细日志：

```typescript
// 在浏览器控制台中
localStorage.setItem('debug', 'preset-config');
```

## 未来计划

- [ ] 支持配置版本管理
- [ ] 添加配置模板系统
- [ ] 支持配置导入/导出
- [ ] 实现配置热重载
- [ ] 添加配置验证规则
- [ ] 支持配置继承和覆盖 