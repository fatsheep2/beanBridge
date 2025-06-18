import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';

export class IcbcProvider extends BaseProvider {
  getProviderName(): string {
    return '工商银行';
  }

  getSupportedFormats(): string[] {
    return ['.csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Icbc;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 工商银行特定的表头识别模式
    return [
      /交易日期|日期|记账日期/,
      /交易时间|时间/,
      /交易金额|金额|发生额/,
      /交易类型|业务类型|交易类型/,
      /交易摘要|摘要|备注/,
      /对方户名|对方账户|交易对方/,
      /对方账号|对方卡号/,
      /余额|账户余额/,
      /交易流水号|流水号|交易序号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-Icbc] 字段映射:', fieldMap);
    console.log('[Provider-Icbc] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-Icbc] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-Icbc] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 5) return null;

    // 工商银行CSV格式字段映射
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
      peer: peerName || '工商银行',
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
      method: '工商银行',
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
        peerName,
        peerAccount,
        balance: balance.toString(),
        orderId,
        summary
      },
      tags: ['bank', 'icbc']
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('日期') || lowerHeader.includes('交易日期') || lowerHeader.includes('记账日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('时间') || lowerHeader.includes('交易时间')) {
        fieldMap.time = index;
      } else if (lowerHeader.includes('金额') || lowerHeader.includes('交易金额') || lowerHeader.includes('发生额')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('类型') || lowerHeader.includes('业务类型') || lowerHeader.includes('交易类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('摘要') || lowerHeader.includes('交易摘要') || lowerHeader.includes('备注')) {
        fieldMap.summary = index;
      } else if (lowerHeader.includes('对方户名') || lowerHeader.includes('对方账户') || lowerHeader.includes('交易对方')) {
        fieldMap.peerName = index;
      } else if (lowerHeader.includes('对方账号') || lowerHeader.includes('对方卡号')) {
        fieldMap.peerAccount = index;
      } else if (lowerHeader.includes('余额') || lowerHeader.includes('账户余额')) {
        fieldMap.balance = index;
      } else if (lowerHeader.includes('流水号') || lowerHeader.includes('交易流水号') || lowerHeader.includes('交易序号')) {
        fieldMap.orderId = index;
      }
    });

    return fieldMap;
  }

  private parseType(amount: number): Type {
    // 工商银行通常正数表示收入，负数表示支出
    if (amount > 0) {
      return Type.Recv;
    } else if (amount < 0) {
      return Type.Send;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // 工商银行特有的后处理逻辑
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