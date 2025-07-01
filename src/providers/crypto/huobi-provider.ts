import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';

export class HuobiProvider extends BaseProvider {
  getProviderName(): string {
    return 'Huobi';
  }

  getSupportedFormats(): string[] {
    return ['csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Huobi;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 火币特定的表头识别模式
    return [
      /时间|交易时间|创建时间/,
      /类型|交易类型|操作类型/,
      /币种|交易币种|币对/,
      /数量|交易数量|数量\(BTC\)/,
      /价格|成交价格|价格\(USDT\)/,
      /手续费|手续费\(USDT\)/,
      /总额|成交额|总额\(USDT\)/,
      /状态|交易状态/,
      /订单号|交易订单号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-Huobi] 字段映射:', fieldMap);
    console.log('[Provider-Huobi] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-Huobi] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-Huobi] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 5) return null;

    // 火币CSV格式字段映射
    const fieldMap = this.mapFields(headers);

    const dateStr = row[fieldMap.date] || '';
    const typeStr = row[fieldMap.type] || '';
    const currency = row[fieldMap.currency] || '';
    const amountStr = row[fieldMap.amount] || '';
    const priceStr = row[fieldMap.price] || '';
    const feeStr = row[fieldMap.fee] || '';
    const totalStr = row[fieldMap.total] || '';
    const status = row[fieldMap.status] || '';
    const orderId = row[fieldMap.orderId] || '';

    if (!dateStr || !amountStr) return null;

    const payTime = this.parseDate(dateStr);
    const amount = this.parseAmount(amountStr);
    const price = this.parseAmount(priceStr);
    const fee = this.parseAmount(feeStr);
    const total = this.parseAmount(totalStr);
    const type = this.parseType(typeStr);

    // 计算实际金额（考虑手续费）
    const money = type === Type.Send ? -(total + fee) : (total - fee);

    const order: Order = {
      orderType: OrderType.HuobiTrade,
      peer: '火币交易所',
      item: `${currency}交易`,
      category: typeStr,
      merchantOrderID: undefined,
      orderID: orderId || undefined,
      money,
      note: `${typeStr} ${currency} - 数量: ${amount}, 价格: ${price}`,
      payTime,
      type,
      typeOriginal: typeStr,
      txTypeOriginal: typeStr,
      method: '火币交易',
      amount: Math.abs(amount),
      price: price,
      currency: currency || 'USDT',
      commission: fee,
      units: {
        [Unit.BaseUnit]: currency || '',
        [Unit.TargetUnit]: 'USDT',
        [Unit.CommissionUnit]: 'USDT'
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
        orderId,
        currency,
        amount: amount.toString(),
        price: price.toString(),
        fee: fee.toString(),
        total: total.toString()
      },
      tags: ['crypto', 'huobi']
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();

      if (lowerHeader.includes('时间') || lowerHeader.includes('日期') || lowerHeader.includes('创建时间')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('类型') || lowerHeader.includes('操作类型') || lowerHeader.includes('交易类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('币种') || lowerHeader.includes('币对') || lowerHeader.includes('交易币种')) {
        fieldMap.currency = index;
      } else if (lowerHeader.includes('数量') || lowerHeader.includes('交易数量')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('价格') || lowerHeader.includes('成交价格')) {
        fieldMap.price = index;
      } else if (lowerHeader.includes('手续费')) {
        fieldMap.fee = index;
      } else if (lowerHeader.includes('总额') || lowerHeader.includes('成交额')) {
        fieldMap.total = index;
      } else if (lowerHeader.includes('状态') || lowerHeader.includes('交易状态')) {
        fieldMap.status = index;
      } else if (lowerHeader.includes('订单号') || lowerHeader.includes('交易订单号')) {
        fieldMap.orderId = index;
      }
    });

    return fieldMap;
  }

  private parseType(typeStr: string): Type {
    const lowerType = typeStr.toLowerCase();

    if (lowerType.includes('买入') || lowerType.includes('buy')) {
      return Type.Send;
    } else if (lowerType.includes('卖出') || lowerType.includes('sell')) {
      return Type.Recv;
    } else if (lowerType.includes('充值') || lowerType.includes('deposit')) {
      return Type.Recv;
    } else if (lowerType.includes('提现') || lowerType.includes('withdraw')) {
      return Type.Send;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // 火币特有的后处理逻辑
    const processedOrders: Order[] = [];

    for (const order of ir.orders) {
      // 过滤掉无效交易
      if (order.metadata.status === '失败' || order.metadata.status === '已取消') {
        console.log(`[orderId ${order.orderID}] 交易无效: ${order.metadata.status}`);
        continue;
      }

      processedOrders.push(order);
    }

    return {
      orders: processedOrders
    };
  }
} 