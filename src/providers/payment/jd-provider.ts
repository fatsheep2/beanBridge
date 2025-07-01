import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';

export class JdProvider extends BaseProvider {
  getProviderName(): string {
    return 'JD';
  }

  getSupportedFormats(): string[] {
    return ['csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Jd;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 京东特定的表头识别模式
    return [
      /交易时间|时间/,
      /商户名称|商家/,
      /交易说明|商品/,
      /金额|交易金额/,
      /收\/付款方式|支付方式/,
      /交易状态|状态/,
      /收\/支|交易类型/,
      /交易分类|分类/,
      /交易订单号|订单号/,
      /商家订单号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-JD] 字段映射:', fieldMap);
    console.log('[Provider-JD] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-JD] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-JD] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 8) return null;

    // 京东CSV格式字段映射
    const fieldMap = this.mapFields(headers);

    const dateStr = row[fieldMap.date] || '';
    const merchant = row[fieldMap.merchant] || '';
    const description = row[fieldMap.description] || '';
    const amountStr = row[fieldMap.amount] || '';
    const method = row[fieldMap.method] || '';
    const status = row[fieldMap.status] || '';
    const typeStr = row[fieldMap.type] || '';
    const category = row[fieldMap.category] || '';
    const orderId = row[fieldMap.orderId] || '';
    const merchantOrderId = row[fieldMap.merchantOrderId] || '';

    if (!dateStr || !amountStr) return null;

    const payTime = this.parseDate(dateStr);
    const amount = this.parseAmount(amountStr);
    const type = this.parseType(typeStr);

    const order: Order = {
      orderType: OrderType.Normal,
      peer: merchant,
      item: description,
      category,
      merchantOrderID: merchantOrderId || undefined,
      orderID: orderId || undefined,
      money: amount,
      note: description,
      payTime,
      type,
      typeOriginal: typeStr,
      txTypeOriginal: typeStr,
      method,
      amount: Math.abs(amount),
      price: 1,
      currency: 'CNY',
      commission: 0,
      units: {
        [Unit.BaseUnit]: '',
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
      metadata: {
        merchant,
        status,
        method,
        category
      },
      tags: ['ecommerce', 'jd']
    };

    if (order.plusAccount) {
      order.extraAccounts[Account.PlusAccount] = order.plusAccount;
    }
    if (order.minusAccount) {
      order.extraAccounts[Account.MinusAccount] = order.minusAccount;
    }

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();

      if (lowerHeader.includes('时间') || lowerHeader.includes('交易时间')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('商户名称') || lowerHeader.includes('商家')) {
        fieldMap.merchant = index;
      } else if (lowerHeader.includes('交易说明') || lowerHeader.includes('商品')) {
        fieldMap.description = index;
      } else if (lowerHeader.includes('金额') || lowerHeader.includes('交易金额')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('收/付款方式') || lowerHeader.includes('支付方式')) {
        fieldMap.method = index;
      } else if (lowerHeader.includes('交易状态') || lowerHeader.includes('状态')) {
        fieldMap.status = index;
      } else if (lowerHeader.includes('收/支') || lowerHeader.includes('交易类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('交易分类') || lowerHeader.includes('分类')) {
        fieldMap.category = index;
      } else if (lowerHeader.includes('交易订单号') || lowerHeader.includes('订单号')) {
        fieldMap.orderId = index;
      } else if (lowerHeader.includes('商家订单号')) {
        fieldMap.merchantOrderId = index;
      }
    });

    return fieldMap;
  }

  private parseType(typeStr: string): Type {
    const lowerType = typeStr.toLowerCase();

    if (lowerType.includes('支出')) {
      return Type.Send;
    } else if (lowerType.includes('收入')) {
      return Type.Recv;
    } else if (lowerType.includes('不计收支')) {
      return Type.Unknown;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // 京东特有的后处理逻辑
    const processedOrders: Order[] = [];

    for (const order of ir.orders) {
      // 过滤掉无效交易和不计收支的交易
      if (order.money === 0 || order.type === Type.Unknown) {
        console.log(`[orderId ${order.orderID}] 跳过不计收支交易`);
        continue;
      }

      // 过滤掉退款成功的交易
      if (order.metadata.status === '退款成功') {
        console.log(`[orderId ${order.orderID}] 跳过退款交易`);
        continue;
      }

      processedOrders.push(order);
    }

    return {
      orders: processedOrders
    };
  }
} 