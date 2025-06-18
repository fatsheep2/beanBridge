import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';

export class AlipayProvider extends BaseProvider {
  getProviderName(): string {
    return 'Alipay';
  }

  getSupportedFormats(): string[] {
    return ['.csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Alipay;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 支付宝特定的表头识别模式
    return [
      /交易时间|交易创建时间/,
      /收\/支|交易分类/,
      /交易对方|对方/,
      /商品名称|商品/,
      /收\/付款方式|收付款方式/,
      /金额|交易金额/,
      /交易状态|状态/,
      /交易分类|分类/,
      /交易订单号|订单号/,
      /商家订单号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 检查是否为支付宝格式
    if (rows.length > 0 && rows[0][0]?.includes('支付宝')) {
      throw new Error('可能为支付宝老版本 csv 账单，请使用 1.7.0 及之前的版本尝试转换');
    }

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-Alipay] 字段映射:', fieldMap);
    console.log('[Provider-Alipay] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-Alipay] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-Alipay] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 8) return null;

    // 支付宝CSV格式字段映射
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
    const merchantId = row[fieldMap.merchantId] || '';

    if (!dateStr || !moneyStr) return null;

    const payTime = this.parseDate(dateStr);
    const money = this.parseAmount(moneyStr);
    const type = this.parseType(typeStr);

    const order: Order = {
      orderType: OrderType.Normal,
      peer,
      item: itemName,
      category,
      merchantOrderID: merchantId || undefined,
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
        merchantId,
        method
      },
      tags: []
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('记录时间') || lowerHeader.includes('交易时间') || lowerHeader.includes('时间') || lowerHeader.includes('日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('收支类型') || lowerHeader.includes('收/支') || lowerHeader.includes('类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('对方') || lowerHeader.includes('商家') || lowerHeader.includes('来源')) {
        fieldMap.peer = index;
      } else if (lowerHeader.includes('备注') || lowerHeader.includes('商品') || lowerHeader.includes('说明')) {
        fieldMap.itemName = index;
      } else if (lowerHeader.includes('账户') || lowerHeader.includes('收/付款方式') || lowerHeader.includes('方式')) {
        fieldMap.method = index;
      } else if (lowerHeader.includes('金额')) {
        fieldMap.money = index;
      } else if (lowerHeader.includes('状态')) {
        fieldMap.status = index;
      } else if (lowerHeader.includes('分类')) {
        fieldMap.category = index;
      } else if (lowerHeader.includes('交易订单号') || lowerHeader.includes('订单号')) {
        fieldMap.dealNo = index;
      } else if (lowerHeader.includes('商家订单号')) {
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
    // 处理退款和交易关闭
    const processedOrders: Order[] = [];
    
    for (let i = 0; i < ir.orders.length; i++) {
      const order = ir.orders[i];
      
      // 处理退款
      if (order.metadata.status === '退款成功' && order.category === '退款') {
        // 查找对应的原交易
        const originalOrder = this.findOriginalOrder(ir.orders, order, i);
        if (originalOrder) {
          console.log(`[orderId ${order.orderID}] 退款对应 [orderId ${originalOrder.orderID}]`);
          continue; // 跳过退款记录
        }
      }
      
      // 处理交易关闭
      if (order.metadata.status === '交易关闭' && order.metadata.type === '不计收支') {
        console.log(`[orderId ${order.orderID}] 交易已取消`);
        continue;
      }
      
      processedOrders.push(order);
    }
    
    return {
      orders: processedOrders
    };
  }

  private findOriginalOrder(orders: Order[], refundOrder: Order, refundIndex: number): Order | null {
    for (let i = 0; i < orders.length; i++) {
      if (i === refundIndex) continue;
      
      const order = orders[i];
      
      // 检查是否为对应的原交易
      if (order.orderID && 
          refundOrder.orderID && 
          refundOrder.orderID.startsWith(order.orderID) &&
          Math.abs(order.money) === Math.abs(refundOrder.money)) {
        return order;
      }
    }
    
    return null;
  }
} 