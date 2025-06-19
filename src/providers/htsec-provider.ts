import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';

export class HtsecProvider extends BaseProvider {
  getProviderName(): string {
    return '华泰证券';
  }

  getSupportedFormats(): string[] {
    return ['.csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.Htsec;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 华泰证券特定的表头识别模式
    return [
      /交易日期|日期|成交日期/,
      /证券代码|股票代码|代码/,
      /证券名称|股票名称|名称/,
      /交易类型|业务类型|操作类型/,
      /成交数量|数量|股数/,
      /成交价格|价格|单价/,
      /成交金额|金额|总额/,
      /手续费|佣金|费用/,
      /印花税|税/,
      /过户费/,
      /其他费用/,
      /成交编号|订单号|流水号/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];

    // 调试：显示字段映射
    const fieldMap = this.mapFields(headers);
    console.log('[Provider-Htsec] 字段映射:', fieldMap);
    console.log('[Provider-Htsec] 表头:', headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 1; // 行号从1开始

      try {
        const order = this.parseOrder(row, headers);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        } else {
          console.warn(`[Provider-Htsec] 第 ${this.lineNum} 行解析失败，跳过`);
        }
      } catch (error) {
        console.warn(`第 ${this.lineNum} 行解析失败:`, error);
        continue;
      }
    }

    console.log(`[Provider-Htsec] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], headers: string[]): Order | null {
    if (row.length < 8) return null;

    // 华泰证券CSV格式字段映射
    const fieldMap = this.mapFields(headers);
    
    const dateStr = row[fieldMap.date] || '';
    const stockCode = row[fieldMap.stockCode] || '';
    const stockName = row[fieldMap.stockName] || '';
    const typeStr = row[fieldMap.type] || '';
    const amountStr = row[fieldMap.amount] || '';
    const priceStr = row[fieldMap.price] || '';
    const totalStr = row[fieldMap.total] || '';
    const feeStr = row[fieldMap.fee] || '';
    const taxStr = row[fieldMap.tax] || '';
    const transferFeeStr = row[fieldMap.transferFee] || '';
    const otherFeeStr = row[fieldMap.otherFee] || '';
    const orderId = row[fieldMap.orderId] || '';

    if (!dateStr || !amountStr || !priceStr) return null;

    const payTime = this.parseDate(dateStr);
    const amount = this.parseAmount(amountStr);
    const price = this.parseAmount(priceStr);
    const total = this.parseAmount(totalStr);
    const fee = this.parseAmount(feeStr);
    const tax = this.parseAmount(taxStr);
    const transferFee = this.parseAmount(transferFeeStr);
    const otherFee = this.parseAmount(otherFeeStr);
    const type = this.parseType(typeStr);

    // 计算总费用
    const totalFee = fee + tax + transferFee + otherFee;
    
    // 计算实际金额（买入为负，卖出为正）
    const money = type === Type.Send ? -(total + totalFee) : (total - totalFee);

    const order: Order = {
      orderType: OrderType.SecuritiesTrade,
      peer: '华泰证券',
      item: `${stockName}(${stockCode})`,
      category: typeStr,
      merchantOrderID: undefined,
      orderID: orderId || undefined,
      money,
      note: `${typeStr} ${stockName} - 数量: ${amount}, 价格: ${price}`,
      payTime,
      type,
      typeOriginal: typeStr,
      txTypeOriginal: typeStr,
      method: '证券交易',
      amount: Math.abs(amount),
      price: price,
      currency: 'CNY',
      commission: totalFee,
      units: {
        [Unit.BaseUnit]: stockCode || '',
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
        stockCode,
        stockName,
        orderId,
        amount: amount.toString(),
        price: price.toString(),
        total: total.toString(),
        fee: fee.toString(),
        tax: tax.toString(),
        transferFee: transferFee.toString(),
        otherFee: otherFee.toString()
      },
      tags: ['securities', 'htsec']
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('日期') || lowerHeader.includes('交易日期') || lowerHeader.includes('成交日期')) {
        fieldMap.date = index;
      } else if (lowerHeader.includes('代码') || lowerHeader.includes('证券代码') || lowerHeader.includes('股票代码')) {
        fieldMap.stockCode = index;
      } else if (lowerHeader.includes('名称') || lowerHeader.includes('证券名称') || lowerHeader.includes('股票名称')) {
        fieldMap.stockName = index;
      } else if (lowerHeader.includes('类型') || lowerHeader.includes('业务类型') || lowerHeader.includes('操作类型')) {
        fieldMap.type = index;
      } else if (lowerHeader.includes('数量') || lowerHeader.includes('成交数量') || lowerHeader.includes('股数')) {
        fieldMap.amount = index;
      } else if (lowerHeader.includes('价格') || lowerHeader.includes('成交价格') || lowerHeader.includes('单价')) {
        fieldMap.price = index;
      } else if (lowerHeader.includes('金额') || lowerHeader.includes('成交金额') || lowerHeader.includes('总额')) {
        fieldMap.total = index;
      } else if (lowerHeader.includes('手续费') || lowerHeader.includes('佣金')) {
        fieldMap.fee = index;
      } else if (lowerHeader.includes('印花税') || lowerHeader.includes('税')) {
        fieldMap.tax = index;
      } else if (lowerHeader.includes('过户费')) {
        fieldMap.transferFee = index;
      } else if (lowerHeader.includes('其他费用')) {
        fieldMap.otherFee = index;
      } else if (lowerHeader.includes('编号') || lowerHeader.includes('成交编号') || lowerHeader.includes('订单号')) {
        fieldMap.orderId = index;
      }
    });

    return fieldMap;
  }

  private parseType(typeStr: string): Type {
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('买入') || lowerType.includes('证券买入')) {
      return Type.Send;
    } else if (lowerType.includes('卖出') || lowerType.includes('证券卖出')) {
      return Type.Recv;
    } else if (lowerType.includes('分红') || lowerType.includes('派息')) {
      return Type.Recv;
    } else if (lowerType.includes('配股') || lowerType.includes('增发')) {
      return Type.Send;
    } else {
      return Type.Unknown;
    }
  }

  protected postProcess(ir: IR): IR {
    // 华泰证券特有的后处理逻辑
    const processedOrders: Order[] = [];
    
    for (const order of ir.orders) {
      // 过滤掉无效交易
      if (order.metadata.stockCode === '' || order.metadata.stockName === '') {
        console.log(`[orderId ${order.orderID}] 股票信息缺失，跳过`);
        continue;
      }
      
      processedOrders.push(order);
    }
    
    return {
      orders: processedOrders
    };
  }
} 