import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';

export class TdProvider extends BaseProvider {
  getProviderName(): string {
    return 'TD Bank';
  }

  getSupportedFormats(): string[] {
    return ['.csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Td;
  }

  protected getHeaderPatterns(): RegExp[] {
    // TD Bank 特定的表头识别模式
    return [
      /date|日期/,
      /description|描述|交易描述/,
      /debit|支出/,
      /credit|收入/,
      /balance|余额/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-TD] 字段映射:', fieldMap);
    console.log('[Provider-TD] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-TD] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-TD] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 4) return null;

    // TD Bank CSV格式字段映射
    const fieldMap = this.mapFields(headers);
    
    const dateStr = row[fieldMap.date] || '';
    const description = row[fieldMap.description] || '';
    const debitStr = row[fieldMap.debit] || '';
    const creditStr = row[fieldMap.credit] || '';
    const balanceStr = row[fieldMap.balance] || '';

    if (!dateStr) return null;

    const payTime = this.parseDate(dateStr);
    const debit = this.parseAmount(debitStr);
    const credit = this.parseAmount(creditStr);
    const balance = this.parseAmount(balanceStr);

    // 确定交易类型和金额
    let amount = 0;
    let type = Type.Unknown;
    
    if (debit > 0) {
      amount = -debit; // 支出为负数
      type = Type.Send;
    } else if (credit > 0) {
      amount = credit; // 收入为正数
      type = Type.Recv;
    } else {
      return null; // 跳过无效交易
    }

    const order: Order = {
      orderType: OrderType.Normal,
      peer: description,
      item: description,
      category: 'TD Bank',
      merchantOrderID: undefined,
      orderID: `${payTime.getTime()}_${Math.abs(amount)}`,
      money: amount,
      note: description,
      payTime,
      type,
      typeOriginal: debit > 0 ? 'DEBIT' : 'CREDIT',
      txTypeOriginal: debit > 0 ? 'DEBIT' : 'CREDIT',
      method: 'TD Bank',
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
        description,
        balance: balance.toString(),
        debit: debit.toString(),
        credit: credit.toString()
      },
      tags: ['bank', 'td']
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('date') || lowerHeader.includes('日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('description') || lowerHeader.includes('描述') || lowerHeader.includes('交易描述')) {
        fieldMap.description = index;
      } else if (lowerHeader.includes('debit') || lowerHeader.includes('支出')) {
        fieldMap.debit = index;
      } else if (lowerHeader.includes('credit') || lowerHeader.includes('收入')) {
        fieldMap.credit = index;
      } else if (lowerHeader.includes('balance') || lowerHeader.includes('余额')) {
        fieldMap.balance = index;
      }
    });

    return fieldMap;
  }

  protected postProcess(ir: IR): IR {
    // TD Bank 特有的后处理逻辑
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