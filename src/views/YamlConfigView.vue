<template>
  <div class="w-full min-h-screen bg-gray-50 dark:bg-gray-900 px-6 sm:px-12 lg:px-24 py-8">
      
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">YAML 规则配置</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </router-link>
      </div>

      <!-- Provider选择 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择解析器</h2>
        <ProviderSelector
          v-if="supportedProviders.length > 0"
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider as any"
          @provider-selected="setProvider"
        />
        <div v-else class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-sm">正在加载解析器列表...</p>
        </div>
      </div>

      <!-- 配置内容 -->
      <div v-if="selectedProvider" class="space-y-6">
        <!-- 配置头部 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ getProviderDisplayName(selectedProvider) }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">使用 double-entry-generator 的 YAML 配置格式</p>
            </div>
            <div class="flex gap-4">
              <button
                @click="loadFromExample"
                class="inline-flex items-center px-8 py-4 text-lg font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
                :disabled="isLoadingExample"
              >
                <svg v-if="!isLoadingExample" class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <svg v-else class="w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoadingExample ? '加载中...' : '加载示例' }}
              </button>
              <button
                @click="showHistoryModal = true"
                class="inline-flex items-center px-8 py-4 text-lg font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl shadow-xl transition-all duration-200"
              >
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                历史
              </button>
            </div>
          </div>
          <div class="flex gap-4 mt-4">
            <button
              @click="exportConfig"
              class="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-2xl shadow-xl transition-all duration-200"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出
            </button>
            <button
              @click="importConfig"
              class="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-xl transition-all duration-200"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              导入
            </button>
          </div>
        </div>

        <!-- YAML 编辑器 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <YamlConfigEditor
            v-model="yamlContent"
            :provider="selectedProvider"
            @validated="onValidated"
            ref="yamlEditorRef"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap justify-end gap-4">
          <button
            @click="saveConfig"
            class="inline-flex items-center px-12 py-5 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            :disabled="!isValid"
          >
            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存配置
          </button>
          <button
            @click="testConfig"
            class="inline-flex items-center px-12 py-5 text-xl font-bold text-white bg-yellow-600 hover:bg-yellow-700 rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-600"
            :disabled="!isValid || isTesting"
          >
            <svg v-if="!isTesting" class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-7 h-7 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isTesting ? '测试中...' : '测试配置' }}
          </button>
          <button
            @click="goToBillProcessing"
            class="inline-flex items-center px-12 py-5 text-xl font-bold text-white bg-green-600 hover:bg-green-700 rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
            :disabled="!isValid"
          >
            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            处理账单
          </button>
        </div>
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else class="text-center py-12">
        <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">storage</span>
        <p class="text-gray-600 dark:text-gray-300">请先选择一个解析器来配置规则</p>
      </div>

    <!-- 历史记录模态框 -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">历史记录</h3>
          <button
            @click="showHistoryModal = false"
            class="text-gray-400 hover:text-gray-600 dark:text-gray-500 text-2xl"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="history in providerHistory"
            :key="history.id"
            class="border-2 border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
            @click="applyHistory(history.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ history.provider }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ formatDate(history.createdAt) }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  应用
                </button>
                <button
                  @click.stop="deleteHistory(history.id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <span class="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="providerHistory.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDegWasm } from '@/composables/useDegWasm'
import { yamlConfigService } from '@/services/yaml-config-service'
import ProviderSelector from '@/components/ProviderSelector.vue'
import YamlConfigEditor from '@/components/YamlConfigEditor.vue'
import { providers } from '@/data/providers'
import type { ProviderType } from '@/types/provider'

const route = useRoute()
const router = useRouter()
const deg = useDegWasm()

// 响应式数据
const selectedProvider = ref<string | null>(null)
const yamlContent = ref<string>('')
const isValid = ref(false)
const isLoadingExample = ref(false)
const isTesting = ref(false)
const showHistoryModal = ref(false)
const yamlEditorRef = ref<InstanceType<typeof YamlConfigEditor> | null>(null)

// 计算属性
const supportedProviders = computed(() => {
  // 优先使用 WASM 返回的 providers
  const wasmProviders = deg.supportedProviders.value
  if (wasmProviders.length > 0) {
    // 将 WASM provider ID 映射到 ProviderInfo
    return wasmProviders
      .map(providerId => {
        const provider = providers.find(p => p.type === providerId)
        return provider
      })
      .filter((p): p is typeof providers[0] => p !== undefined)
  }
  // 否则使用默认列表
  return providers.filter(p => ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk'].includes(p.type))
})

const providerHistory = computed(() => {
  if (!selectedProvider.value) return []
  return yamlConfigService.getHistory(selectedProvider.value)
})

// 方法
const setProvider = async (provider: string) => {
  selectedProvider.value = provider
  try {
    await deg.setProvider(provider)
    loadConfig()
  } catch (err) {
    console.error('设置 Provider 失败:', err)
    // 即使设置失败，也允许用户继续操作
  }
}

const loadConfig = () => {
  if (!selectedProvider.value) return

  const saved = yamlConfigService.getConfig(selectedProvider.value)
  if (saved) {
    yamlContent.value = saved
  } else {
    // 加载默认配置
    yamlContent.value = yamlConfigService.getDefaultConfig(selectedProvider.value)
  }
}

const loadFromExample = async () => {
  if (!selectedProvider.value) return

  isLoadingExample.value = true
  try {
    const exampleConfig = await yamlConfigService.loadFromExample(selectedProvider.value)
    if (exampleConfig) {
      yamlContent.value = exampleConfig
      // 验证配置
      if (yamlEditorRef.value) {
        yamlEditorRef.value.validateYaml()
      }
      alert('示例配置加载成功！')
    } else {
      alert('无法加载示例配置，请检查网络连接或手动创建配置')
    }
  } catch (error) {
    console.error('Failed to load example:', error)
    alert('加载示例配置失败')
  } finally {
    isLoadingExample.value = false
  }
}

const saveConfig = async () => {
  if (!selectedProvider.value || !isValid.value) return

  try {
    // 验证配置
    const validation = yamlConfigService.validateConfig(yamlContent.value)
    if (!validation.valid) {
      alert(`配置验证失败: ${validation.error}`)
      return
    }

    // 保存到本地存储
    yamlConfigService.saveConfig(selectedProvider.value, yamlContent.value)

    // 更新到 WASM
    await deg.updateConfig(validation.config!)

    alert('配置保存成功！')
  } catch (error) {
    console.error('Failed to save config:', error)
    alert('保存配置失败')
  }
}

const exportConfig = () => {
  if (!selectedProvider.value) return

  const config = yamlConfigService.exportConfig(selectedProvider.value)
  if (config) {
    navigator.clipboard.writeText(config).then(() => {
      alert('配置已复制到剪贴板！')
    }).catch(() => {
      alert('复制失败，请重试')
    })
  } else {
    alert('没有可导出的配置')
  }
}

const importConfig = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (!text) {
      alert('剪贴板为空')
      return
    }

    // 验证 YAML
    const validation = yamlConfigService.validateConfig(text)
    if (!validation.valid) {
      alert(`配置格式错误: ${validation.error}`)
      return
    }

    // 如果已选择 provider，直接导入
    if (selectedProvider.value) {
      yamlConfigService.importConfig(selectedProvider.value, text)
      yamlContent.value = text
      alert('配置导入成功！')
    } else {
      // 尝试从配置中检测 provider
      const config = validation.config as any
      const providerKeys = Object.keys(config).filter(
        key => !['defaultMinusAccount', 'defaultPlusAccount', 'defaultCurrency', 'title', 'defaultCashAccount', 'defaultCommissionAccount', 'defaultPositionAccount', 'defaultPnlAccount'].includes(key)
      )

      if (providerKeys.length > 0) {
        const detectedProvider = providerKeys[0]
        if (confirm(`检测到配置为 ${detectedProvider}，是否使用此解析器？`)) {
          await setProvider(detectedProvider)
          yamlContent.value = text
          alert('配置导入成功！')
        }
      } else {
        alert('无法从配置中检测到解析器，请先选择解析器')
      }
    }
  } catch (error) {
    console.error('Failed to import config:', error)
    alert('导入配置失败')
  }
}

const testConfig = async () => {
  if (!selectedProvider.value || !isValid.value) return

  isTesting.value = true
  try {
    // 更新配置到 WASM
    const validation = yamlConfigService.validateConfig(yamlContent.value)
    if (validation.config) {
      await deg.updateConfig(validation.config)
    }

    // 跳转到账单处理页面进行测试
    router.push({
      path: '/bill-processing',
      query: {
        provider: selectedProvider.value,
        from: 'yaml-config',
        test: 'true'
      }
    })
  } catch (error) {
    console.error('Failed to test config:', error)
    alert('测试配置失败')
  } finally {
    isTesting.value = false
  }
}

const goToBillProcessing = () => {
  if (!selectedProvider.value) return

  router.push({
    path: '/bill-processing',
    query: {
      provider: selectedProvider.value,
      from: 'yaml-config'
    }
  })
}

const applyHistory = (historyId: string) => {
  const content = yamlConfigService.applyHistory(historyId)
  if (content) {
    yamlContent.value = content
    showHistoryModal.value = false
    alert('历史配置应用成功！')
  } else {
    alert('应用历史配置失败')
  }
}

const deleteHistory = (historyId: string) => {
  if (confirm('确定要删除这个历史记录吗？')) {
    const success = yamlConfigService.deleteHistory(historyId)
    if (success) {
      showHistoryModal.value = false
      alert('历史记录删除成功！')
    } else {
      alert('删除失败，请重试')
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const onValidated = (valid: boolean) => {
  isValid.value = valid
}

const getProviderDisplayName = (provider: string) => {
  return deg.getProviderDisplayName(provider)
}

// 从URL参数初始化Provider
const initFromRoute = () => {
  const providerParam = route.query.provider as string
  if (providerParam) {
    setProvider(providerParam)
  } else if (supportedProviders.value.length > 0 && !selectedProvider.value) {
    // 如果没有指定 provider，使用第一个支持的 provider
    setProvider(supportedProviders.value[0].type)
  }
}

// 监听Provider变化
watch(selectedProvider, () => {
  loadConfig()
})

// 组件挂载时初始化
onMounted(async () => {
  try {
    await deg.init()
    
    // 等待一下让 providers 加载完成
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 如果没有支持的 providers，使用默认列表
    if (deg.supportedProviders.value.length === 0) {
      console.warn('WASM 未返回支持的 providers，使用默认列表')
    }
    
    initFromRoute()
  } catch (err) {
    console.error('初始化失败:', err)
    // 即使初始化失败，也允许用户继续操作（可能只是配置页面）
    // 尝试使用默认列表初始化
    if (supportedProviders.value.length > 0 && !selectedProvider.value) {
      setProvider(supportedProviders.value[0].type)
    }
  }
})
</script>

