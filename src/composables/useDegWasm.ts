/**
 * DEG WASM Composable - 使用 double-entry-generator WASM 后端
 * 这是新的实现，完全基于 WASM 后端
 */

import { ref, computed } from 'vue'
import { useWasm } from './useWasm'
import { yamlConfigService } from '@/services/yaml-config-service'
import type { WASMProcessResult } from '@/types/wasm'
import { yaml } from '@/utils/yaml'

export function useDegWasm() {
  const wasm = useWasm()
  const configYaml = ref<string>('')
  const outputFormat = ref<'beancount' | 'ledger'>('beancount')

  // 初始化时加载配置
  const initConfig = async (provider: string) => {
    const saved = yamlConfigService.getConfig(provider)
    if (saved) {
      configYaml.value = saved
      await wasm.parseYamlConfig(saved)
    }
  }

  /**
   * 初始化 WASM 并加载配置
   */
  const init = async (yamlConfig?: string) => {
    await wasm.init()

    if (yamlConfig) {
      configYaml.value = yamlConfig
      const result = await wasm.parseYamlConfig(yamlConfig)
      if (!result.success) {
        throw new Error(result.error || '配置解析失败')
      }
    }
  }

  /**
   * 设置 Provider
   */
  const setProvider = async (provider: string) => {
    const result = await wasm.setProvider(provider)
    if (!result.success) {
      throw new Error(result.error || '设置 Provider 失败')
    }
  }

  /**
   * 处理文件
   */
  const processFile = async (
    file: File,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> => {
    // 确保已初始化
    if (!wasm.isInitialized.value) {
      await init()
    }

    // 如果有配置，先解析配置
    if (configYaml.value) {
      await wasm.parseYamlConfig(configYaml.value)
    }

    // 处理文件
    return await wasm.processFile(file, format)
  }

  /**
   * 更新配置
   */
  const updateConfig = async (config: any) => {
    // 将配置对象转换为 YAML
    const yamlStr = yaml.stringify(config)
    configYaml.value = yamlStr

    // 解析配置到 WASM
    const result = await wasm.parseYamlConfig(yamlStr)
    if (!result.success) {
      throw new Error(result.error || '配置更新失败')
    }

    return result
  }

  /**
   * 获取默认配置
   */
  const getDefaultConfig = () => {
    return {
      defaultMinusAccount: 'Assets:FIXME',
      defaultPlusAccount: 'Expenses:FIXME',
      defaultCommissionAccount: 'Expenses:Commission:FIXME',
      defaultCurrency: 'CNY',
      title: 'BeanBridge 财务记录'
    }
  }

  return {
    // WASM 状态
    isInitialized: wasm.isInitialized,
    isLoading: wasm.isLoading,
    error: wasm.error,
    currentProvider: wasm.currentProvider,
    supportedProviders: wasm.supportedProviders,
    providersWithNames: wasm.providersWithNames,

    // 配置
    configYaml,
    outputFormat,

    // 方法
    init,
    setProvider,
    processFile,
    updateConfig,
    getDefaultConfig,
    getProviderDisplayName: wasm.getProviderDisplayName
  }
}

