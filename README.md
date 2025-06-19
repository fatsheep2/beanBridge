# BeanBridge

一个基于规则的复式记账导入工具，支持从支付宝、微信等平台导出交易记录并转换为 Beancount 格式。

## 🌟 项目特色

- **智能规则匹配**：基于规则的交易分类系统，支持自定义匹配规则
- **多平台支持**：支持支付宝、微信等主流支付平台
- **实时预览**：处理前可预览交易记录，确保数据正确性
- **自动保存**：规则配置自动保存，支持历史记录管理
- **响应式设计**：现代化的 Web 界面，支持深色/浅色主题
- **本地处理**：所有数据处理都在本地完成，保护隐私安全

## 🙏 特别感谢

### 开源项目
本项目受到了以下开源项目的启发和帮助：

- **[double-entry-generator](https://github.com/deb-sig/double-entry-generator)** - 基于规则的复式记账导入器，为本项目提供了核心的设计理念和技术架构参考
- **[linux.do 论坛讨论](https://linux.do/t/topic/725012/72)** - 在 linux.do 论坛的讨论中获得了宝贵的灵感和建议

### 开发工具
- **[Cursor](https://cursor.sh/)** - 本项目完全由 Cursor AI 辅助开发，从项目架构到具体实现，一行代码都没有手动编写()，全部由 AI 生成。感谢 Cursor 提供的强大代码生成能力！

## 🚀 快速开始

### 在线使用
访问 [BeanBridge 在线版本](https://your-domain.com) 即可开始使用。

### 本地部署

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/BeanBridge.git
   cd BeanBridge
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```

4. **构建生产版本**
   ```bash
   pnpm build
   ```

5. **代码检查**
   ```bash
   pnpm lint
   ```

## 📖 使用教程

### 1. 上传交易记录

1. 从支付宝或微信导出交易记录（CSV 格式）
2. 在 BeanBridge 中点击"选择文件"上传
3. 系统会自动检测文件类型并选择对应的解析器

### 2. 配置规则

1. 点击"规则配置"进入规则管理页面
2. 选择对应的解析器（支付宝/微信）
3. 设置默认账户：
   - **默认负账户**：通常是资产账户（如 `Assets:WeChat`）
   - **默认正账户**：通常是支出账户（如 `Expenses:FIXME`）
   - **默认货币**：交易货币（如 `CNY`）

### 3. 添加匹配规则

规则支持以下字段匹配：
- **交易对方**：商户名称
- **商品说明**：交易描述
- **交易类型**：收入/支出
- **支付方式**：支付渠道
- **分类**：交易分类
- **交易类型**：转账类型

示例规则：
```yaml
- name: "滴滴出行"
  peer: "滴滴出行"
  type: "支出"
  targetAccount: "Expenses:Transport:Taxi"
  methodAccount: "Assets:WeChat"
```

### 4. 处理文件

1. 点击"预览"查看原始交易记录
2. 点击"生成 Beancount"转换为复式记账格式
3. 点击"测试规则"验证规则匹配效果
4. 下载生成的 Beancount 文件

### 5. 规则管理

- **自动保存**：规则修改后自动保存
- **历史记录**：支持查看和恢复历史配置
- **导入导出**：支持配置的导入导出
- **规则测试**：实时测试规则匹配效果

## 🏗️ 项目架构

```
src/
├── components/          # Vue 组件
│   ├── AppHeader.vue   # 应用头部
│   ├── FileUploadSection.vue  # 文件上传
│   ├── ProviderSelector.vue   # 解析器选择
│   ├── ResultDisplay.vue      # 结果展示
│   ├── RuleEditor.vue         # 规则编辑器
│   └── RuleConfigView.vue     # 规则配置页面
├── views/              # 页面视图
│   ├── HomeView.vue    # 首页
│   ├── BillProcessingView.vue  # 账单处理
│   └── RuleConfigView.vue     # 规则配置
├── composables/        # 组合式函数
│   ├── useDataSourceConfig.ts # 数据源配置
│   └── useConfigStorage.ts    # 配置存储
├── services/           # 服务层
│   └── rule-config-service.ts # 规则配置服务
├── utils/              # 工具函数
│   ├── file-processor-v2.ts   # 文件处理器
│   ├── beancount-converter.ts # Beancount 转换器
│   └── rule-engine.ts         # 规则引擎
├── types/              # 类型定义
├── data/               # 静态数据
└── assets/             # 静态资源
```

## 🔧 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **包管理器**：pnpm
- **样式框架**：Tailwind CSS v4
- **状态管理**：Vue Composition API
- **路由管理**：Vue Router
- **文件处理**：PapaParse (CSV 解析)
- **部署平台**：GitHub Pages

## 📋 TODO 列表

### 🚀 功能增强
- [ ] **多语言支持**
  - [ ] 英文界面
  - [ ] 日文界面
  - [ ] 国际化框架集成
- [ ] **更多解析器支持**
  - [ ] 京东金融
  - [ ] 美团
  - [ ] 银行信用卡
  - [ ] 证券账户
- [ ] **高级规则功能**
  - [ ] 正则表达式支持
  - [ ] 时间范围匹配
  - [ ] 金额范围匹配
  - [ ] 复合条件匹配

### 🎨 用户体验
- [ ] **数据可视化**
  - [ ] 交易统计图表
  - [ ] 支出分类饼图
  - [ ] 时间趋势图
- [ ] **批量处理**
  - [ ] 多文件同时处理
  - [ ] 批量规则应用
- [ ] **智能建议**
  - [ ] 基于历史数据的规则建议
  - [ ] 自动分类推荐

### 🔧 技术优化
- [ ] **性能优化**
  - [ ] 大文件处理优化
  - [ ] 虚拟滚动
  - [ ] 懒加载
- [ ] **代码质量**
  - [ ] 单元测试覆盖
  - [ ] E2E 测试
  - [ ] 代码规范检查
- [ ] **架构优化**
  - [ ] 模块化重构
  - [ ] 插件系统
  - [ ] 微前端架构

### 🔒 安全与隐私
- [ ] **数据安全**
  - [ ] 端到端加密
  - [ ] 本地存储加密
  - [ ] 隐私保护增强
- [ ] **备份同步**
  - [ ] 云端配置同步
  - [ ] 多设备数据同步

### 📱 平台支持
- [ ] **移动端适配**
  - [ ] PWA 支持
  - [ ] 移动端优化
- [ ] **桌面应用**
  - [ ] Electron 应用
  - [ ] 离线功能

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

- 项目主页：[GitHub](https://github.com/your-username/BeanBridge)
- 问题反馈：[Issues](https://github.com/your-username/BeanBridge/issues)
- 功能建议：[Discussions](https://github.com/your-username/BeanBridge/discussions)

---

**BeanBridge** - 让复式记账更简单！ 🎯
