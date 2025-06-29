import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';

export class BmoProvider extends BaseProvider {
  getProviderName(): string {
    return 'BMO Bank';
  }

  getSupportedFormats(): string[] {
    return ['.csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Bmo;
  }

  protected getHeaderPatterns(): RegExp[] {
    // BMO Bank 特定的表头识别模式
    return [
      /first bank card|银行卡/,
      /transaction type|交易类型/,
      /date posted|交易日期/,
      /transaction amount|交易金额/,
      /description|描述/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-BMO] 字段映射:', fieldMap);
    console.log('[Provider-BMO] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-BMO] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-BMO] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 5) return null;

    // BMO Bank CSV格式字段映射
    const fieldMap = this.mapFields(headers);

    const cardNumber = row[fieldMap.cardNumber] || '';
    const typeStr = row[fieldMap.type] || '';
    const dateStr = row[fieldMap.date] || '';
    const amountStr = row[fieldMap.amount] || '';
    const description = row[fieldMap.description] || '';

    if (!dateStr || !amountStr) return null;

    const payTime = this.parseDate(dateStr);
    const amount = this.parseAmount(amountStr);
    const type = this.parseType(typeStr);

    const order: Order = {
      orderType: OrderType.Normal,
      peer: description,
      item: description,
      category: 'BMO Bank',
      merchantOrderID: undefined,
      orderID: `${payTime.getTime()}_${Math.abs(amount)}`,
      money: amount,
      note: description,
      payTime,
      type,
      typeOriginal: typeStr,
      txTypeOriginal: typeStr,
      method: 'BMO Bank',
      amount: Math.abs(amount),
      price: 1,
      currency: 'CAD',
      commission: 0,
      units: {
        [Unit.BaseUnit]: '',
        [Unit.TargetUnit]: 'CAD',
        [Unit.CommissionUnit]: 'CAD'
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
        cardNumber,
        description,
        transactionType: typeStr
      },
      tags: ['bank', 'bmo']
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

      if (lowerHeader.includes('first bank card') || lowerHeader.includes('银行卡')) {
        fieldMap.cardNumber = index;
      } else if (lowerHeader.includes('transaction type') || lowerHeader.includes('交易类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('date posted') || lowerHeader.includes('交易日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('transaction amount') || lowerHeader.includes('交易金额')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('description') || lowerHeader.includes('描述')) {
        fieldMap.description = index;
      }
    });

    return fieldMap;
  }

  private parseType(typeStr: string): Type {
    const lowerType = typeStr.toLowerCase();

    if (lowerType.includes('debit') || lowerType.includes('支出')) {
      return Type.Send;
    } else if (lowerType.includes('credit') || lowerType.includes('收入')) {
      return Type.Recv;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // BMO Bank 特有的后处理逻辑
    const processedOrders: Order[] = [];

    for (const order of ir.orders) {
      // 过滤掉无效交易
      if (order.money === 0) {
        console.log(`[orderId ${order.orderID}] 金额为0，跳过`);
        continue;
      }

      processedOrders.push(order);
    }

    return {
      orders: processedOrders
    };
  }
} 