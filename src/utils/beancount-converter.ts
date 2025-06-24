import type { IR, Order } from '../types/provider';
import { Account } from '../types/provider';

export class BeancountConverter {
  convertToBeancount(ir: IR, config?: any, selectedMetadata?: string[]): string {
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
        const transaction = this.convertOrderToBeancount(order, config, selectedMetadata);
        if (transaction) {
          lines.push(transaction);
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  private convertOrderToBeancount(order: Order, config?: any, selectedMetadata?: string[]): string | null {
    const date = this.formatDate(order.payTime);
    const narration = order.note || order.item || order.peer;

    // 构建标签
    const tags = order.tags.length > 0 ? ` ${order.tags.map(tag => `#${tag}`).join(' ')}` : '';

    // 构建元数据
    const metadata = this.buildMetadata(order, selectedMetadata);

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

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private buildMetadata(order: Order, selectedMetadata?: string[]): string[] {
    const metadata: string[] = [];

    // 只输出勾选的元数据
    const meta = order.metadata || {};
    if (selectedMetadata && selectedMetadata.length > 0) {
      for (const key of selectedMetadata) {
        if (meta[key]) {
          metadata.push(`  ${key}: "${meta[key]}"`);
        }
      }
    } else {
      // 兼容老逻辑，全部输出
      for (const [key, value] of Object.entries(meta)) {
        if (value) metadata.push(`  ${key}: "${value}"`);
      }
    }

    // 添加金额信息
    metadata.push(`  amount: "${order.money}"`);
    metadata.push(`  currency: "${order.currency || 'CNY'}"`);

    // pay-time 只在用户勾选时输出，不再强制输出
    // if (selectedMetadata && selectedMetadata.includes('payTime') && order.payTime) {
    //   metadata.push(`  pay-time: "${order.payTime.toISOString()}"`);
    // }

    return metadata;
  }

  private buildPostings(order: Order, config?: any): string[] {
    const postings: string[] = [];
    const amount = Math.abs(order.money);
    const currency = order.currency || (config?.defaultCurrency || 'CNY');

    let mainAccount = '';
    let targetAccount = '';

    if (order.type === 'Send') {
      mainAccount = order.extraAccounts[Account.MinusAccount] || config?.defaultMinusAccount || 'Assets:FIXME';
      targetAccount = order.extraAccounts[Account.PlusAccount] || config?.defaultPlusAccount || 'Expenses:FIXME';
      postings.push(`  ${mainAccount}  -${amount} ${currency}`);
      postings.push(`  ${targetAccount}  ${amount} ${currency}`);
    } else if (order.type === 'Recv') {
      mainAccount = order.extraAccounts[Account.PlusAccount] || config?.defaultPlusAccount || 'Assets:FIXME';
      targetAccount = order.extraAccounts[Account.MinusAccount] || 'Income:Other';
      postings.push(`  ${mainAccount}  ${amount} ${currency}`);
      postings.push(`  ${targetAccount}  -${amount} ${currency}`);
    }

    // 处理手续费
    if (order.commission && order.commission > 0) {
      const commissionAccount = order.extraAccounts[Account.CommissionAccount] || config?.defaultCommissionAccount || 'Expenses:Commission:FIXME';
      postings.push(`  ${commissionAccount}  ${order.commission} ${currency}`);
      // 手续费从主账户扣除
      postings.push(`  ${mainAccount}  -${order.commission} ${currency}`);
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