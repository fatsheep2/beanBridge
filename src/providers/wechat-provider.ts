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

        // 保存推荐元数据字段
        const metadata: Record<string, string> = {};
        if (itemName) metadata.note = itemName;
        if (dealNo) metadata.orderId = dealNo;
        if (method) metadata.method = method;
        if (dateStr) metadata.payTime = dateStr;
        if (typeStr) metadata.type = typeStr;
        if (status) metadata.status = status;
        if (peer) metadata.peer = peer;
        if (moneyStr) metadata.amount = moneyStr;
        metadata.currency = 'CNY';
        metadata.source = '微信支付';
        // 保存原始字段值，供规则引擎使用
        metadata.originalPeer = peer;
        metadata.originalItem = itemName;
        metadata.originalCategory = category;
        // 兼容部分商户号字段（如有）
        if (row[fieldMap.merchantId]) metadata.merchantId = row[fieldMap.merchantId];

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
            metadata,
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
            } else if (lowerHeader.includes('商户号')) {
                fieldMap.merchantId = index;
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

            // 确保使用原始的 peer 和 item 值
            order.peer = order.metadata.originalPeer || order.peer;
            order.item = order.metadata.originalItem || order.item;
            order.category = order.metadata.originalCategory || order.category;

            processedOrders.push(order);
        }

        return {
            orders: processedOrders
        };
    }
} 