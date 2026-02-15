import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';

export class MtProvider extends BaseProvider {
  getProviderName(): string {
    return 'MT';
  }

  getSupportedFormats(): string[] {
    return ['csv', 'xls', 'xlsx'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.MT;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 美团特定的表头识别模式
    return [
      /交易创建时间|创建时间/,
      /交易成功时间|成功时间/,
      /交易类型|类型/,
      /订单标题|标题/,
      /收\/支|交易类型/,
      /支付方式|付款方式/,
      /订单金额|金额/,
      /实付金额|实际金额/,
      /交易单号|订单号/,
      /商家单号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-MT] 字段映射:', fieldMap);
    console.log('[Provider-MT] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-MT] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-MT] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 8) return null;

    // 美团CSV格式字段映射
    const fieldMap = this.mapFields(headers);

    const createTimeStr = row[fieldMap.createTime] || '';
    const successTimeStr = row[fieldMap.successTime] || '';
    const typeStr = row[fieldMap.type] || '';
    const title = row[fieldMap.title] || '';
    const flowTypeStr = row[fieldMap.flowType] || '';
    const method = row[fieldMap.method] || '';
    const orderAmountStr = row[fieldMap.orderAmount] || '';
    const actualAmountStr = row[fieldMap.actualAmount] || '';
    const orderId = row[fieldMap.orderId] || '';
    const merchantOrderId = row[fieldMap.merchantOrderId] || '';

    if (!createTimeStr || !actualAmountStr) return null;

    const payTime = this.parseDate(successTimeStr || createTimeStr);
    const orderAmount = this.parseAmount(orderAmountStr);
    const actualAmount = this.parseAmount(actualAmountStr);
    const type = this.parseType(flowTypeStr);

    const order: Order = {
      orderType: OrderType.Normal,
      peer: title,
      item: title,
      category: typeStr,
      merchantOrderID: merchantOrderId || undefined,
      orderID: orderId || undefined,
      money: actualAmount,
      note: title,
      payTime,
      type,
      typeOriginal: flowTypeStr,
      txTypeOriginal: typeStr,
      method,
      amount: Math.abs(actualAmount),
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
        title,
        orderAmount: orderAmount.toString(),
        actualAmount: actualAmount.toString(),
        method,
        transactionType: typeStr
      },
      tags: ['food-delivery', 'meituan']
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

      if (lowerHeader.includes('创建时间') || lowerHeader.includes('交易创建时间')) {
        fieldMap.createTime = index;
      } else if (lowerHeader.includes('成功时间') || lowerHeader.includes('交易成功时间')) {
        fieldMap.successTime = index;
      } else if (lowerHeader.includes('交易类型') || lowerHeader.includes('类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('订单标题') || lowerHeader.includes('标题')) {
        fieldMap.title = index;
      } else if (lowerHeader.includes('收/支') || lowerHeader.includes('交易类型')) {
        fieldMap.flowType = index;
      } else if (lowerHeader.includes('支付方式') || lowerHeader.includes('付款方式')) {
        fieldMap.method = index;
      } else if (lowerHeader.includes('订单金额') || lowerHeader.includes('金额')) {
        fieldMap.orderAmount = index;
      } else if (lowerHeader.includes('实付金额') || lowerHeader.includes('实际金额')) {
        fieldMap.actualAmount = index;
      } else if (lowerHeader.includes('交易单号') || lowerHeader.includes('订单号')) {
        fieldMap.orderId = index;
      } else if (lowerHeader.includes('商家单号')) {
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
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // 美团特有的后处理逻辑
    const processedOrders: Order[] = [];

    for (const order of ir.orders) {
      // 过滤掉无效交易
      if (order.money === 0) {
        console.log(`[orderId ${order.orderID}] 金额为0，跳过`);
        continue;
      }

      // 过滤掉还款交易
      if (order.metadata.transactionType === '还款') {
        console.log(`[orderId ${order.orderID}] 跳过还款交易`);
        continue;
      }

      processedOrders.push(order);
    }

    return {
      orders: processedOrders
    };
  }
} 