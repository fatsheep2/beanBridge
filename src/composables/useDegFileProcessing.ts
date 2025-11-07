/**
 * DEG 文件处理 Composable - 使用 WASM 后端处理文件
 */

import { ref, computed } from 'vue'
import { useDegWasm } from './useDegWasm'
import { yamlConfigService } from '@/services/yaml-config-service'
import { yaml } from '@/utils/yaml'
import type { WASMProcessResult } from '@/types/wasm'

export function useDegFileProcessing() {
  const deg = useDegWasm()
  const selectedFile = ref<File | null>(null)
  const isProcessing = ref(false)
  const processingResult = ref<WASMProcessResult | null>(null)
  const error = ref<string | null>(null)
  const outputFormat = ref<'beancount' | 'ledger'>('beancount')

  /**
   * 处理文件
   */
  const processFile = async (
    file: File,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<void> => {
    if (!deg.currentProvider.value) {
      error.value = '请先选择解析器'
      return
    }

    isProcessing.value = true
    error.value = null
    processingResult.value = null

    try {
      // 确保已初始化
      if (!deg.isInitialized.value) {
        await deg.init()
      }

      // 设置 Provider
      await deg.setProvider(deg.currentProvider.value)

      // 加载配置
      let yamlConfig = yamlConfigService.getConfig(deg.currentProvider.value)
      if (!yamlConfig) {
        // 如果没有保存的配置，使用默认配置
        yamlConfig = yamlConfigService.getDefaultConfig(deg.currentProvider.value)
      }
      
      if (yamlConfig) {
        try {
          await deg.updateConfig(yaml.parse(yamlConfig))
        } catch (err) {
          console.warn('加载配置失败，将使用默认配置:', err)
          // 如果加载失败，使用默认配置
          const defaultConfig = yamlConfigService.getDefaultConfig(deg.currentProvider.value)
          await deg.updateConfig(yaml.parse(defaultConfig))
        }
      }

      // 处理文件
      const result = await deg.processFile(file, format)

      if (result.success) {
        processingResult.value = result
        error.value = null
      } else {
        error.value = result.error || '处理文件失败'
        processingResult.value = null
      }
    } catch (err) {
      console.error('文件处理失败:', err)
      error.value = err instanceof Error ? err.message : '处理文件失败'
      processingResult.value = null
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 预览文件（不应用规则）
   */
  const previewFile = async (file: File): Promise<void> => {
    // WASM 后端总是应用配置，所以预览和处理是一样的
    await processFile(file, outputFormat.value)
  }

  /**
   * 重置状态
   */
  const reset = () => {
    selectedFile.value = null
    processingResult.value = null
    error.value = null
    isProcessing.value = false
  }

  /**
   * 下载结果
   */
  const downloadResult = (filename?: string) => {
    if (!processingResult.value?.output) {
      error.value = '没有可下载的数据'
      return
    }

    const blob = new Blob([processingResult.value.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `beancount_${new Date().toISOString().split('T')[0]}.beancount`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 复制结果到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  }

  return {
    // 状态
    selectedFile,
    isProcessing,
    processingResult,
    error,
    outputFormat,

    // 方法
    processFile,
    previewFile,
    reset,
    downloadResult,
    copyToClipboard
  }
}

