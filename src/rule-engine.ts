import type { ConfigRule } from './types/provider';
import type { IR, Order } from './types/provider';
import { Account } from './types/provider';

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
  
  applyRules(order: Order): Order {
    const matchedRule = this.findMatchingRule(order);
    
    if (matchedRule) {
      const updatedOrder = {
        ...order,
        tags: [...order.tags, ...(matchedRule.tags || [])],
        peer: matchedRule.payee || order.peer,
        category: matchedRule.category || order.category
      };

      // 优先处理 methodAccount
      if (matchedRule.methodAccount) {
        updatedOrder.extraAccounts = {
          ...updatedOrder.extraAccounts,
          [Account.MinusAccount]: matchedRule.methodAccount
        };
      } else if (matchedRule.account) {
        updatedOrder.extraAccounts = {
          ...updatedOrder.extraAccounts,
          ...(order.type === 'Send' 
            ? { [Account.MinusAccount]: matchedRule.account } 
            : { [Account.PlusAccount]: matchedRule.account }
          )
        };
      }

      return updatedOrder;
    }
    
    return order;
  }
  
  private findMatchingRule(order: Order): ConfigRule | null {
    // 构建用于匹配的文本
    const matchText = `${order.note || ''} ${order.peer || ''} ${order.item || ''} ${order.type || ''} ${order.method || ''} ${order.category || ''}`.toLowerCase();
    
    for (const rule of this.rules) {
      if (this.matchesRule(order, rule)) {
        return rule;
      }
    }
    
    return null;
  }
  
  private matchesRule(order: Order, rule: ConfigRule): boolean {
    // 构建用于匹配的文本
    const matchText = `${order.note || ''} ${order.peer || ''} ${order.item || ''} ${order.type || ''} ${order.method || ''} ${order.category || ''}`.toLowerCase();
    
    // 如果规则有多个模式（用|分隔），分别检查每个模式
    const patterns = rule.pattern.split('|').map(p => p.trim()).filter(p => p.length > 0);
    
    for (const pattern of patterns) {
      if (this.matchesPattern(matchText, pattern)) {
        return true;
      }
    }
    
    return false;
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
  
  // 批量应用规则到 IR
  applyRulesToIR(ir: IR): IR {
    return {
      orders: ir.orders.map(order => this.applyRules(order))
    };
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
  getRuleStats(ir: IR): Array<{ rule: ConfigRule; count: number; examples: string[] }> {
    const stats = this.rules.map(rule => {
      let count = 0;
      const examples: string[] = [];
      
      ir.orders.forEach(order => {
        if (this.matchesRule(order, rule)) {
          count++;
          if (examples.length < 3) {
            const text = `${order.note || ''} ${order.peer || ''}`.trim();
            examples.push(text || '无描述');
          }
        }
      });
      
      return { rule, count, examples };
    });
    
    return stats.sort((a, b) => b.count - a.count);
  }

  // 根据规则生成账户映射
  generateAccountMapping(ir: IR): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    ir.orders.forEach(order => {
      const matchedRule = this.findMatchingRule(order);
      if (matchedRule) {
        const key = `${order.peer}-${order.category}`;
        mapping[key] = matchedRule.account;
      }
    });
    
    return mapping;
  }

  // 应用账户映射到 IR
  applyAccountMapping(ir: IR, mapping: Record<string, string>): IR {
    return {
      orders: ir.orders.map(order => {
        const key = `${order.peer}-${order.category}`;
        const mappedAccount = mapping[key];
        
        if (mappedAccount) {
          return {
            ...order,
            extraAccounts: {
              ...order.extraAccounts,
              // 根据交易类型设置对应的账户
              ...(order.type === 'Send' ? { [Account.MinusAccount]: mappedAccount } : { [Account.PlusAccount]: mappedAccount })
            }
          };
        }
        
        return order;
      })
    };
  }
} 