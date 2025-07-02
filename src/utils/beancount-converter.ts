import type { IR, Order } from '../types/provider';
import { Account, OrderType, CryptoTransactionType } from '../types/provider';

export class BeancountConverter {
  convertToBeancount(ir: IR, config?: any, selectedMetadata?: string[]): string {
    const lines: string[] = [];

    // 添加文件头
    lines.push('; 由 BeanBridge 自动生成');
    lines.push('; 生成时间: ' + new Date().toISOString());
    lines.push('');

    // 检查是否为加密货币数据
    const hasCryptoOrders = ir.orders.some(order =>
      order.orderType === OrderType.CryptoTransfer ||
      order.orderType === OrderType.CryptoGas
    );

    if (hasCryptoOrders) {
      // 加密货币数据：合并主交易和矿工费
      const mergedTransactions = this.mergeCryptoTransactions(ir.orders);
      const groupedTransactions = this.groupTransactionsByDate(mergedTransactions);

      for (const [date, transactions] of Object.entries(groupedTransactions)) {
        for (const transaction of transactions) {
          const beancountTransaction = this.convertCryptoTransactionToBeancount(transaction, config, selectedMetadata);
          if (beancountTransaction) {
            lines.push(beancountTransaction);
            lines.push('');
          }
        }
      }
    } else {
      // 传统数据：按原有逻辑处理
      const groupedOrders = this.groupOrdersByDate(ir.orders);

      for (const [date, orders] of Object.entries(groupedOrders)) {
        for (const order of orders) {
          const transaction = this.convertOrderToBeancount(order, config, selectedMetadata);
          if (transaction) {
            lines.push(transaction);
            lines.push('');
          }
        }
      }
    }

    return lines.join('\n');
  }

  // 合并加密货币交易（主交易 + 矿工费）
  private mergeCryptoTransactions(orders: Order[]): any[] {
    const mainTransactions = orders.filter(order =>
      order.orderType === OrderType.CryptoTransfer && !order.isGasTransaction
    );
    const gasTransactions = orders.filter(order =>
      order.orderType === OrderType.CryptoGas || order.isGasTransaction
    );

    const merged: any[] = [];

    for (const mainTx of mainTransactions) {
      const gasTx = gasTransactions.find(gas =>
        gas.transactionHash === mainTx.transactionHash ||
        gas.relatedTransactionHash === mainTx.transactionHash
      );

      merged.push({
        mainTransaction: mainTx,
        gasTransaction: gasTx,
        transactionHash: mainTx.transactionHash,
        payTime: mainTx.payTime,
        chain: mainTx.chain,
        token: mainTx.token
      });
    }

    // 处理独立的矿工费交易（没有关联的主交易）
    const unassociatedGas = gasTransactions.filter(gas =>
      !mainTransactions.some(main =>
        main.transactionHash === gas.transactionHash ||
        main.transactionHash === gas.relatedTransactionHash
      )
    );

    for (const gasTx of unassociatedGas) {
      merged.push({
        mainTransaction: null,
        gasTransaction: gasTx,
        transactionHash: gasTx.transactionHash,
        payTime: gasTx.payTime,
        chain: gasTx.chain,
        token: gasTx.token
      });
    }

    return merged;
  }

  // 转换加密货币交易为Beancount格式
  private convertCryptoTransactionToBeancount(transaction: any, config?: any, selectedMetadata?: string[]): string | null {
    const { mainTransaction, gasTransaction } = transaction;
    const date = this.formatDate(transaction.payTime);
    const time = this.formatTime(transaction.payTime);

    // 构建交易描述
    let narration = 'Cryptocurrency Transaction';
    if (mainTransaction) {
      narration = mainTransaction.item || `Transfer ${mainTransaction.token}`;
    } else if (gasTransaction) {
      narration = 'Gas Fee';
    }

    // 构建标签
    const tags = ['crypto', transaction.chain.toLowerCase()];
    if (mainTransaction?.tags) {
      tags.push(...mainTransaction.tags);
    }

    // 构建元数据
    const metadata = this.buildCryptoMetadata(transaction, selectedMetadata);

    // 构建账户和金额
    const postings = this.buildCryptoPostings(transaction, config);

    if (postings.length === 0) {
      return null;
    }

    // 组装完整的交易记录
    const lines = [
      `${date} * "${narration}" #${tags.join(' #')}`,
      ...metadata,
      ...postings
    ];

    return lines.join('\n  ');
  }

  // 构建加密货币元数据
  private buildCryptoMetadata(transaction: any, selectedMetadata?: string[]): string[] {
    const metadata: string[] = [];
    const { mainTransaction, gasTransaction, transactionHash, chain, token } = transaction;

    // 核心元数据 - 这些是必须保留的
    metadata.push(`  txhash: "${transactionHash}"`);
    metadata.push(`  chain: "${chain}"`);

    // 主交易元数据 - 只保留关键信息
    if (mainTransaction) {
      metadata.push(`  from: "${mainTransaction.fromAddress}"`);
      metadata.push(`  to: "${mainTransaction.toAddress}"`);
      metadata.push(`  token: "${mainTransaction.token}"`);

      // 只有在有区块号时才添加
      if (mainTransaction.blockNumber) {
        metadata.push(`  block: "${mainTransaction.blockNumber}"`);
      }
    }

    // 矿工费元数据 - 只保留总费用
    if (gasTransaction && gasTransaction.gasFee > 0) {
      metadata.push(`  gas: "${gasTransaction.gasFee}"`);
    }

    return metadata;
  }

  // 构建加密货币账户和金额
  private buildCryptoPostings(transaction: any, config?: any): string[] {
    const postings: string[] = [];
    const { mainTransaction, gasTransaction, chain, token } = transaction;

    // 主交易账户（代币转账）
    if (mainTransaction) {
      const amount = Math.abs(mainTransaction.money);
      const currency = mainTransaction.currency || token;

      if (mainTransaction.type === 'Send') {
        // 发送：资产账户减少，目标账户增加
        const assetAccount = mainTransaction.extraAccounts[Account.MinusAccount] ||
          config?.defaultMinusAccount ||
          `Assets:Crypto:${chain}:${token}`;
        const targetAccount = mainTransaction.extraAccounts[Account.PlusAccount] ||
          config?.defaultPlusAccount ||
          `Expenses:Life:Entertainment:Digital:数字娱乐`;

        postings.push(`  ${assetAccount}  -${amount} ${currency}`);
        postings.push(`  ${targetAccount}  ${amount} ${currency}`);
      } else if (mainTransaction.type === 'Recv') {
        // 接收：目标账户增加，收入账户减少
        const assetAccount = mainTransaction.extraAccounts[Account.PlusAccount] ||
          config?.defaultMinusAccount ||
          `Assets:Crypto:${chain}:${token}`;
        const incomeAccount = mainTransaction.extraAccounts[Account.MinusAccount] ||
          `Income:Crypto:${chain}:Transfer`;

        postings.push(`  ${assetAccount}  ${amount} ${currency}`);
        postings.push(`  ${incomeAccount}  -${amount} ${currency}`);
      }
    }

    // 矿工费账户（如果有矿工费且是支出交易）
    if (gasTransaction && gasTransaction.gasFee > 0 && mainTransaction?.type === 'Send') {
      const gasFee = gasTransaction.gasFee;
      const gasToken = gasTransaction.gasToken || 'ETH'; // 矿工费通常是ETH

      // 矿工费：资产账户减少，手续费账户增加
      const assetAccount = gasTransaction.extraAccounts[Account.MinusAccount] ||
        config?.defaultMinusAccount ||
        `Assets:Crypto:${chain}:${gasToken}`;
      const gasAccount = gasTransaction.extraAccounts[Account.CommissionAccount] ||
        config?.defaultCommissionAccount ||
        `Expenses:Life:crypto:Commission:手续费`;

      postings.push(`  ${assetAccount}  -${gasFee} ${gasToken}`);
      postings.push(`  ${gasAccount}  ${gasFee} ${gasToken}`);
    }

    return postings;
  }

  // 按日期分组交易
  private groupTransactionsByDate(transactions: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const transaction of transactions) {
      const date = this.formatDate(transaction.payTime);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    }

    // 按日期排序
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
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

    // 调试：只输出特定记录的导出账户信息
    if (order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐')) {
      console.log(`[导出调试] 订单: ${order.peer} | 时间: ${order.payTime} | 导出账户: ${mainAccount} -> ${targetAccount} | extraAccounts: ${JSON.stringify(order.extraAccounts)}`);
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