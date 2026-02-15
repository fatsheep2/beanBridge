import { ref } from 'vue'

/**
 * 配置规则页与账单处理页之间共享的解析器状态，
 * 切换 Tab 时无需重新选择解析器。
 */
const sharedProvider = ref<string | null>(null)

export function useSharedProvider() {
  return {
    sharedProvider,
    setSharedProvider(provider: string | null) {
      sharedProvider.value = provider
    },
  }
}
