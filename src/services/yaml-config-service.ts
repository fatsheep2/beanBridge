/**
 * YAML 配置服务 - 使用 DEG 项目的 YAML 格式
 */

import { yaml } from '@/utils/yaml'
import { useDegWasm } from '@/composables/useDegWasm'

export interface DegConfig {
  defaultMinusAccount: string
  defaultPlusAccount: string
  defaultCurrency: string
  title?: string
  defaultCashAccount?: string
  defaultCommissionAccount?: string
  defaultPositionAccount?: string
  defaultPnlAccount?: string
  [provider: string]: any
}

class YamlConfigService {
  private readonly STORAGE_KEY = 'beancount_yaml_configs'
  private readonly HISTORY_KEY = 'beancount_yaml_config_history'

  /**
   * 获取指定 Provider 的 YAML 配置
   */
  getConfig(provider: string): string | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const configs = JSON.parse(stored)
      return configs[provider] || null
    } catch (error) {
      console.error('Failed to load YAML config:', error)
      return null
    }
  }

  /**
   * 保存 YAML 配置
   */
  saveConfig(provider: string, yamlContent: string): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const configs = stored ? JSON.parse(stored) : {}

      configs[provider] = yamlContent
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs))

      // 保存到历史记录
      this.saveToHistory(provider, yamlContent)
    } catch (error) {
      console.error('Failed to save YAML config:', error)
    }
  }

  /**
   * 获取默认配置模板
   */
  getDefaultConfig(provider: string): string {
    const defaultConfig: DegConfig = {
      defaultMinusAccount: 'Assets:FIXME',
      defaultPlusAccount: 'Expenses:FIXME',
      defaultCommissionAccount: 'Expenses:Commission:FIXME',
      defaultCurrency: 'CNY',
      title: 'BeanBridge 财务记录'
    }

    defaultConfig[provider] = {
      rules: []
    }

    return yaml.stringify(defaultConfig, {
      indent: 2,
      lineWidth: 0,
      minContentWidth: 0
    })
  }

  /**
   * 从 DEG 示例文件加载配置
   */
  async loadFromExample(provider: string): Promise<string | null> {
    try {
      // 获取正确的基础路径（支持子目录部署）
      const basePath = import.meta.env.BASE_URL || '/'
      
      // 尝试从本地 example 目录加载
      const response = await fetch(`${basePath}example/${provider}/config.yaml`)
      if (response.ok) {
        return await response.text()
      }

      // 如果本地没有，尝试从 GitHub 加载
      const githubUrl = `https://raw.githubusercontent.com/deb-sig/double-entry-generator/master/example/${provider}/config.yaml`
      const githubResponse = await fetch(githubUrl)
      if (githubResponse.ok) {
        return await githubResponse.text()
      }

      return null
    } catch (error) {
      console.error('Failed to load example config:', error)
      return null
    }
  }

  /**
   * 验证 YAML 配置
   */
  validateConfig(yamlContent: string): { valid: boolean; error?: string; config?: DegConfig } {
    try {
      const config = yaml.parse(yamlContent) as DegConfig

      if (!config || typeof config !== 'object') {
        return { valid: false, error: '配置必须是对象格式' }
      }

      if (!config.defaultMinusAccount) {
        return { valid: false, error: '缺少必需字段: defaultMinusAccount' }
      }

      if (!config.defaultPlusAccount) {
        return { valid: false, error: '缺少必需字段: defaultPlusAccount' }
      }

      if (!config.defaultCurrency) {
        return { valid: false, error: '缺少必需字段: defaultCurrency' }
      }

      return { valid: true, config }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'YAML 解析失败'
      }
    }
  }

  /**
   * 导出配置
   */
  exportConfig(provider: string): string | null {
    return this.getConfig(provider)
  }

  /**
   * 导入配置
   */
  importConfig(provider: string, yamlContent: string): boolean {
    const validation = this.validateConfig(yamlContent)
    if (!validation.valid) {
      return false
    }

    this.saveConfig(provider, yamlContent)
    return true
  }

  /**
   * 获取历史记录
   */
  getHistory(provider?: string): Array<{ id: string; provider: string; content: string; createdAt: string }> {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY)
      const history = stored ? JSON.parse(stored) : []

      if (provider) {
        return history.filter((h: any) => h.provider === provider)
      }

      return history
    } catch (error) {
      console.error('Failed to load history:', error)
      return []
    }
  }

  /**
   * 保存到历史记录
   */
  private saveToHistory(provider: string, yamlContent: string): void {
    try {
      const history = this.getHistory()
      const historyItem = {
        id: this.generateId(),
        provider,
        content: yamlContent,
        createdAt: new Date().toISOString()
      }

      // 添加新记录到开头
      history.unshift(historyItem)

      // 按 provider 分组，每个 provider 最多保留 5 条记录
      const providerGroups = new Map<string, typeof history>()
      for (const item of history) {
        if (!providerGroups.has(item.provider)) {
          providerGroups.set(item.provider, [])
        }
        providerGroups.get(item.provider)!.push(item)
      }

      // 限制每个 provider 最多 5 条记录
      const limitedHistory: typeof history = []
      for (const [, items] of providerGroups) {
        limitedHistory.push(...items.slice(0, 5))
      }

      // 按创建时间排序（最新的在前）
      limitedHistory.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error('Failed to save to history:', error)
    }
  }

  /**
   * 应用历史配置
   */
  applyHistory(historyId: string): string | null {
    try {
      const history = this.getHistory()
      const historyItem = history.find((h) => h.id === historyId)

      if (!historyItem) {
        return null
      }

      this.saveConfig(historyItem.provider, historyItem.content)
      return historyItem.content
    } catch (error) {
      console.error('Failed to apply history:', error)
      return null
    }
  }

  /**
   * 删除历史记录
   */
  deleteHistory(historyId: string): boolean {
    try {
      const history = this.getHistory()
      const filteredHistory = history.filter((h) => h.id !== historyId)

      if (filteredHistory.length === history.length) {
        return false
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory))
      return true
    } catch (error) {
      console.error('Failed to delete history:', error)
      return false
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const yamlConfigService = new YamlConfigService()

