import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';
import { ruleConfigService } from '../services/rule-config-service';

export class WechatProvider extends BaseProvider {
    getProviderName(): string {
        return 'WeChat';
    }

    getSupportedFormats(): string[] {
        return ['.csv'];
    }

    protected getProviderType(): ProviderType {
        return ProviderType.Wechat;
    }

    protected getHeaderPatterns(): RegExp[] {
        // 微信特定的表头识别模式
        return [
            /交易时间|时间/,
            /收\/支|交易类型/,
            /交易对方|对方/,
            /商品|商品名称/,
            /收\/付款方式|支付方式/,
            /金额|交易金额/,
            /交易状态|状态/,
            /交易分类|分类/,
            /交易单号|订单号/
        ];
    }

    protected async parseOrders(fileData: FileData): Promise<Order[]> {
        const { headers, rows } = fileData;
        const orders: Order[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            this.lineNum = i + 1; // 行号从1开始

            try {
                const order = this.parseOrder(row, headers);
                if (order) {
                    orders.push(order);
                    this.updateStatistics(order);
                }
            } catch (error) {
                console.warn(`第 ${this.lineNum} 行解析失败:`, error);
                continue;
            }
        }

        return orders;
    }

    private parseOrder(row: string[], headers: string[]): Order | null {
        if (row.length < 8) return null;

        // 微信CSV格式字段映射
        const fieldMap = this.mapFields(headers);

        const dateStr = row[fieldMap.date] || '';
        const typeStr = row[fieldMap.type] || '';
        const peer = row[fieldMap.peer] || '';
        const itemName = row[fieldMap.itemName] || '';
        const method = row[fieldMap.method] || '';
        const moneyStr = row[fieldMap.money] || '';
        const status = row[fieldMap.status] || '';
        const category = row[fieldMap.category] || '';
        const dealNo = row[fieldMap.dealNo] || '';

        if (!dateStr || !moneyStr) return null;

        const payTime = this.parseDate(dateStr);
        const money = this.parseAmount(moneyStr);
        const type = this.parseType(typeStr);

        const order: Order = {
            orderType: OrderType.Normal,
            peer,
            item: itemName,
            category,
            merchantOrderID: undefined,
            orderID: dealNo || undefined,
            money,
            note: itemName || peer,
            payTime,
            type,
            typeOriginal: typeStr,
            txTypeOriginal: typeStr,
            method,
            amount: Math.abs(money),
            price: 1,
            currency: 'CNY',
            commission: 0,
            units: {
                [Unit.BaseUnit]: '',
                [Unit.TargetUnit]: '',
                [Unit.CommissionUnit]: ''
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
            metadata: {
                status,
                dealNo,
                method,
                originalPeer: peer, // 保存原始的交易对方信息
                originalItem: itemName // 保存原始的商品信息
            },
            tags: []
        };

        return order;
    }

    private mapFields(headers: string[]): Record<string, number> {
        const fieldMap: Record<string, number> = {};

        headers.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();

            if (lowerHeader.includes('时间') || lowerHeader.includes('日期')) {
                fieldMap.date = index;
            } else if (lowerHeader.includes('收/支') || lowerHeader.includes('类型')) {
                fieldMap.type = index;
            } else if (lowerHeader.includes('对方') || lowerHeader.includes('商家')) {
                fieldMap.peer = index;
            } else if (lowerHeader.includes('商品') || lowerHeader.includes('说明')) {
                fieldMap.itemName = index;
            } else if (lowerHeader.includes('收/付款方式') || lowerHeader.includes('方式')) {
                fieldMap.method = index;
            } else if (lowerHeader.includes('金额')) {
                fieldMap.money = index;
            } else if (lowerHeader.includes('状态')) {
                fieldMap.status = index;
            } else if (lowerHeader.includes('分类')) {
                fieldMap.category = index;
            } else if (lowerHeader.includes('交易单号') || lowerHeader.includes('订单号')) {
                fieldMap.dealNo = index;
            }
        });

        return fieldMap;
    }

    private parseType(typeStr: string): Type {
        const lowerType = typeStr.toLowerCase();

        if (lowerType.includes('支出') || lowerType.includes('付款')) {
            return Type.Send;
        } else if (lowerType.includes('收入') || lowerType.includes('收款')) {
            return Type.Recv;
        } else {
            return Type.Unknown;
        }
    }

    protected postProcess(ir: IR): IR {
        // 微信特有的后处理逻辑
        const processedOrders: Order[] = [];

        for (const order of ir.orders) {
            // 过滤掉无效交易
            if (order.metadata.status === '交易失败' || order.metadata.status === '已撤销') {
                console.log(`[orderId ${order.orderID}] 交易无效: ${order.metadata.status}`);
                continue;
            }

            // 应用规则匹配
            const processedOrder = this.applyRules(order);
            processedOrders.push(processedOrder);
        }

        return {
            orders: processedOrders
        };
    }

    private applyRules(order: Order): Order {
        // 获取当前配置
        const config = this.getCurrentConfig();
        if (!config) {
            // 如果没有配置，使用默认值
            order.minusAccount = 'Assets:Unknown';
            order.plusAccount = 'Expenses:Unknown';
            // 确保使用原始的 peer 值
            order.peer = order.metadata.originalPeer || order.peer;
            return order;
        }

        // 设置默认账户
        order.minusAccount = config.defaultMinusAccount || 'Assets:Unknown';
        order.plusAccount = config.defaultPlusAccount || 'Expenses:Unknown';

        // 应用规则匹配
        if (config.rules && config.rules.length > 0) {
            for (const rule of config.rules) {
                if (this.matchesRule(order, rule)) {
                    // 应用规则，但不修改原始的 peer 和 item
                    if (rule.targetAccount) {
                        order.plusAccount = rule.targetAccount;
                    }
                    if (rule.methodAccount) {
                        order.minusAccount = rule.methodAccount;
                    }
                    if (rule.tags && rule.tags.length > 0) {
                        order.tags = [...(order.tags || []), ...rule.tags];
                    }
                    // 不修改原始的 peer 和 item，保持原始数据
                    break;
                }
            }
        }

        // 确保在应用规则后，peer 字段始终使用原始的 originalPeer 值
        order.peer = order.metadata.originalPeer || order.peer;

        return order;
    }

    private matchesRule(order: Order, rule: any): boolean {
        // 检查各个字段的匹配
        const fields = ['peer', 'item', 'type', 'method', 'category', 'txType'];

        for (const field of fields) {
            if (rule[field]) {
                const ruleValue = rule[field];
                const orderValue = this.getOrderValue(order, field);

                if (rule.sep && ruleValue.includes(rule.sep)) {
                    // 使用分隔符分割规则值
                    const ruleValues = ruleValue.split(rule.sep).map((v: string) => v.trim());
                    const matches = ruleValues.some((v: string) =>
                        rule.fullMatch ? orderValue === v : orderValue.includes(v)
                    );
                    if (!matches) return false;
                } else {
                    // 单个值匹配
                    const matches = rule.fullMatch ?
                        orderValue === ruleValue :
                        orderValue.includes(ruleValue);
                    if (!matches) return false;
                }
            }
        }

        return true;
    }

    private getOrderValue(order: Order, field: string): string {
        switch (field) {
            case 'peer':
                return order.peer || '';
            case 'item':
                return order.item || '';
            case 'type':
                return order.typeOriginal || '';
            case 'method':
                return order.method || '';
            case 'category':
                return order.category || '';
            case 'txType':
                return order.txTypeOriginal || '';
            default:
                return '';
        }
    }

    private getCurrentConfig(): any {
        // 从配置服务获取当前配置
        return ruleConfigService.getConfig(this.getProviderType());
    }
} 