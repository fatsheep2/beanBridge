import { ref, computed } from 'vue';
import type { Rule } from '../types/data-source';

export function useRuleManager() {
  const STORAGE_KEY = 'beancount_rules';
  
  // 响应式状态
  const rules = ref<Rule[]>([]);
  
  // 加载规则
  const loadRules = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        rules.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('加载规则失败:', error);
      rules.value = [];
    }
  };
  
  // 保存规则
  const saveRules = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules.value));
    } catch (error) {
      console.error('保存规则失败:', error);
    }
  };
  
  // 添加规则
  const addRule = (rule: Rule) => {
    rules.value.push(rule);
    saveRules();
  };
  
  // 更新规则
  const updateRule = (index: number, rule: Rule) => {
    rules.value[index] = rule;
    saveRules();
  };
  
  // 删除规则
  const deleteRule = (index: number) => {
    rules.value.splice(index, 1);
    saveRules();
  };
  
  // 清空规则
  const clearRules = () => {
    rules.value = [];
    saveRules();
  };
  
  // 导出规则到剪贴板
  const exportToClipboard = () => {
    try {
      const config = {
        rules: rules.value,
        exportTime: new Date().toISOString()
      };
      const jsonString = JSON.stringify(config, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert('规则已复制到剪贴板！');
      }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('规则已复制到剪贴板！');
      });
    } catch (error) {
      alert('导出失败：' + error);
    }
  };
  
  // 从剪贴板导入规则
  const importFromClipboard = () => {
    navigator.clipboard.readText().then(text => {
      try {
        const config = JSON.parse(text);
        if (config.rules && Array.isArray(config.rules)) {
          rules.value = config.rules;
          saveRules();
          alert('规则导入成功！');
        } else {
          alert('剪贴板内容格式不正确');
        }
      } catch (error) {
        alert('导入失败：' + error);
      }
    }).catch(() => {
      alert('无法读取剪贴板内容');
    });
  };
  
  // 计算属性
  const rulesCount = computed(() => rules.value.length);
  
  // 初始化时加载规则
  loadRules();
  
  return {
    // 状态
    rules,
    rulesCount,
    
    // 方法
    loadRules,
    saveRules,
    addRule,
    updateRule,
    deleteRule,
    clearRules,
    exportToClipboard,
    importFromClipboard
  };
} 