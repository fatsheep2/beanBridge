/**
 * WASM Composable - 提供 WASM 功能的 Vue 组合式函数
 */

import { ref, computed } from 'vue'
import { wasmService } from '@/services/wasm-service'
import type { WASMProcessResult, WASMConfig } from '@/types/wasm'

export function useWasm() {
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentProvider = ref<string>('alipay')
  const supportedProviders = ref<string[]>([])

  /**
   * 初始化 WASM
   */
  const init = async () => {
    if (isInitialized.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      await wasmService.init()
      isInitialized.value = true

      // 加载支持的 providers
      const providersResult = await wasmService.getSupportedProviders()
      if (providersResult.success && providersResult.providers) {
        supportedProviders.value = providersResult.providers
        // 如果没有 providers，使用默认列表
        if (supportedProviders.value.length === 0) {
          supportedProviders.value = ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk']
        }
        // 设置默认 provider
        if (supportedProviders.value.length > 0 && !currentProvider.value) {
          currentProvider.value = supportedProviders.value[0]
          await wasmService.setProvider(supportedProviders.value[0])
        }
      } else {
        // 如果获取失败，使用默认列表
        supportedProviders.value = ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk']
        if (!currentProvider.value) {
          currentProvider.value = 'alipay'
          await wasmService.setProvider('alipay')
        }
      }

      // 获取当前 provider
      const currentResult = await wasmService.getCurrentProvider()
      if (currentResult.success && currentResult.provider) {
        currentProvider.value = currentResult.provider
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('[useWasm] 初始化失败:', err)
      // 即使初始化失败，也设置默认 providers
      if (supportedProviders.value.length === 0) {
        supportedProviders.value = ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk']
        currentProvider.value = 'alipay'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理文件
   */
  const processFile = async (
    file: File,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> => {
    if (!isInitialized.value) {
      await init()
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await wasmService.processFile(file, format)
      if (!result.success) {
        error.value = result.error || '处理文件失败'
      }
      return result
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      error.value = errMsg
      return {
        success: false,
        error: errMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理文件内容（通过字节数组）
   */
  const processFileContent = async (
    fileName: string,
    fileData: Uint8Array | ArrayBuffer,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> => {
    if (!isInitialized.value) {
      await init()
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await wasmService.processFileContent(
        fileName,
        fileData,
        format
      )
      if (!result.success) {
        error.value = result.error || '处理文件失败'
      }
      return result
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      error.value = errMsg
      return {
        success: false,
        error: errMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置 Provider
   */
  const setProvider = async (provider: string) => {
    if (!isInitialized.value) {
      await init()
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await wasmService.setProvider(provider)
      if (result.success) {
        currentProvider.value = provider
      } else {
        error.value = result.error || '设置 Provider 失败'
      }
      return result
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      error.value = errMsg
      return {
        success: false,
        error: errMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 解析 YAML 配置
   */
  const parseYamlConfig = async (yamlStr: string) => {
    if (!isInitialized.value) {
      await init()
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await wasmService.parseYamlConfig(yamlStr)
      if (!result.success) {
        error.value = result.error || '解析配置失败'
      }
      return result
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      error.value = errMsg
      return {
        success: false,
        error: errMsg
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Provider 显示名称映射
   */
  const providerDisplayNames: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信',
    icbc: '工商银行',
    ccb: '建设银行',
    citic: '中信银行',
    hsbchk: '汇丰银行香港',
    htsec: '海通证券',
    huobi: '火币',
    td: '道明银行',
    bmo: '蒙特利尔银行',
    mt: '美团',
    jd: '京东',
    hxsec: '华西证券'
  }

  /**
   * 获取 Provider 显示名称
   */
  const getProviderDisplayName = (provider: string): string => {
    return providerDisplayNames[provider] || provider
  }

  /**
   * 计算属性：支持的 providers 列表（带显示名称）
   */
  const providersWithNames = computed(() => {
    return supportedProviders.value.map((p) => ({
      value: p,
      label: getProviderDisplayName(p)
    }))
  })

  return {
    // 状态
    isInitialized,
    isLoading,
    error,
    currentProvider,
    supportedProviders,
    providersWithNames,

    // 方法
    init,
    processFile,
    processFileContent,
    setProvider,
    parseYamlConfig,
    getProviderDisplayName
  }
}

