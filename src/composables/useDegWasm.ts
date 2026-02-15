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

    // 获取当前选择的 provider（这是用户选择的，必须使用这个）
    const selectedProvider = wasm.currentProvider.value
    if (!selectedProvider) {
      throw new Error('请先选择解析器')
    }

    // 先设置 provider（确保 WASM 中的 provider 正确）
    await wasm.setProvider(selectedProvider)
    // 等待一下确保设置完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 如果有配置，解析配置（传递用户选择的 provider）
    if (configYaml.value) {
      await wasm.parseYamlConfig(configYaml.value, selectedProvider)
      // 解析配置后，再次确保 provider 正确（因为 parseYamlConfig 会重新创建 fileReader）
      await wasm.setProvider(selectedProvider)
      // 等待一下确保设置完成
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 处理文件前，最后一次确保 provider 正确
    await wasm.setProvider(selectedProvider)
    await new Promise(resolve => setTimeout(resolve, 50))

    // 处理文件
    return await wasm.processFile(file, format)
  }

  /**
   * 更新配置
   */
  const updateConfig = async (config: any, provider?: string) => {
    // 使用传入的 provider 或当前的 provider
    const providerToUse = provider || wasm.currentProvider.value
    if (!providerToUse) {
      throw new Error('请先选择解析器')
    }

    console.log(`[useDegWasm] updateConfig: 设置 provider 为 ${providerToUse}`)
    
    // 先设置 provider，确保全局 currentProvider 正确
    await wasm.setProvider(providerToUse)
    // 【关键修复】等待确保 Go 端的 currentProvider 已更新
    await new Promise(resolve => setTimeout(resolve, 150))

    // 将配置对象转换为 YAML
    const yamlStr = yaml.stringify(config)
    configYaml.value = yamlStr

    console.log(`[useDegWasm] updateConfig: 调用 parseYamlConfig，provider: ${providerToUse}`)
    
    // 解析配置到 WASM（传递 provider 确保使用正确的 provider）
    const result = await wasm.parseYamlConfig(yamlStr, providerToUse)
    if (!result.success) {
      throw new Error(result.error || '配置更新失败')
    }

    console.log(`[useDegWasm] updateConfig: parseYamlConfig 完成，再次确保 provider 正确`)
    
    // 解析配置后，再次确保 provider 正确（因为 parseYamlConfig 会重新创建 fileReader）
    await wasm.setProvider(providerToUse)
    // 等待确保设置完成
    await new Promise(resolve => setTimeout(resolve, 150))

    console.log(`[useDegWasm] updateConfig: 完成，provider = ${providerToUse}`)
    
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

