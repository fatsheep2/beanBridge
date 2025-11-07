/**
 * YAML 工具函数
 */

import * as yamlLib from 'yaml'

export const yamlUtils = {
  /**
   * 解析 YAML 字符串
   */
  parse<T = any>(str: string): T {
    return yamlLib.parse(str) as T
  },

  /**
   * 将对象转换为 YAML 字符串
   */
  stringify(obj: any, options?: yamlLib.ToStringOptions): string {
    return yamlLib.stringify(obj, options)
  }
}

// 导出默认对象以兼容不同的导入方式
export const yaml = yamlUtils

