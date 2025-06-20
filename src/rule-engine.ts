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

  // 找到最优规则：字段多的优先，priority高的优先
  private findBestRule(order: Order): ConfigRule | null {
    const fieldList = ['peer', 'item', 'type', 'method', 'category', 'txType'] as const;
    const sortedRules = [...this.rules].sort((a, b) => {
      const aFields = fieldList.filter(f => !!(a as any)[f]).length;
      const bFields = fieldList.filter(f => !!(b as any)[f]).length;
      if (bFields !== aFields) return bFields - aFields;
      // priority越大越优先
      return (b.priority ?? 0) - (a.priority ?? 0);
    });
    for (const rule of sortedRules) {
      if (this.matchesRule(order, rule)) {
        return rule;
      }
    }
    return null;
  }

  applyRules(order: Order): Order {
    const matchedRules = this.findAllMatchingRulesSorted(order);

    if (matchedRules.length > 0) {
      console.log('Order matched rules:', {
        order: `${order.peer} ${order.item} ${order.typeOriginal} ${order.method}`,
        matchedRules: matchedRules.map(r => ({
          pattern: r.pattern,
          account: r.account,
          methodAccount: r.methodAccount,
          item: r.item,
          type: r.type,
          method: r.method
        }))
      });

      let updatedOrder = {
        ...order,
        tags: [...order.tags],
        peer: order.peer,
        category: order.category
      };

      // 按优先级和精确度排序的规则，依次应用
      for (const matchedRule of matchedRules) {
        console.log('Applying rule:', {
          pattern: matchedRule.pattern,
          account: matchedRule.account,
          methodAccount: matchedRule.methodAccount
        });

        // 合并标签
        if (matchedRule.tags) {
          updatedOrder.tags.push(...matchedRule.tags);
        }

        // 设置 payee 和 category（后面的规则会覆盖前面的）
        if (matchedRule.payee) {
          updatedOrder.peer = matchedRule.payee;
        }
        if (matchedRule.category) {
          updatedOrder.category = matchedRule.category;
        }

        // 设置账户映射
        if (order.type === 'Send') {
          if (matchedRule.methodAccount && matchedRule.methodAccount !== 'Assets:FIXME') {
            updatedOrder.extraAccounts[Account.MinusAccount] = matchedRule.methodAccount;
            console.log('Set MinusAccount:', matchedRule.methodAccount);
          }
          if (matchedRule.account && matchedRule.account !== 'Expenses:FIXME') {
            updatedOrder.extraAccounts[Account.PlusAccount] = matchedRule.account;
            console.log('Set PlusAccount:', matchedRule.account);
          }
        } else if (order.type === 'Recv') {
          if (matchedRule.account && matchedRule.account !== 'Expenses:FIXME') {
            updatedOrder.extraAccounts[Account.MinusAccount] = matchedRule.account;
          }
          if (matchedRule.methodAccount && matchedRule.methodAccount !== 'Assets:FIXME') {
            updatedOrder.extraAccounts[Account.PlusAccount] = matchedRule.methodAccount;
          }
        }
      }

      console.log('Final account mapping:', updatedOrder.extraAccounts);
      return updatedOrder;
    }

    return order;
  }

  // 找到所有匹配的规则，并按优先级和精确度排序
  private findAllMatchingRulesSorted(order: Order): ConfigRule[] {
    const matchedRules: ConfigRule[] = [];

    for (const rule of this.rules) {
      if (this.matchesRule(order, rule)) {
        matchedRules.push(rule);
      }
    }

    // 按字段数量多的优先，再按priority高的优先排序
    const fieldList = ['peer', 'item', 'type', 'method', 'category', 'txType'] as const;
    return matchedRules.sort((a, b) => {
      const aFields = fieldList.filter(f => !!(a as any)[f]).length;
      const bFields = fieldList.filter(f => !!(b as any)[f]).length;
      if (bFields !== aFields) return bFields - aFields;
      // priority越大越优先
      return (b.priority ?? 0) - (a.priority ?? 0);
    });
  }

  private findAllMatchingRules(order: Order): ConfigRule[] {
    const matchedRules: ConfigRule[] = [];

    for (const rule of this.rules) {
      if (this.matchesRule(order, rule)) {
        matchedRules.push(rule);
      }
    }

    return matchedRules;
  }

  private findMatchingRule(order: Order): ConfigRule | null {
    const matchedRules = this.findAllMatchingRules(order);
    return matchedRules.length > 0 ? matchedRules[0] : null;
  }

  private matchesRule(order: Order, rule: ConfigRule): boolean {
    // 首先尝试精确字段匹配
    if (this.hasFieldMatching(rule)) {
      return this.matchesRuleFields(order, rule);
    }

    // 如果没有字段匹配，才使用模式匹配
    const matchText = `${order.note || ''} ${order.peer || ''} ${order.item || ''} ${order.typeOriginal || ''} ${order.method || ''} ${order.category || ''}`.toLowerCase();

    // 如果规则有多个模式（用|分隔），分别检查每个模式
    const patterns = rule.pattern.split('|').map(p => p.trim()).filter(p => p.length > 0);

    for (const pattern of patterns) {
      if (this.matchesPattern(matchText, pattern)) {
        return true;
      }
    }

    return false;
  }

  private hasFieldMatching(rule: ConfigRule): boolean {
    const hasFields = !!(rule.peer || rule.item || rule.type || rule.method || rule.category || rule.txType);
    console.log('Rule field matching check:', {
      pattern: rule.pattern,
      peer: rule.peer,
      item: rule.item,
      type: rule.type,
      method: rule.method,
      category: rule.category,
      txType: rule.txType,
      hasFields: hasFields
    });
    return hasFields;
  }

  // 新增：更精确的字段匹配方法
  private matchesRuleFields(order: Order, rule: ConfigRule): boolean {
    // 检查各个字段的匹配 - 所有非空字段都必须匹配
    if (rule.peer && !this.matchesFieldValue(this.getOrderValue(order, 'peer'), rule.peer, rule.sep, rule.fullMatch)) {
      return false;
    }
    if (rule.item && !this.matchesFieldValue(this.getOrderValue(order, 'item'), rule.item, rule.sep, rule.fullMatch)) {
      return false;
    }
    if (rule.type && !this.matchesFieldValue(this.getOrderValue(order, 'type'), rule.type, rule.sep, rule.fullMatch)) {
      return false;
    }
    if (rule.method && !this.matchesFieldValue(this.getOrderValue(order, 'method'), rule.method, rule.sep, rule.fullMatch)) {
      return false;
    }
    if (rule.category && !this.matchesFieldValue(this.getOrderValue(order, 'category'), rule.category, rule.sep, rule.fullMatch)) {
      return false;
    }
    if (rule.txType && !this.matchesFieldValue(this.getOrderValue(order, 'txType'), rule.txType, rule.sep, rule.fullMatch)) {
      return false;
    }

    return true;
  }

  private getOrderValue(order: Order, field: string): string {
    switch (field) {
      case 'peer': return order.peer || '';
      case 'item': return order.item || '';
      case 'type': return order.typeOriginal || '';
      case 'method': return order.method || '';
      case 'category': return order.category || '';
      case 'txType': return order.txTypeOriginal || '';
      default: return '';
    }
  }

  private matchesFieldValue(orderValue: string, ruleValue: string, sep?: string, fullMatch?: boolean): boolean {
    if (!ruleValue) return true;

    const orderValueLower = orderValue.toLowerCase();
    const ruleValueLower = ruleValue.toLowerCase();

    if (sep && ruleValueLower.includes(sep)) {
      // 使用分隔符分割规则值
      const ruleValues = ruleValueLower.split(sep).map(v => v.trim()).filter(v => v.length > 0);
      return ruleValues.some(v =>
        fullMatch ? orderValueLower === v : orderValueLower.includes(v)
      );
    } else {
      // 单个值匹配
      return fullMatch ?
        orderValueLower === ruleValueLower :
        orderValueLower.includes(ruleValueLower);
    }
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