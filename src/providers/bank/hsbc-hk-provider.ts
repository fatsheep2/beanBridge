import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';

export class HsbcHkProvider extends BaseProvider {
  getProviderName(): string {
    return 'HSBC-HK';
  }

  getSupportedFormats(): string[] {
    return ['csv', 'xls', 'xlsx'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.HsbcHK;
  }

  protected getHeaderPatterns(): RegExp[] {
    return [
      /交易日期|日期/,
      /交易时间|时间/,
      /交易金额|金额/,
      /交易类型|类型/,
      /交易摘要|摘要/,
      /对方户名|对方账户/,
      /对方账号|对方卡号/,
      /余额|账户余额/,
      /交易流水号|流水号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    const fieldMap = this.mapFields(headers);
    console.log('[Provider-HSBC-HK] 字段映射:', fieldMap);
    console.log('[Provider-HSBC-HK] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1;

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-HSBC-HK] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-HSBC-HK] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 5) return null;

    const fieldMap = this.mapFields(headers);

    const dateStr = row[fieldMap.date] || '';
    const timeStr = row[fieldMap.time] || '';
    const amountStr = row[fieldMap.amount] || '';
    const typeStr = row[fieldMap.type] || '';
    const summary = row[fieldMap.summary] || '';
    const peerName = row[fieldMap.peerName] || '';
    const peerAccount = row[fieldMap.peerAccount] || '';
    const balanceStr = row[fieldMap.balance] || '';
    const orderId = row[fieldMap.orderId] || '';

    if (!dateStr || !amountStr) return null;

    const payTime = this.parseDate(dateStr + ' ' + timeStr);
    const amount = this.parseAmount(amountStr);
    const balance = this.parseAmount(balanceStr);
    const type = this.parseType(amount);

    const order: Order = {
      orderType: OrderType.Normal,
      peer: peerName || '汇丰香港',
      item: summary || typeStr,
      category: typeStr,
      merchantOrderID: undefined,
      orderID: orderId || undefined,
      money: amount,
      note: summary || `${typeStr} - ${peerName}`,
      payTime,
      type,
      typeOriginal: typeStr,
      txTypeOriginal: typeStr,
      method: '汇丰香港',
      amount: Math.abs(amount),
      price: 1,
      currency: 'HKD',
      commission: 0,
      units: {
        [Unit.BaseUnit]: '',
        [Unit.TargetUnit]: 'HKD',
        [Unit.CommissionUnit]: 'HKD'
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
        peerName,
        peerAccount,
        balance: balance.toString(),
        orderId,
        summary
      },
      tags: ['bank', 'hsbc-hk']
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();

      if (lowerHeader.includes('日期') || lowerHeader.includes('交易日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('时间') || lowerHeader.includes('交易时间')) {
        fieldMap.time = index;
      } else if (lowerHeader.includes('金额') || lowerHeader.includes('交易金额')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('类型') || lowerHeader.includes('交易类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('摘要') || lowerHeader.includes('交易摘要')) {
        fieldMap.summary = index;
      } else if (lowerHeader.includes('对方户名') || lowerHeader.includes('对方账户')) {
        fieldMap.peerName = index;
      } else if (lowerHeader.includes('对方账号') || lowerHeader.includes('对方卡号')) {
        fieldMap.peerAccount = index;
      } else if (lowerHeader.includes('余额') || lowerHeader.includes('账户余额')) {
        fieldMap.balance = index;
      } else if (lowerHeader.includes('流水号') || lowerHeader.includes('交易流水号')) {
        fieldMap.orderId = index;
      }
    });

    return fieldMap;
  }

  private parseType(amount: number): Type {
    if (amount > 0) {
      return Type.Recv;
    } else if (amount < 0) {
      return Type.Send;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    const processedOrders: Order[] = [];

    for (const order of ir.orders) {
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