import type { DataSource, Rule } from '../types/data-source';

export interface ProcessedTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  account: string;
  type: string;
  peer: string;
  method: string;
  status: string;
  originalData: any;
}

export interface ProcessingResult {
  success: boolean;
  timestamp: string;
  stats: {
    total: number;
    success: number;
    warning: number;
    error: number;
  };
  messages: Array<{
    type: 'success' | 'warning' | 'error' | 'info';
    content: string;
  }>;
  transactions: ProcessedTransaction[];
  totalCount: number;
  successCount: number;
  failedCount: number;
  appliedRules: number;
}

export interface ParseError {
  type: 'format' | 'encoding' | 'structure' | 'data' | 'unknown';
  message: string;
  details?: string;
  line?: number;
  column?: number;
}

export class DataSourceProcessor {
  private rules: Rule[] = [];
  private dataSource: DataSource | null = null;

  constructor(dataSource: DataSource | null = null, rules: Rule[] = []) {
    this.dataSource = dataSource;
    this.rules = rules;
  }

  // 设置数据源和规则
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  setRules(rules: Rule[]) {
    this.rules = rules;
  }

  // 处理文件数据
  async processFile(fileData: any): Promise<ProcessingResult> {
    if (!this.dataSource) {
      throw new Error('数据源未设置');
    }

    const messages: Array<{type: 'success' | 'warning' | 'error' | 'info', content: string}> = [];
    let warningCount = 0;
    let errorCount = 0;

    try {
      // 验证文件格式
      const formatValidation = this.validateFileFormat(fileData);
      if (!formatValidation.valid && formatValidation.error) {
        messages.push({
          type: 'error',
          content: `文件格式验证失败: ${formatValidation.error.message}`
        });
        errorCount++;
        return this.createErrorResult(messages, errorCount);
      }

      const rawTransactions = this.parseRawData(fileData);
      messages.push({
        type: 'info',
        content: `开始处理 ${rawTransactions.length} 条原始记录`
      });

      if (rawTransactions.length === 0) {
        messages.push({
          type: 'warning',
          content: '未找到有效的交易记录，请检查文件格式或数据源配置'
        });
        warningCount++;
      }

      const processedTransactions = this.applyRules(rawTransactions);
      
      messages.push({
        type: 'success',
        content: `成功处理 ${processedTransactions.length} 条交易记录`
      });

      // 检查处理结果
      if (processedTransactions.length < rawTransactions.length) {
        const failedCount = rawTransactions.length - processedTransactions.length;
        messages.push({
          type: 'warning',
          content: `${failedCount} 条记录未能匹配规则，可能需要添加新的解析规则`
        });
        warningCount += failedCount;
      }

      // 检查数据质量
      const invalidAmounts = processedTransactions.filter(t => t.amount === 0);
      if (invalidAmounts.length > 0) {
        messages.push({
          type: 'warning',
          content: `发现 ${invalidAmounts.length} 条金额为0的记录，请检查数据`
        });
        warningCount += invalidAmounts.length;
      }

      const invalidDates = processedTransactions.filter(t => !t.date || t.date === '');
      if (invalidDates.length > 0) {
        messages.push({
          type: 'warning',
          content: `发现 ${invalidDates.length} 条日期无效的记录`
        });
        warningCount += invalidDates.length;
      }

      // 应用规则统计
      if (this.rules.length > 0) {
        messages.push({
          type: 'info',
          content: `应用了 ${this.rules.length} 条解析规则`
        });
      } else {
        messages.push({
          type: 'warning',
          content: '未配置解析规则，将使用默认处理方式'
        });
        warningCount++;
      }

      const success = processedTransactions.length > 0;
      if (!success) {
        messages.push({
          type: 'error',
          content: '未能成功处理任何交易记录，请检查数据源配置和文件格式'
        });
        errorCount++;
      }

      return {
        transactions: processedTransactions,
        totalCount: rawTransactions.length,
        successCount: processedTransactions.length,
        failedCount: rawTransactions.length - processedTransactions.length,
        appliedRules: this.rules.length,
        success,
        timestamp: new Date().toISOString(),
        stats: {
          total: rawTransactions.length,
          success: processedTransactions.length,
          warning: warningCount,
          error: errorCount
        },
        messages
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      messages.push({
        type: 'error',
        content: `处理过程中发生错误: ${errorMessage}`
      });
      errorCount++;

      return this.createErrorResult(messages, errorCount);
    }
  }

  // 验证文件格式
  private validateFileFormat(fileData: any): { valid: boolean; error?: ParseError } {
    if (!fileData || !fileData.rows || !Array.isArray(fileData.rows)) {
      return {
        valid: false,
        error: {
          type: 'structure',
          message: '文件结构无效，缺少数据行',
          details: '文件应该包含rows数组'
        }
      };
    }

    if (fileData.rows.length === 0) {
      return {
        valid: false,
        error: {
          type: 'data',
          message: '文件为空，没有数据行',
          details: '请检查文件是否包含交易数据'
        }
      };
    }

    // 根据数据源验证特定格式
    if (this.dataSource) {
      const validation = this.validateDataSourceFormat(fileData);
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }

  // 根据数据源验证特定格式
  private validateDataSourceFormat(fileData: any): { valid: boolean; error?: ParseError } {
    if (!this.dataSource) return { valid: true };

    const firstRow = fileData.rows[0];
    const secondRow = fileData.rows[1];

    switch (this.dataSource.id) {
      case 'alipay':
        return this.validateAlipayFormat(fileData);
      case 'wechat':
        return this.validateWechatFormat(fileData);
      case 'icbc':
        return this.validateICBCFormat(fileData);
      case 'jd':
        return this.validateJDFormat(fileData);
      case 'huobi':
        return this.validateHuobiFormat(fileData);
      default:
        return { valid: true };
    }
  }

  // 支付宝格式验证
  private validateAlipayFormat(fileData: any): { valid: boolean; error?: ParseError } {
    const content = fileData.content || '';
    if (!content.includes('支付宝') && !content.includes('交易时间')) {
      return {
        valid: false,
        error: {
          type: 'format',
          message: '不是有效的支付宝账单文件',
          details: '文件应包含支付宝标识和交易时间字段'
        }
      };
    }
    return { valid: true };
  }

  // 微信格式验证
  private validateWechatFormat(fileData: any): { valid: boolean; error?: ParseError } {
    const content = fileData.content || '';
    if (!content.includes('微信支付') && !content.includes('交易时间')) {
      return {
        valid: false,
        error: {
          type: 'format',
          message: '不是有效的微信支付账单文件',
          details: '文件应包含微信支付标识和交易时间字段'
        }
      };
    }
    return { valid: true };
  }

  // 工商银行格式验证
  private validateICBCFormat(fileData: any): { valid: boolean; error?: ParseError } {
    const content = fileData.content || '';
    if (!content.includes('交易日期') && !content.includes('明细查询')) {
      return {
        valid: false,
        error: {
          type: 'format',
          message: '不是有效的工商银行对账单文件',
          details: '文件应包含交易日期字段和工商银行标识'
        }
      };
    }
    return { valid: true };
  }

  // 京东格式验证
  private validateJDFormat(fileData: any): { valid: boolean; error?: ParseError } {
    const content = fileData.content || '';
    if (!content.includes('京东') && !content.includes('交易时间')) {
      return {
        valid: false,
        error: {
          type: 'format',
          message: '不是有效的京东账单文件',
          details: '文件应包含京东标识和交易时间字段'
        }
      };
    }
    return { valid: true };
  }

  // 火币格式验证
  private validateHuobiFormat(fileData: any): { valid: boolean; error?: ParseError } {
    const content = fileData.content || '';
    if (!content.includes('时间') && !content.includes('交易类型')) {
      return {
        valid: false,
        error: {
          type: 'format',
          message: '不是有效的火币交易记录文件',
          details: '文件应包含时间和交易类型字段'
        }
      };
    }
    return { valid: true };
  }

  // 根据数据源解析原始数据
  private parseRawData(fileData: any): any[] {
    if (!this.dataSource) return [];

    switch (this.dataSource.id) {
      case 'alipay':
        return this.parseAlipayData(fileData);
      case 'wechat':
        return this.parseWechatData(fileData);
      case 'icbc':
        return this.parseICBCData(fileData);
      case 'cmb':
        return this.parseCMBData(fileData);
      case 'ccb':
        return this.parseCCBData(fileData);
      case 'citic':
        return this.parseCITICData(fileData);
      case 'jd':
        return this.parseJDData(fileData);
      case 'huobi':
        return this.parseHuobiData(fileData);
      default:
        return this.parseGenericData(fileData);
    }
  }

  // 支付宝数据处理
  private parseAlipayData(fileData: any): any[] {
    const rows = fileData.rows || [];
    const transactions = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 12) continue;
      
      // 跳过标题行和空行
      if (i === 0 || !row[0] || row[0].includes('交易时间')) continue;
      
      const transaction = {
        date: this.parseDate(row[0]),
        time: this.parseTime(row[0]),
        amount: this.parseAmount(row[6]),
        description: row[4] || '',
        category: row[4] || '',
        account: row[5] || '',
        type: row[1] || '',
        peer: row[2] || '',
        method: row[7] || '',
        status: row[8] || '',
        originalData: row
      };
      
      if (transaction.date && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  // 微信支付数据处理
  private parseWechatData(fileData: any): any[] {
    const rows = fileData.rows || [];
    const transactions = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 10) continue;
      
      // 跳过标题行和空行
      if (i === 0 || !row[0] || row[0].includes('交易时间')) continue;
      
      const transaction = {
        date: this.parseDate(row[0]),
        time: this.parseTime(row[0]),
        amount: this.parseAmount(row[5]),
        description: row[3] || '',
        category: row[3] || '',
        account: row[6] || '',
        type: row[1] || '',
        peer: row[2] || '',
        method: row[6] || '',
        status: row[7] || '',
        originalData: row
      };
      
      if (transaction.date && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  // 工商银行数据处理
  private parseICBCData(fileData: any): any[] {
    const rows = fileData.rows || [];
    const transactions = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 12) continue;
      
      // 跳过标题行和空行
      if (i === 0 || !row[0] || row[0].includes('交易日期')) continue;
      
      // 计算净金额（收入-支出）
      const income = this.parseAmount(row[8]);
      const expense = this.parseAmount(row[9]);
      const amount = income - expense;
      
      const transaction = {
        date: this.parseDate(row[0]),
        time: '',
        amount: amount,
        description: row[1] || '',
        category: row[1] || '',
        account: row[11] || '',
        type: row[1] || '',
        peer: row[11] || '',
        method: row[1] || '',
        status: '交易成功',
        originalData: row
      };
      
      if (transaction.date && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  // 京东数据处理
  private parseJDData(fileData: any): any[] {
    const rows = fileData.rows || [];
    const transactions = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 10) continue;
      
      // 跳过标题行和空行
      if (i === 0 || !row[0] || row[0].includes('交易时间')) continue;
      
      const transaction = {
        date: this.parseDate(row[0]),
        time: this.parseTime(row[0]),
        amount: this.parseAmount(row[3]),
        description: row[2] || '',
        category: row[7] || '',
        account: row[4] || '',
        type: row[1] || '',
        peer: row[1] || '',
        method: row[4] || '',
        status: row[5] || '',
        originalData: row
      };
      
      if (transaction.date && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  // 火币数据处理
  private parseHuobiData(fileData: any): any[] {
    const rows = fileData.rows || [];
    const transactions = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 8) continue;
      
      // 跳过标题行和空行
      if (i === 0 || !row[0] || row[0].includes('时间')) continue;
      
      const transaction = {
        date: this.parseDate(row[0]),
        time: this.parseTime(row[0]),
        amount: this.parseAmount(row[6]),
        description: `${row[2]} ${row[3]}`,
        category: row[1] || '',
        account: row[2] || '',
        type: row[1] || '',
        peer: row[2] || '',
        method: row[1] || '',
        status: '交易成功',
        originalData: row
      };
      
      if (transaction.date && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  // 招商银行数据处理
  private parseCMBData(fileData: any): any[] {
    const rows = fileData.rows || [];
    return rows.map((row: any[], index: number) => ({
      date: row[0] || '',
      time: row[1] || '',
      amount: this.parseAmount(row[2] || ''),
      description: row[3] || '',
      category: row[4] || '',
      account: row[5] || '',
      type: row[6] || '',
      peer: row[7] || '',
      method: row[8] || '',
      status: row[9] || '',
      originalData: row
    }));
  }

  // 建设银行数据处理
  private parseCCBData(fileData: any): any[] {
    const rows = fileData.rows || [];
    return rows.map((row: any[], index: number) => ({
      date: row[0] || '',
      time: row[1] || '',
      amount: this.parseAmount(row[2] || ''),
      description: row[3] || '',
      category: row[4] || '',
      account: row[5] || '',
      type: row[6] || '',
      peer: row[7] || '',
      method: row[8] || '',
      status: row[9] || '',
      originalData: row
    }));
  }

  // 中信银行数据处理
  private parseCITICData(fileData: any): any[] {
    const rows = fileData.rows || [];
    return rows.map((row: any[], index: number) => ({
      date: row[0] || '',
      time: row[1] || '',
      amount: this.parseAmount(row[2] || ''),
      description: row[3] || '',
      category: row[4] || '',
      account: row[5] || '',
      type: row[6] || '',
      peer: row[7] || '',
      method: row[8] || '',
      status: row[9] || '',
      originalData: row
    }));
  }

  // 通用数据处理
  private parseGenericData(fileData: any): any[] {
    const rows = fileData.rows || [];
    return rows.map((row: any[], index: number) => ({
      date: row[0] || '',
      time: row[1] || '',
      amount: this.parseAmount(row[2] || ''),
      description: row[3] || '',
      category: row[4] || '',
      account: row[5] || '',
      type: row[6] || '',
      peer: row[7] || '',
      method: row[8] || '',
      status: row[9] || '',
      originalData: row
    }));
  }

  // 应用规则筛选
  private applyRules(rawTransactions: any[]): ProcessedTransaction[] {
    if (this.rules.length === 0) {
      // 如果没有规则，返回所有交易
      return rawTransactions.map((tx, index) => ({
        ...tx,
        id: `tx_${index}`,
        targetAccount: this.dataSource?.defaultMinusAccount || 'Expenses:FIXME',
        methodAccount: this.dataSource?.defaultPlusAccount || 'Assets:Bank'
      }));
    }

    return rawTransactions
      .map((tx, index) => {
        const processedTx = {
          ...tx,
          id: `tx_${index}`,
          targetAccount: this.dataSource?.defaultMinusAccount || 'Expenses:FIXME',
          methodAccount: this.dataSource?.defaultPlusAccount || 'Assets:Bank'
        };

        // 应用规则
        for (const rule of this.rules) {
          if (this.matchesRule(processedTx, rule)) {
            if (rule.actions.ignore) {
              return null; // 忽略此交易
            }
            
            // 应用规则动作
            if (rule.actions.targetAccount) {
              processedTx.targetAccount = rule.actions.targetAccount;
            }
            if (rule.actions.methodAccount) {
              processedTx.methodAccount = rule.actions.methodAccount;
            }
            if (rule.actions.commissionAccount) {
              processedTx.commissionAccount = rule.actions.commissionAccount;
            }
            
            break; // 只应用第一个匹配的规则
          }
        }

        return processedTx;
      })
      .filter(tx => tx !== null) as ProcessedTransaction[];
  }

  // 检查交易是否匹配规则
  private matchesRule(transaction: any, rule: Rule): boolean {
    return rule.conditions.every(condition => {
      const fieldValue = transaction[condition.field];
      const ruleValue = condition.value;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === ruleValue;
        case 'contains':
          return fieldValue && fieldValue.includes(ruleValue);
        case 'regex':
          try {
            const regex = new RegExp(ruleValue as string);
            return regex.test(fieldValue);
          } catch {
            return false;
          }
        case 'time':
          if (condition.time && transaction.time) {
            return this.isInTimeRange(transaction.time, condition.time);
          }
          return false;
        case 'fullMatch':
          return fieldValue === ruleValue;
        default:
          return false;
      }
    });
  }

  // 检查时间是否在范围内
  private isInTimeRange(time: string, timeRange: string): boolean {
    const [start, end] = timeRange.split('-');
    const timeValue = this.parseTime(time);
    const startValue = this.parseTime(start);
    const endValue = this.parseTime(end);
    
    return timeValue >= startValue && timeValue <= endValue;
  }

  // 解析时间字符串为分钟数
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  // 解析日期
  private parseDate(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    
    // 处理 "2023-02-12 21:32:14" 格式
    const dateMatch = dateTimeStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }
    
    // 处理 "2023-05-02" 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTimeStr)) {
      return dateTimeStr;
    }
    
    return '';
  }

  // 解析时间
  private parseTimeFromDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    
    // 处理 "2023-02-12 21:32:14" 格式
    const timeMatch = dateTimeStr.match(/(\d{2}:\d{2}:\d{2})/);
    if (timeMatch) {
      return timeMatch[1];
    }
    
    return '';
  }

  // 解析金额
  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // 移除货币符号和千位分隔符
    const cleanAmount = amountStr.replace(/[¥$€£,]/g, '');
    
    // 处理负数（括号或负号）
    const isNegative = cleanAmount.includes('(') || cleanAmount.includes(')') || cleanAmount.startsWith('-');
    const numericAmount = cleanAmount.replace(/[()]/g, '');
    
    const amount = parseFloat(numericAmount) || 0;
    return isNegative ? -amount : amount;
  }

  // 创建错误结果
  private createErrorResult(messages: Array<{type: 'success' | 'warning' | 'error' | 'info', content: string}>, errorCount: number): ProcessingResult {
    return {
      transactions: [],
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      appliedRules: 0,
      success: false,
      timestamp: new Date().toISOString(),
      stats: {
        total: 0,
        success: 0,
        warning: 0,
        error: errorCount
      },
      messages
    };
  }
} 