import type { ConfigRule } from './composables/useConfigStorage';
import type { Transaction } from './utils/data-converter';

export class RuleEngine {
  private rules: ConfigRule[] = [];
  
  constructor(rules: ConfigRule[] = []) {
    this.rules = rules;
  }
  
  addRule(rule: ConfigRule) {
    this.rules.push(rule);
  }
  
  removeRule(index: number) {
    this.rules.splice(index, 1);
  }
  
  updateRule(index: number, rule: ConfigRule) {
    this.rules[index] = rule;
  }
  
  getRules(): ConfigRule[] {
    return [...this.rules];
  }
  
  applyRules(transaction: Transaction): Transaction {
    const matchedRule = this.findMatchingRule(transaction);
    
    if (matchedRule) {
      return {
        ...transaction,
        account: matchedRule.account,
        tags: [...transaction.tags, ...(matchedRule.tags || [])],
        payee: matchedRule.payee || transaction.payee
      };
    }
    
    return transaction;
  }
  
  private findMatchingRule(transaction: Transaction): ConfigRule | null {
    const text = `${transaction.narration} ${transaction.payee || ''}`.toLowerCase();
    
    for (const rule of this.rules) {
      if (this.matchesPattern(text, rule.pattern)) {
        return rule;
      }
    }
    
    return null;
  }
  
  private matchesPattern(text: string, pattern: string): boolean {
    // 支持简单的通配符匹配
    const regexPattern = pattern
      .toLowerCase()
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    try {
      const regex = new RegExp(regexPattern);
      return regex.test(text);
    } catch (error) {
      // 如果正则表达式无效，回退到简单包含匹配
      return text.includes(pattern.toLowerCase());
    }
  }
  
  // 批量应用规则
  applyRulesToTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.map(transaction => this.applyRules(transaction));
  }
  
  // 验证规则
  validateRule(rule: ConfigRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!rule.pattern || rule.pattern.trim() === '') {
      errors.push('模式不能为空');
    }
    
    if (!rule.account || rule.account.trim() === '') {
      errors.push('账户不能为空');
    }
    
    if (rule.tags && !Array.isArray(rule.tags)) {
      errors.push('标签必须是数组');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // 测试规则
  testRule(rule: ConfigRule, testText: string): boolean {
    return this.matchesPattern(testText.toLowerCase(), rule.pattern);
  }
  
  // 获取规则统计信息
  getRuleStats(transactions: Transaction[]): Array<{ rule: ConfigRule; count: number; examples: string[] }> {
    const stats = this.rules.map(rule => {
      let count = 0;
      const examples: string[] = [];
      
      transactions.forEach(transaction => {
        const text = `${transaction.narration} ${transaction.payee || ''}`;
        if (this.matchesPattern(text.toLowerCase(), rule.pattern)) {
          count++;
          if (examples.length < 3) {
            examples.push(text);
          }
        }
      });
      
      return { rule, count, examples };
    });
    
    return stats.sort((a, b) => b.count - a.count);
  }
} 