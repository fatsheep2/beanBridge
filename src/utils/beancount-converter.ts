import type { IR, Order } from '../types/provider';
import { Account } from '../types/provider';

export class BeancountConverter {
  convertToBeancount(ir: IR, config?: any): string {
    const lines: string[] = [];
    
    // 添加文件头
    lines.push('; 由 BeanBridge 自动生成');
    lines.push('; 生成时间: ' + new Date().toISOString());
    lines.push('');
    
    // 按日期分组交易
    const groupedOrders = this.groupOrdersByDate(ir.orders);
    
    // 生成交易记录
    for (const [date, orders] of Object.entries(groupedOrders)) {
      for (const order of orders) {
        const transaction = this.convertOrderToBeancount(order, config);
        if (transaction) {
          lines.push(transaction);
          lines.push('');
        }
      }
    }
    
    return lines.join('\n');
  }
  
  private convertOrderToBeancount(order: Order, config?: any): string | null {
    const date = this.formatDate(order.payTime);
    const narration = order.note || order.item || order.peer;
    
    // 构建标签
    const tags = order.tags.length > 0 ? ` ${order.tags.map(tag => `#${tag}`).join(' ')}` : '';
    
    // 构建元数据
    const metadata = this.buildMetadata(order);
    
    // 构建账户和金额
    const postings = this.buildPostings(order, config);
    
    if (postings.length === 0) {
      return null;
    }
    
    // 组装完整的交易记录
    const lines = [
      `${date} * "${order.peer || 'Unknown'}" "${narration}"${tags}`,
      ...metadata,
      ...postings
    ];
    
    return lines.join('\n  ');
  }
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  private buildMetadata(order: Order): string[] {
    const metadata: string[] = [];
    
    // 添加订单ID
    if (order.orderID) {
      metadata.push(`  order-id: "${order.orderID}"`);
    }
    
    // 添加商家订单ID
    if (order.merchantOrderID) {
      metadata.push(`  merchant-order-id: "${order.merchantOrderID}"`);
    }
    
    // 添加交易类型
    if (order.typeOriginal) {
      metadata.push(`  type: "${order.typeOriginal}"`);
    }
    
    // 添加支付方式
    if (order.method) {
      metadata.push(`  method: "${order.method}"`);
    }
    
    // 添加分类
    if (order.category) {
      metadata.push(`  category: "${order.category}"`);
    }
    
    // 添加其他元数据
    for (const [key, value] of Object.entries(order.metadata)) {
      if (value && key !== 'status' && key !== 'dealNo' && key !== 'merchantId' && key !== 'method') {
        metadata.push(`  ${key}: "${value}"`);
      }
    }
    
    return metadata;
  }
  
  private buildPostings(order: Order, config?: any): string[] {
    const postings: string[] = [];
    const amount = Math.abs(order.money);
    const currency = order.currency || 'CNY';
    
    // 确定主要账户
    let mainAccount = 'Assets:Unknown';
    let targetAccount = 'Expenses:Unknown';
    
    if (order.type === 'Send') {
      // 支出交易
      if (order.extraAccounts[Account.MinusAccount]) {
        mainAccount = order.extraAccounts[Account.MinusAccount];
      } else if (order.method) {
        mainAccount = this.mapMethodToAccount(order.method);
      }
      
      if (order.extraAccounts[Account.PlusAccount]) {
        targetAccount = order.extraAccounts[Account.PlusAccount];
      } else {
        targetAccount = this.mapCategoryToAccount(order.category);
      }
      
      // 主要账户（资产减少）
      postings.push(`  ${mainAccount}  -${amount} ${currency}`);
      
      // 目标账户（费用增加）
      postings.push(`  ${targetAccount}  ${amount} ${currency}`);
      
    } else if (order.type === 'Recv') {
      // 收入交易
      if (order.extraAccounts[Account.PlusAccount]) {
        mainAccount = order.extraAccounts[Account.PlusAccount];
      } else if (order.method) {
        mainAccount = this.mapMethodToAccount(order.method);
      }
      
      if (order.extraAccounts[Account.MinusAccount]) {
        targetAccount = order.extraAccounts[Account.MinusAccount];
      } else {
        targetAccount = this.mapCategoryToAccount(order.category, true);
      }
      
      // 主要账户（资产增加）
      postings.push(`  ${mainAccount}  ${amount} ${currency}`);
      
      // 目标账户（收入增加）
      postings.push(`  ${targetAccount}  -${amount} ${currency}`);
    }
    
    return postings;
  }
  
  private mapMethodToAccount(method: string): string {
    const lowerMethod = method.toLowerCase();
    
    if (lowerMethod.includes('支付宝') || lowerMethod.includes('alipay')) {
      return 'Assets:Alipay';
    } else if (lowerMethod.includes('微信') || lowerMethod.includes('wechat')) {
      return 'Assets:WeChat';
    } else if (lowerMethod.includes('银行卡') || lowerMethod.includes('银行')) {
      return 'Assets:Bank';
    } else if (lowerMethod.includes('现金')) {
      return 'Assets:Cash';
    } else {
      return 'Assets:Unknown';
    }
  }
  
  private mapCategoryToAccount(category: string, isIncome: boolean = false): string {
    if (isIncome) {
      return 'Income:Other';
    }
    
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('餐饮') || lowerCategory.includes('食品')) {
      return 'Expenses:Food';
    } else if (lowerCategory.includes('交通') || lowerCategory.includes('出行')) {
      return 'Expenses:Transport';
    } else if (lowerCategory.includes('购物') || lowerCategory.includes('商品')) {
      return 'Expenses:Shopping';
    } else if (lowerCategory.includes('娱乐')) {
      return 'Expenses:Entertainment';
    } else if (lowerCategory.includes('医疗') || lowerCategory.includes('健康')) {
      return 'Expenses:Healthcare';
    } else if (lowerCategory.includes('教育')) {
      return 'Expenses:Education';
    } else if (lowerCategory.includes('住房') || lowerCategory.includes('房租')) {
      return 'Expenses:Housing';
    } else {
      return 'Expenses:Other';
    }
  }
  
  private groupOrdersByDate(orders: Order[]): Record<string, Order[]> {
    const grouped: Record<string, Order[]> = {};
    
    for (const order of orders) {
      const date = this.formatDate(order.payTime);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    }
    
    // 按日期排序
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
  }
} 