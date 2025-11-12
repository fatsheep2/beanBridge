/**
 * WASM 服务 - 封装 double-entry-generator WASM 功能
 */

import type { WASMProcessResult, WASMConfig } from '@/types/wasm'

export class WASMService {
  private static instance: WASMService | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): WASMService {
    if (!WASMService.instance) {
      WASMService.instance = new WASMService()
    }
    return WASMService.instance
  }

  /**
   * 初始化 WASM 模块
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._doInit()
    return this.initPromise
  }

  private async _doInit(): Promise<void> {
    try {
      // 获取正确的基础路径（支持子目录部署）
      const basePath = import.meta.env.BASE_URL || '/'
      const wasmPath = `${basePath}wasm/`
      
      console.log('[WASM] 使用路径:', wasmPath)
      
      // 检查 WASM 文件是否存在
      const wasmExecCheck = await fetch(`${wasmPath}wasm_exec.js`, { method: 'HEAD' }).catch(() => null)
      if (!wasmExecCheck || !wasmExecCheck.ok) {
        throw new Error('WASM 文件未找到。请确保已运行 `npm run copy-wasm` 或 `pnpm run copy-wasm` 复制 WASM 文件到 public/wasm/ 目录')
      }

      // 加载 wasm_exec.js
      if (!window.Go) {
        await this.loadScript(`${wasmPath}wasm_exec.js`)
      }

      // 检查 WASM 二进制文件
      const wasmCheck = await fetch(`${wasmPath}double-entry-generator.wasm`, { method: 'HEAD' }).catch(() => null)
      if (!wasmCheck || !wasmCheck.ok) {
        throw new Error('WASM 二进制文件未找到。请确保已构建 double-entry-generator 的 WASM 版本')
      }

      // 加载 WASM 模块
      const go = new window.Go()
      const wasmResponse = await fetch(`${wasmPath}double-entry-generator.wasm`)
      if (!wasmResponse.ok) {
        throw new Error(`无法加载 WASM 文件: ${wasmResponse.statusText}`)
      }

      const wasmModule = await WebAssembly.instantiateStreaming(
        wasmResponse,
        go.importObject
      )

      // 运行 Go 程序
      go.run(wasmModule.instance)

      // 等待一下让 Go 程序初始化
      await new Promise(resolve => setTimeout(resolve, 100))

      this.isInitialized = true
      console.log('[WASM] 初始化成功')
    } catch (error) {
      console.error('[WASM] 初始化失败:', error)
      throw new Error(`WASM 初始化失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 动态加载脚本
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  /**
   * 处理文件输入元素
   */
  async processFileFromInput(
    fileInputId: string = 'fileInput',
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> {
    await this.init()

    if (!window.processFileFromInputWithFormat) {
      throw new Error('WASM 函数未加载')
    }

    try {
      const result = await window.processFileFromInputWithFormat(
        fileInputId,
        format
      )
      
      // 检查结果，即使 success 为 true，也要检查是否有错误信息
      if (result && typeof result === 'object') {
        const wasmResult = result as WASMProcessResult
        
        // 如果 WASM 返回了错误，即使 success 可能为 true，也要标记为失败
        if (wasmResult.error) {
          console.error('[WASM] 处理文件返回错误:', wasmResult.error)
          return {
            success: false,
            error: wasmResult.error,
            output: wasmResult.output
          }
        }
        
        return wasmResult
      }
      
      return result as WASMProcessResult
    } catch (error) {
      console.error('[WASM] 处理文件失败:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      
      // 检查是否是配置相关的错误
      if (errorMsg.includes('defaultCommissionAccount') || errorMsg.includes('commission')) {
        return {
          success: false,
          error: `配置错误: 检测到有手续费交易，但配置文件中缺少 defaultCommissionAccount。请在配置文件中添加 defaultCommissionAccount 字段。`
        }
      }
      
      return {
        success: false,
        error: `处理文件失败: ${errorMsg}`
      }
    }
  }

  /**
   * 处理文件内容（通过 File 对象）
   */
  async processFile(
    file: File,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> {
    await this.init()

    // 创建临时文件输入元素
    const tempInputId = `temp-file-input-${Date.now()}`
    const input = document.createElement('input')
    input.type = 'file'
    input.id = tempInputId
    input.style.display = 'none'
    document.body.appendChild(input)

    try {
      // 使用 DataTransfer 设置文件
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files

      // 处理文件
      const result = await this.processFileFromInput(tempInputId, format)

      // 清理
      document.body.removeChild(input)

      return result
    } catch (error) {
      // 确保清理
      if (document.getElementById(tempInputId)) {
        document.body.removeChild(input)
      }
      throw error
    }
  }

  /**
   * 处理文件内容（通过字节数组）
   */
  async processFileContent(
    fileName: string,
    fileData: Uint8Array | ArrayBuffer,
    format: 'beancount' | 'ledger' = 'beancount'
  ): Promise<WASMProcessResult> {
    await this.init()

    // 将文件数据转换为 File 对象
    const blob = new Blob([fileData])
    const file = new File([blob], fileName)

    return this.processFile(file, format)
  }

  /**
   * 解析 YAML 配置
   * @param yamlStr YAML 配置字符串
   * @param provider 可选的 provider，如果提供则使用此 provider
   */
  async parseYamlConfig(yamlStr: string, provider?: string): Promise<{
    success: boolean
    message?: string
    error?: string
    config?: WASMConfig
  }> {
    await this.init()

    if (!window.parseYamlConfig) {
      throw new Error('WASM 函数未加载')
    }

    try {
      // 如果提供了 provider，作为第二个参数传递
      const result = provider 
        ? await window.parseYamlConfig(yamlStr, provider)
        : await window.parseYamlConfig(yamlStr)
      return result
    } catch (error) {
      console.error('[WASM] 解析配置失败:', error)
      return {
        success: false,
        error: `解析配置失败: ${error}`
      }
    }
  }

  /**
   * 设置 Provider
   */
  async setProvider(provider: string): Promise<{
    success: boolean
    provider?: string
    error?: string
  }> {
    await this.init()

    if (!window.setProvider) {
      throw new Error('WASM 函数未加载')
    }

    try {
      const result = await window.setProvider(provider)
      return result
    } catch (error) {
      console.error('[WASM] 设置 Provider 失败:', error)
      return {
        success: false,
        error: `设置 Provider 失败: ${error}`
      }
    }
  }

  /**
   * 获取支持的 Providers
   */
  async getSupportedProviders(): Promise<{
    success: boolean
    providers?: string[]
    error?: string
  }> {
    await this.init()

    if (!window.getSupportedProviders) {
      return {
        success: false,
        error: 'WASM 函数未加载'
      }
    }

    try {
      const result = await window.getSupportedProviders()
      console.log('[WASM] getSupportedProviders 原始结果:', result)
      
      // 确保 providers 是数组格式
      if (result && result.success) {
        const providers = result.providers
        // 如果是 JS Array 对象，转换为普通数组
        const providersArray = Array.isArray(providers) 
          ? providers 
          : Array.from(providers || [])
        
        console.log('[WASM] 转换后的 providers:', providersArray)
        
        return {
          success: true,
          providers: providersArray
        }
      }
      
      return result
    } catch (error) {
      console.error('[WASM] 获取 Providers 失败:', error)
      return {
        success: false,
        error: `获取 Providers 失败: ${error}`
      }
    }
  }

  /**
   * 获取当前 Provider
   */
  async getCurrentProvider(): Promise<{
    success: boolean
    provider?: string
    error?: string
  }> {
    await this.init()

    if (!window.getCurrentProvider) {
      return {
        success: false,
        error: 'WASM 函数未加载'
      }
    }

    try {
      const result = await window.getCurrentProvider()
      return result
    } catch (error) {
      console.error('[WASM] 获取当前 Provider 失败:', error)
      return {
        success: false,
        error: `获取当前 Provider 失败: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * 测试函数
   */
  async testFunction(a: number = 1, b: number = 2): Promise<{
    success: boolean
    args?: number
    message?: string
  }> {
    await this.init()

    if (!window.testFunction) {
      throw new Error('WASM 函数未加载')
    }

    try {
      const result = window.testFunction(a, b)
      return result
    } catch (error) {
      console.error('[WASM] 测试函数失败:', error)
      return {
        success: false,
        message: `测试函数失败: ${error}`
      }
    }
  }
}

// 导出单例
export const wasmService = WASMService.getInstance()

