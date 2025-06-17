import type { FileData } from './file-processor';

export interface Transaction {
  id: string;
  date: string;
  payee?: string;
  narration: string;
  amount: number;
  account: string;
  tags: string[];
  postings: Posting[];
}

export interface Posting {
  account: string;
  amount: number;
  currency: string;
}

export interface IntermediateRepresentation {
  transactions: Transaction[];
  accounts: string[];
  currencies: string[];
}

export class DataConverter {
  convertToIR(fileData: FileData, provider: string, rules: any[]): IntermediateRepresentation {
    const transactions: Transaction[] = [];
    const accounts = new Set<string>();
    const currencies = new Set<string>('CNY');
    
    // 根据provider应用不同的转换规则
    switch (provider) {
      case 'alipay':
        return this.convertAlipay(fileData, rules);
      case 'wechat':
        return this.convertWechat(fileData, rules);
      case 'hsbchk':
        return this.convertHSBCHK(fileData, rules);
      default:
        return this.convertGeneric(fileData, rules);
    }
  }

  private convertAlipay(fileData: FileData, rules: any[]): IntermediateRepresentation {
    const transactions: Transaction[] = [];
    const accounts = new Set<string>();
    const currencies = new Set<string>('CNY');
    
    const { headers, rows } = fileData;
    
    // 查找关键字段的索引
    const dateIndex = headers.findIndex(h => h.includes('日期') || h.includes('时间'));
    const amountIndex = headers.findIndex(h => h.includes('金额') || h.includes('收/支'));
    const payeeIndex = headers.findIndex(h => h.includes('对方') || h.includes('商家'));
    const narrationIndex = headers.findIndex(h => h.includes('商品') || h.includes('说明'));
    
    rows.forEach((row, index) => {
      if (!row[dateIndex] || !row[amountIndex]) return;
      
      const date = this.parseDate(row[dateIndex]);
      const amount = this.parseAmount(row[amountIndex]);
      const payee = row[payeeIndex] || '';
      const narration = row[narrationIndex] || payee;
      
      const transaction: Transaction = {
        id: `alipay_${index}`,
        date,
        payee: payee || undefined,
        narration,
        amount,
        account: 'Assets:Alipay',
        tags: this.extractTags(narration, payee),
        postings: [
          {
            account: 'Assets:Alipay',
            amount: -amount,
            currency: 'CNY'
          },
          {
            account: amount > 0 ? 'Income:Other' : 'Expenses:Other',
            amount: amount,
            currency: 'CNY'
          }
        ]
      };
      
      transactions.push(transaction);
      accounts.add('Assets:Alipay');
      accounts.add(amount > 0 ? 'Income:Other' : 'Expenses:Other');
    });
    
    return { transactions, accounts: Array.from(accounts), currencies: Array.from(currencies) };
  }

  private convertWechat(fileData: FileData, rules: any[]): IntermediateRepresentation {
    const transactions: Transaction[] = [];
    const accounts = new Set<string>();
    const currencies = new Set<string>('CNY');
    
    const { headers, rows } = fileData;
    
    // 查找关键字段的索引
    const dateIndex = headers.findIndex(h => h.includes('日期') || h.includes('时间'));
    const amountIndex = headers.findIndex(h => h.includes('金额') || h.includes('收/支'));
    const payeeIndex = headers.findIndex(h => h.includes('对方') || h.includes('商家'));
    const narrationIndex = headers.findIndex(h => h.includes('商品') || h.includes('说明'));
    
    rows.forEach((row, index) => {
      if (!row[dateIndex] || !row[amountIndex]) return;
      
      const date = this.parseDate(row[dateIndex]);
      const amount = this.parseAmount(row[amountIndex]);
      const payee = row[payeeIndex] || '';
      const narration = row[narrationIndex] || payee;
      
      const transaction: Transaction = {
        id: `wechat_${index}`,
        date,
        payee: payee || undefined,
        narration,
        amount,
        account: 'Assets:WeChat',
        tags: this.extractTags(narration, payee),
        postings: [
          {
            account: 'Assets:WeChat',
            amount: -amount,
            currency: 'CNY'
          },
          {
            account: amount > 0 ? 'Income:Other' : 'Expenses:Other',
            amount: amount,
            currency: 'CNY'
          }
        ]
      };
      
      transactions.push(transaction);
      accounts.add('Assets:WeChat');
      accounts.add(amount > 0 ? 'Income:Other' : 'Expenses:Other');
    });
    
    return { transactions, accounts: Array.from(accounts), currencies: Array.from(currencies) };
  }

  private convertHSBCHK(fileData: FileData, rules: any[]): IntermediateRepresentation {
    const transactions: Transaction[] = [];
    const accounts = new Set<string>();
    const currencies = new Set<string>('HKD');
    
    const { headers, rows } = fileData;
    
    // 查找关键字段的索引
    const dateIndex = headers.findIndex(h => h.includes('日期') || h.includes('时间'));
    const amountIndex = headers.findIndex(h => h.includes('金额') || h.includes('收/支'));
    const payeeIndex = headers.findIndex(h => h.includes('对方') || h.includes('商家'));
    const narrationIndex = headers.findIndex(h => h.includes('商品') || h.includes('说明'));
    
    rows.forEach((row, index) => {
      if (!row[dateIndex] || !row[amountIndex]) return;
      
      const date = this.parseDate(row[dateIndex]);
      const amount = this.parseAmount(row[amountIndex]);
      const payee = row[payeeIndex] || '';
      const narration = row[narrationIndex] || payee;
      
      const transaction: Transaction = {
        id: `hsbchk_${index}`,
        date,
        payee: payee || undefined,
        narration,
        amount,
        account: 'Assets:Bank:HSBCHK',
        tags: this.extractTags(narration, payee),
        postings: [
          {
            account: 'Assets:Bank:HSBCHK',
            amount: -amount,
            currency: 'HKD'
          },
          {
            account: amount > 0 ? 'Income:Other' : 'Expenses:Other',
            amount: amount,
            currency: 'HKD'
          }
        ]
      };
      
      transactions.push(transaction);
      accounts.add('Assets:Bank:HSBCHK');
      accounts.add(amount > 0 ? 'Income:Other' : 'Expenses:Other');
    });
    
    return { transactions, accounts: Array.from(accounts), currencies: Array.from(currencies) };
  }

  private convertGeneric(fileData: FileData, rules: any[]): IntermediateRepresentation {
    const transactions: Transaction[] = [];
    const accounts = new Set<string>();
    const currencies = new Set<string>('CNY');
    
    const { headers, rows } = fileData;
    
    // 尝试自动映射字段
    const fieldMapping = this.autoMapFields(headers);
    
    rows.forEach((row, index) => {
      const date = fieldMapping.date !== -1 ? this.parseDate(row[fieldMapping.date]) : new Date().toISOString().split('T')[0];
      const amount = fieldMapping.amount !== -1 ? this.parseAmount(row[fieldMapping.amount]) : 0;
      const payee = fieldMapping.payee !== -1 ? row[fieldMapping.payee] : '';
      const narration = fieldMapping.narration !== -1 ? row[fieldMapping.narration] : payee;
      
      if (!date || amount === 0) return;
      
      const transaction: Transaction = {
        id: `generic_${index}`,
        date,
        payee: payee || undefined,
        narration,
        amount,
        account: 'Assets:Bank:Generic',
        tags: this.extractTags(narration, payee),
        postings: [
          {
            account: 'Assets:Bank:Generic',
            amount: -amount,
            currency: 'CNY'
          },
          {
            account: amount > 0 ? 'Income:Other' : 'Expenses:Other',
            amount: amount,
            currency: 'CNY'
          }
        ]
      };
      
      transactions.push(transaction);
      accounts.add('Assets:Bank:Generic');
      accounts.add(amount > 0 ? 'Income:Other' : 'Expenses:Other');
    });
    
    return { transactions, accounts: Array.from(accounts), currencies: Array.from(currencies) };
  }

  private autoMapFields(headers: string[]): { date: number; amount: number; payee: number; narration: number } {
    const mapping = { date: -1, amount: -1, payee: -1, narration: -1 };
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('日期') || lowerHeader.includes('时间') || lowerHeader.includes('date')) {
        mapping.date = index;
      } else if (lowerHeader.includes('金额') || lowerHeader.includes('amount') || lowerHeader.includes('收/支')) {
        mapping.amount = index;
      } else if (lowerHeader.includes('对方') || lowerHeader.includes('商家') || lowerHeader.includes('payee')) {
        mapping.payee = index;
      } else if (lowerHeader.includes('商品') || lowerHeader.includes('说明') || lowerHeader.includes('description')) {
        mapping.narration = index;
      }
    });
    
    return mapping;
  }

  private parseDate(dateStr: string): string {
    // 尝试多种日期格式
    const dateFormats = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    ];
    
    for (const format of dateFormats) {
      const match = dateStr.match(format);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // 如果无法解析，返回当前日期
    return new Date().toISOString().split('T')[0];
  }

  private parseAmount(amountStr: string): number {
    // 移除货币符号和空格
    const cleanStr = amountStr.replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleanStr);
    return isNaN(amount) ? 0 : amount;
  }

  private extractTags(narration: string, payee: string): string[] {
    const tags: string[] = [];
    const text = `${narration} ${payee}`.toLowerCase();
    
    // 简单的标签提取逻辑
    if (text.includes('咖啡') || text.includes('星巴克')) tags.push('coffee');
    if (text.includes('外卖') || text.includes('美团') || text.includes('饿了么')) tags.push('food');
    if (text.includes('打车') || text.includes('滴滴') || text.includes('uber')) tags.push('transport');
    if (text.includes('购物') || text.includes('淘宝') || text.includes('京东')) tags.push('shopping');
    if (text.includes('电影') || text.includes('娱乐')) tags.push('entertainment');
    
    return tags;
  }

  convertToBeancount(ir: IntermediateRepresentation, config?: any): string {
    let output = '';
    
    // 添加文件头
    if (config?.includeHeader !== false) {
      output += 'option "title" "BeanBridge生成的账本"\n';
      output += 'option "operating_currency" "CNY"\n\n';
    }
    
    // 按日期分组
    const groupedTransactions = this.groupTransactionsByDate(ir.transactions);
    
    Object.keys(groupedTransactions).sort().forEach(date => {
      const transactions = groupedTransactions[date];
      
      transactions.forEach(transaction => {
        // 日期和状态
        output += `${transaction.date} * "${transaction.payee || '未知'}" "${transaction.narration}"\n`;
        
        // 分录
        transaction.postings.forEach(posting => {
          const sign = posting.amount >= 0 ? ' ' : '';
          output += `  ${posting.account}  ${sign}${posting.amount.toFixed(2)} ${posting.currency}\n`;
        });
        
        // 标签
        if (transaction.tags.length > 0) {
          output += `  Tags: ${transaction.tags.join(', ')}\n`;
        }
        
        output += '\n';
      });
    });
    
    return output.trim();
  }

  private groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
    const grouped: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      grouped[transaction.date].push(transaction);
    });
    
    return grouped;
  }
} 