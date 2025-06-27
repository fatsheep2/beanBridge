import type { ConfigRule } from './types/provider';
import type { IR, Order } from './types/provider';
import { Account } from './types/provider';

export class RuleEngine {
  private rules: ConfigRule[] = [];
  private defaultMinusAccount: string = 'Assets:FIXME';
  private defaultPlusAccount: string = 'Expenses:FIXME';

  constructor(rules: ConfigRule[] = [], defaultMinusAccount?: string, defaultPlusAccount?: string) {
    this.rules = rules;
    if (defaultMinusAccount) this.defaultMinusAccount = defaultMinusAccount;
    if (defaultPlusAccount) this.defaultPlusAccount = defaultPlusAccount;
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
    // 调试：只输出特定记录的规则处理信息
    const isDebugRecord = order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐');
    if (isDebugRecord) {
      console.log(`[规则引擎] 开始处理订单: ${order.peer} | 原始peer: ${order.metadata?.originalPeer || order.peer}`);
    }

    const matchedRules = this.findAllMatchingRulesSorted(order);

    // 新增：检查是否有多个规则匹配但没有时间区分
    if (matchedRules.length > 1) {
      const rulesWithoutTime = matchedRules.filter(rule => !rule.time);
      const rulesWithTime = matchedRules.filter(rule => rule.time);

      if (rulesWithoutTime.length > 1 && rulesWithTime.length === 0) {
        console.warn(`[规则引擎警告] 订单 "${order.peer}" 匹配了 ${matchedRules.length} 个规则，但没有时间区分：`, {
          order: `${order.peer} ${order.item} ${order.typeOriginal} ${order.method}`,
          matchedRules: matchedRules.map(r => ({
            pattern: r.pattern,
            account: r.account,
            time: r.time
          })),
          suggestion: '建议为这些规则添加时间字段以区分不同时段的交易'
        });
      }
    }

    let updatedOrder = {
      ...order,
      tags: [...order.tags],
      peer: order.peer,
      category: order.category
    };

    if (matchedRules.length > 0) {
      // 调试：只输出特定记录的订单匹配信息
      if (isDebugRecord) {
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
      }

      // 按优先级和精确度排序的规则，依次应用
      for (const matchedRule of matchedRules) {
        // 调试：只输出特定记录的规则应用信息
        if (isDebugRecord) {
          console.log('Applying rule:', {
            pattern: matchedRule.pattern,
            account: matchedRule.account,
            methodAccount: matchedRule.methodAccount
          });
        }

        // 合并标签
        if (matchedRule.tags) {
          updatedOrder.tags.push(...matchedRule.tags);
        }

        // 设置账户映射
        if (order.type === 'Send') {
          // 设置 MinusAccount（资金账户）
          if (matchedRule.methodAccount && matchedRule.methodAccount !== 'Assets:FIXME') {
            updatedOrder.extraAccounts[Account.MinusAccount] = matchedRule.methodAccount;
            updatedOrder.minusAccount = matchedRule.methodAccount;
            if (isDebugRecord) console.log('Set MinusAccount from rule:', matchedRule.methodAccount);
          } else if (!updatedOrder.extraAccounts[Account.MinusAccount]) {
            updatedOrder.extraAccounts[Account.MinusAccount] = this.defaultMinusAccount;
            updatedOrder.minusAccount = this.defaultMinusAccount;
            if (isDebugRecord) console.log('Set MinusAccount from default:', this.defaultMinusAccount);
          }

          // 设置 PlusAccount（目标账户）- 支持 targetAccount 和 account 字段
          const targetAccount = (matchedRule as any).targetAccount || matchedRule.account;
          if (targetAccount && targetAccount !== 'Expenses:FIXME') {
            updatedOrder.extraAccounts[Account.PlusAccount] = targetAccount;
            updatedOrder.plusAccount = targetAccount;
            if (isDebugRecord) console.log('Set PlusAccount from rule:', targetAccount);

            // 调试：只输出特定记录的账户设置信息
            if (order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐')) {
              console.log(`[规则引擎调试] 订单: ${order.peer} | 设置账户: ${targetAccount} | 规则: ${matchedRule.pattern}`);
            }
          } else if (!updatedOrder.extraAccounts[Account.PlusAccount]) {
            updatedOrder.extraAccounts[Account.PlusAccount] = this.defaultPlusAccount;
            updatedOrder.plusAccount = this.defaultPlusAccount;
            if (isDebugRecord) console.log('Set PlusAccount from default:', this.defaultPlusAccount);
          }
        } else if (order.type === 'Recv') {
          // 设置 MinusAccount（来源账户）- 支持 targetAccount 和 account 字段
          const targetAccount = (matchedRule as any).targetAccount || matchedRule.account;
          if (targetAccount && targetAccount !== 'Expenses:FIXME') {
            updatedOrder.extraAccounts[Account.MinusAccount] = targetAccount;
            updatedOrder.minusAccount = targetAccount;
          } else if (!updatedOrder.extraAccounts[Account.MinusAccount]) {
            updatedOrder.extraAccounts[Account.MinusAccount] = 'Income:Other';
            updatedOrder.minusAccount = 'Income:Other';
          }

          // 设置 PlusAccount（资金账户）
          if (matchedRule.methodAccount && matchedRule.methodAccount !== 'Assets:FIXME') {
            updatedOrder.extraAccounts[Account.PlusAccount] = matchedRule.methodAccount;
            updatedOrder.plusAccount = matchedRule.methodAccount;
          } else if (!updatedOrder.extraAccounts[Account.PlusAccount]) {
            updatedOrder.extraAccounts[Account.PlusAccount] = this.defaultMinusAccount;
            updatedOrder.plusAccount = this.defaultMinusAccount;
          }
        }
      }

      if (isDebugRecord) {
        console.log('Final account mapping:', updatedOrder.extraAccounts);
      }
    } else {
      // 如果没有匹配的规则，设置默认账户
      if (order.type === 'Send') {
        updatedOrder.extraAccounts[Account.MinusAccount] = this.defaultMinusAccount;
        updatedOrder.extraAccounts[Account.PlusAccount] = this.defaultPlusAccount;
        updatedOrder.minusAccount = this.defaultMinusAccount;
        updatedOrder.plusAccount = this.defaultPlusAccount;
        if (isDebugRecord) {
          console.log('Set default accounts for unmatched Send order:', {
            minusAccount: this.defaultMinusAccount,
            plusAccount: this.defaultPlusAccount
          });
        }
      } else if (order.type === 'Recv') {
        updatedOrder.extraAccounts[Account.MinusAccount] = 'Income:Other';
        updatedOrder.extraAccounts[Account.PlusAccount] = this.defaultMinusAccount;
        updatedOrder.minusAccount = 'Income:Other';
        updatedOrder.plusAccount = this.defaultMinusAccount;
        if (isDebugRecord) {
          console.log('Set default accounts for unmatched Recv order:', {
            minusAccount: 'Income:Other',
            plusAccount: this.defaultMinusAccount
          });
        }
      }
    }

    return updatedOrder;
  }

  // 找到所有匹配的规则，并按优先级和精确度排序
  public findAllMatchingRulesSorted(order: Order): ConfigRule[] {
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
    return hasFields;
  }

  // 新增：更精确的字段匹配方法
  private matchesRuleFields(order: Order, rule: ConfigRule): boolean {
    // 调试：只输出特定记录的规则匹配信息
    const isDebugRecord = order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐');
    let debugInfo = [];

    // 检查各个字段的匹配 - 所有非空字段都必须匹配
    if (rule.peer) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'peer'), rule.peer, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:peer] 规则值:${rule.peer} 订单值:${this.getOrderValue(order, 'peer')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (rule.item) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'item'), rule.item, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:item] 规则值:${rule.item} 订单值:${this.getOrderValue(order, 'item')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (rule.type) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'type'), rule.type, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:type] 规则值:${rule.type} 订单值:${this.getOrderValue(order, 'type')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (rule.method) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'method'), rule.method, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:method] 规则值:${rule.method} 订单值:${this.getOrderValue(order, 'method')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (rule.category) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'category'), rule.category, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:category] 规则值:${rule.category} 订单值:${this.getOrderValue(order, 'category')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (rule.txType) {
      const matches = this.matchesFieldValue(this.getOrderValue(order, 'txType'), rule.txType, rule.sep, rule.fullMatch);
      if (isDebugRecord) debugInfo.push(`[字段:txType] 规则值:${rule.txType} 订单值:${this.getOrderValue(order, 'txType')} 匹配:${matches}`);
      if (!matches) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    // 新增：判断时间段匹配
    if (rule.time && rule.time.includes('-') && order.payTime) {
      // 兼容字符串和Date对象
      let payDate: Date;
      if (typeof order.payTime === 'string') {
        // 兼容 '2025-01-08 13:40:00' 和 '2025-01-08T13:40:00'
        payDate = new Date((order.payTime as string).replace(' ', 'T'));
      } else {
        payDate = order.payTime as Date;
      }
      const payMinutes = payDate.getHours() * 60 + payDate.getMinutes();
      const [start, end] = rule.time.split('-').map(s => s.trim());
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMinutes = startH * 60 + (startM || 0);
      const endMinutes = endH * 60 + (endM || 0);
      const timeMatch = (payMinutes >= startMinutes && payMinutes < endMinutes);

      if (isDebugRecord) {
        const payTimeStr = `${payDate.getHours().toString().padStart(2, '0')}:${payDate.getMinutes().toString().padStart(2, '0')}`;
        debugInfo.push(`[时间] 规则区间:${rule.time} 订单时间:${payTimeStr} 匹配:${timeMatch} (订单分钟:${payMinutes}, 区间:${startMinutes}-${endMinutes})`);
      }

      if (!timeMatch) {
        if (isDebugRecord) {
          console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:false\n${debugInfo.join('\n')}`);
        }
        return false;
      }
    }

    if (isDebugRecord) {
      console.log(`[规则调试] 规则:${rule.pattern} 匹配结果:true\n${debugInfo.join('\n')}`);
    }
    return true;
  }

  private getOrderValue(order: Order, field: string): string {
    switch (field) {
      case 'peer': return order.metadata?.originalPeer || order.peer || '';
      case 'item': return order.metadata?.originalItem || order.item || '';
      case 'type': return order.typeOriginal || '';
      case 'method': return order.method || '';
      case 'category': return order.metadata?.originalCategory || order.category || '';
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
    console.log(`[规则引擎] 开始批量处理 ${ir.orders.length} 条订单，规则数量: ${this.rules.length}`);

    // 测试：检查是否有包含"金膳"的订单
    const debugOrders = ir.orders.filter(order =>
      order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐')
    );
    if (debugOrders.length > 0) {
      console.log(`[规则引擎] 发现 ${debugOrders.length} 条调试订单:`, debugOrders.map(o => o.peer));
    }

    // 调试：只输出特定记录的规则列表信息
    const hasDebugRecords = ir.orders.some(order =>
      order.peer.includes('金膳') || order.peer.includes('午餐') || order.peer.includes('晚餐')
    );

    if (hasDebugRecords) {
      this.rules.forEach((rule, index) => {
        console.log(`[规则引擎] 规则${index + 1}: ${rule.pattern} | peer: ${rule.peer} | time: ${rule.time} | targetAccount: ${(rule as any).targetAccount} | account: ${rule.account}`);
      });
    }

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