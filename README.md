<div align="center">

![BeanBridge Logo](./public/logo.png)

# BeanBridge

**智能账单处理工具 - 让复式记账更简单**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/fatsheep2/beanBridge?style=social)](https://github.com/fatsheep2/beanBridge)
[![GitHub Forks](https://img.shields.io/github/forks/fatsheep2/beanBridge?style=social)](https://github.com/fatsheep2/beanBridge)

一个基于规则的复式记账导入工具，支持从支付宝、微信、银行、区块链等多种平台导出交易记录并转换为 Beancount 或 Ledger 格式。

**BeanBridge** 是 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 的 Web 前端实现，使用 WebAssembly 技术在浏览器中运行完整的解析引擎，所有数据处理都在本地完成，保护用户隐私。

[在线体验](https://fatsheep2.github.io/beanBridge/) • [使用文档](#-使用教程) • [配置文档](https://deb-sig.github.io/double-entry-generator/) • [问题反馈](https://github.com/fatsheep2/beanBridge/issues)

</div>

## 🌟 项目特色

- **🤖 智能规则匹配**：基于规则的交易分类系统，支持自定义匹配规则，支持多规则匹配和规则优先级
- **📱 多平台支持**：支持 13+ 种数据源
  - 💰 支付平台：支付宝、微信、京东、美团
  - 🏦 银行：工商银行、建设银行、中信银行、招商银行、汇丰香港、TD银行、BMO银行
  - 📈 证券：华泰证券、华西证券
  - 🪙 加密货币：火币、OKLink（支持 Ethereum、TRON、BSC 等多链）
- **👁️ 实时预览**：处理前可预览交易记录，支持规则匹配分析，确保数据正确性
- **💾 自动保存**：规则配置自动保存到本地，支持历史记录管理和配置导入导出
- **🎨 现代化 UI**：响应式设计，支持深色/浅色主题，流畅的用户体验
- **🔒 隐私安全**：所有数据处理都在本地完成（基于 WebAssembly），数据不会上传到服务器
- **⚡ 高性能**：基于 WebAssembly 的解析引擎（直接使用 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 的 WASM 构建），支持大文件快速处理
- **🔄 自动同步**：通过 GitHub Actions 自动同步 double-entry-generator 的最新功能，无需手动更新

## 🙏 特别感谢

### 开源项目
本项目基于以下开源项目构建：

- **[double-entry-generator](https://github.com/deb-sig/double-entry-generator)** - 本项目使用其 WebAssembly 版本作为核心解析引擎，所有解析逻辑都基于该项目
  - 📖 [在线文档](https://deb-sig.github.io/double-entry-generator/) - 详细的配置指南和规则说明
  - 🔧 [GitHub 仓库](https://github.com/deb-sig/double-entry-generator) - 核心解析器源码
- **[linux.do 论坛讨论](https://linux.do/t/topic/725012/72)** - 在 linux.do 论坛的讨论中获得了宝贵的灵感和建议

### 开发工具
- **[Cursor](https://cursor.sh/)** - 本项目完全由 Cursor AI 辅助开发，从项目架构到具体实现，一行代码都没有手动编写()，全部由 AI 生成。感谢 Cursor 提供的强大代码生成能力！

## 🚀 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

> 💡 **提示**：项目通过 GitHub Actions 自动同步 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 的最新功能和 WASM 构建，无需手动操作。

## 📖 使用教程

### 1. 上传交易记录

1. 从支付宝、微信、银行或 OKLink 等平台导出交易记录（CSV/Excel 格式）
2. 在 BeanBridge 中点击"选择文件"上传
3. 选择对应的解析器（系统会根据文件名自动推荐）

### 2. 配置规则

1. 点击"规则配置"进入规则管理页面
2. 选择对应的解析器（支付宝/微信/银行/OKLink 等）
3. 设置默认账户：
   - **默认负账户**：通常是资产账户（如 `Assets:WeChat`、`Assets:Crypto:Ethereum`）
   - **默认正账户**：通常是支出账户（如 `Expenses:FIXME`）
   - **默认货币**：交易货币（如 `CNY`、`USDT`）

### 3. 添加匹配规则

规则支持以下字段匹配（不同解析器支持的字段可能不同）：
- **交易对方/Peer**：商户名称或对方地址
- **商品说明/Item**：交易描述
- **交易类型/Type**：收入/支出
- **支付方式/Method**：支付渠道
- **分类/Category**：交易分类
- **代币符号/TokenSymbol**：加密货币代币符号（OKLink）
- **合约地址/ContractAddress**：代币合约地址（OKLink）
- **金额范围**：minAmount、maxAmount（部分解析器支持）
- **时间范围**：time（部分解析器支持）

> 💡 **提示**：详细的规则配置说明请参考 [double-entry-generator 配置文档](https://deb-sig.github.io/double-entry-generator/)

示例规则（微信）：
```yaml
- name: "滴滴出行"
  peer: "滴滴出行"
  type: "支出"
  targetAccount: "Expenses:Transport:Taxi"
  methodAccount: "Assets:WeChat"
```

示例规则（OKLink）：
```yaml
oklink:
  "0x...":  # 你的钱包地址
    rules:
      - tokenSymbol: "USDT"
        methodAccount: "Assets:Crypto:Ethereum:USDT"
        tags: "Stablecoin,USDT"
```

### 4. 处理文件

1. 点击"预览"查看原始交易记录
2. 点击"生成 Beancount"或"生成 Ledger"转换为复式记账格式
3. 点击"测试规则"验证规则匹配效果，查看规则匹配分析
4. 下载生成的 Beancount 或 Ledger 文件

### 5. 规则管理

- **自动保存**：规则修改后自动保存
- **历史记录**：支持查看和恢复历史配置
- **导入导出**：支持配置的导入导出
- **规则测试**：实时测试规则匹配效果

## 🏗️ 项目架构

BeanBridge 采用前后端分离架构，前端使用 Vue 3，后端解析引擎通过 WebAssembly 在浏览器中运行。

```
beanBridge/
├── public/
│   ├── wasm/                    # WebAssembly 文件
│   │   ├── double-entry-generator.wasm  # 核心解析引擎（来自 double-entry-generator）
│   │   └── wasm_exec.js         # Go WASM 运行时
│   ├── example/                 # 示例配置文件
│   └── assets/icons/            # 解析器图标
├── src/
│   ├── components/              # Vue 组件
│   │   ├── AppHeader.vue        # 应用头部（含 Logo）
│   │   ├── ProviderSelector.vue  # 解析器选择器
│   │   ├── RuleListViewer.vue   # 规则列表查看器
│   │   └── ...
│   ├── views/                   # 页面视图
│   │   ├── HomeView.vue         # 首页
│   │   ├── BillProcessingView.vue  # 账单处理页面
│   │   └── YamlConfigView.vue   # YAML 配置编辑器
│   ├── services/                # 服务层
│   │   ├── wasm-service.ts      # WASM 服务（核心）
│   │   └── preset-config-service.ts  # 预设配置服务
│   ├── composables/             # 组合式函数
│   │   ├── useDegWasm.ts        # double-entry-generator WASM 封装
│   │   └── useWasm.ts           # WASM 通用封装
│   ├── types/                   # TypeScript 类型定义
│   └── data/                    # 静态数据
│       └── providers.ts         # 解析器信息配置
└── .github/workflows/
    └── sync-deg-updates.yml     # 自动同步 double-entry-generator 的工作流
```

### 核心特性

- **WASM 后端**：直接使用 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 编译的 WebAssembly 模块，功能与 CLI 版本完全一致
- **自动同步**：通过 GitHub Actions 自动同步 double-entry-generator 的最新功能和 WASM 构建
- **配置管理**：支持 YAML 配置编辑、预设配置加载、配置导入导出

## 🔧 技术栈

### 前端技术
- **框架**：Vue 3 + TypeScript + Composition API
- **构建工具**：Vite 6
- **包管理器**：pnpm
- **样式框架**：Tailwind CSS v4
- **路由管理**：Vue Router 4
- **UI 组件**：自定义组件 + Material Icons

### 后端/解析引擎
- **解析引擎**：WebAssembly（直接使用 [double-entry-generator](https://github.com/deb-sig/double-entry-generator) 的 WASM 构建）
- **WASM 运行时**：Go WebAssembly（通过 `wasm_exec.js`）
- **文件处理**：由 WASM 模块处理，支持 CSV、Excel 等多种格式

### 工具和库
- **YAML 解析**：js-yaml（用于配置编辑）
- **文件上传**：原生 File API
- **配置存储**：localStorage（浏览器本地存储）

### 部署和 CI/CD
- **部署平台**：GitHub Pages
- **CI/CD**：GitHub Actions
  - 自动构建和部署
  - 分支预览环境
  - 自动同步 double-entry-generator 更新

## 📋 支持的解析器

### 💰 支付平台
- ✅ 支付宝 (Alipay) - CSV 格式
- ✅ 微信支付 (WeChat) - CSV、Excel 格式
- ✅ 京东金融 (JD) - CSV、Excel 格式
- ✅ 美团 (MT) - CSV、Excel 格式

### 🏦 银行
- ✅ 工商银行 (ICBC) - CSV、Excel 格式
- ✅ 建设银行 (CCB) - CSV、Excel 格式
- ✅ 中信银行 (CITIC) - Excel 格式
- ✅ 招商银行 (CMB) - 需使用 [bill-file-converter](https://github.com/deb-sig/bill-file-converter) 转换 PDF 为 CSV
- ✅ 汇丰银行香港 (HSBC HK) - CSV、Excel 格式
- ✅ 多伦多道明银行 (TD) - CSV、PDF 格式
- ✅ 蒙特利尔银行 (BMO) - CSV、PDF 格式

### 📈 证券
- ✅ 华泰证券 (HTSEC) - CSV、Excel 格式
- ✅ 华西证券 (HXSEC) - CSV、Excel 格式

### 🪙 加密货币
- ✅ 火币 (Huobi) - CSV 格式
- ✅ OKLink - CSV 格式（支持 Ethereum、TRON、BSC、Polygon、Arbitrum 等多链）

> 📖 详细的解析器配置说明请参考 [double-entry-generator 文档](https://deb-sig.github.io/double-entry-generator/)

## 📋 未来计划

### 🚀 功能增强
- [ ] **多语言支持**
  - [ ] 英文界面
  - [ ] 国际化框架集成
- [x] **更多解析器支持** - 已支持 13+ 种解析器，持续同步 double-entry-generator 的新解析器
- [x] **高级规则功能** - 部分已实现（金额范围、时间范围等，取决于 double-entry-generator 的支持）

### 🎨 用户体验
- [ ] **数据可视化**
  - [ ] 交易统计图表
  - [ ] 支出分类饼图
  - [ ] 时间趋势图
- [ ] **批量处理**
  - [ ] 多文件同时处理
- [ ] **智能建议**
  - [ ] 基于历史数据的规则建议

### 🔧 技术优化
- [x] **性能优化** - WASM 引擎已优化，支持大文件处理
- [x] **自动同步** - 已实现 GitHub Actions 自动同步 double-entry-generator 更新
- [ ] **代码质量**
  - [ ] 单元测试覆盖
  - [ ] E2E 测试

### 📱 平台支持
- [x] **移动端适配** - 响应式设计，支持移动端访问
- [ ] **PWA 支持** - 离线功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 📞 联系我们

- 🌐 **在线体验**：[https://fatsheep2.github.io/beanBridge/](https://fatsheep2.github.io/beanBridge/)
- 📖 **配置文档**：[double-entry-generator 文档](https://deb-sig.github.io/double-entry-generator/)
- 📦 **项目主页**：[GitHub](https://github.com/fatsheep2/beanBridge)
- 🔧 **核心引擎**：[double-entry-generator](https://github.com/deb-sig/double-entry-generator)
- 🐛 **问题反馈**：[Issues](https://github.com/fatsheep2/beanBridge/issues)
- 💡 **功能建议**：[Discussions](https://github.com/fatsheep2/beanBridge/discussions)
- ⭐ **如果这个项目对你有帮助，请给个 Star！**

---

<div align="center">

**BeanBridge** - 让复式记账更简单！ 🎯

Made with ❤️ by [fatsheep2](https://github.com/fatsheep2)

</div>
