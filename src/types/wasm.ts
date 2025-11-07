/**
 * WASM 相关的类型定义
 */

export interface WASMProcessResult {
  success: boolean
  output?: string
  beancount?: string
  ledger?: string
  format?: 'beancount' | 'ledger'
  transactions?: number
  provider?: string
  error?: string
}

export interface WASMConfig {
  title?: string
  defaultMinusAccount?: string
  defaultPlusAccount?: string
  defaultCurrency?: string
  [provider: string]: any
}

export interface WASMProvider {
  name: string
  displayName: string
  supportedFormats: string[]
}

// 全局 WASM API 类型声明
declare global {
  interface Window {
    Go: any
    processFileFromInput: (fileInputId?: string) => Promise<WASMProcessResult>
    processFileFromInputWithFormat: (
      fileInputId?: string,
      format?: 'beancount' | 'ledger'
    ) => Promise<WASMProcessResult>
    processFileContent: (content: string) => WASMProcessResult
    parseYamlConfig: (yamlStr: string) => {
      success: boolean
      message?: string
      error?: string
      config?: WASMConfig
    }
    setProvider: (provider: string) => {
      success: boolean
      provider?: string
      error?: string
    }
    getSupportedProviders: () => {
      success: boolean
      providers?: string[]
    }
    getCurrentProvider: () => {
      success: boolean
      provider?: string
    }
    testFunction: (a?: number, b?: number) => {
      success: boolean
      args?: number
      message?: string
    }
    keepAlive: () => {
      success: boolean
    }
  }
}

