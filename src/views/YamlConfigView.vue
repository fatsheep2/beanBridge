<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-2xl rounded-2xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-10">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold">YAML 规则配置</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <span class="material-icons mr-3">arrow_back</span>
          返回首页
        </router-link>
      </div>

      <!-- Provider选择 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">选择解析器</h2>
        <ProviderSelector
          v-if="supportedProviders.length > 0"
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
        <div v-else class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-sm">正在加载解析器列表...</p>
        </div>
      </div>

      <!-- 配置内容 -->
      <div v-if="selectedProvider" class="space-y-6">
        <!-- 配置头部 -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold">{{ getProviderDisplayName(selectedProvider) }}</h3>
            <p class="text-gray-600 dark:text-gray-300">使用 double-entry-generator 的 YAML 配置格式</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="loadFromExample"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              :disabled="isLoadingExample"
            >
              <span class="material-icons mr-2" v-if="!isLoadingExample">file_download</span>
              <span class="material-icons mr-2 animate-spin" v-else>refresh</span>
              {{ isLoadingExample ? '加载中...' : '加载示例配置' }}
            </button>
            <button
              @click="showHistoryModal = true"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium shadow-md transition-all"
            >
              <span class="material-icons mr-2">history</span>
              历史记录
            </button>
            <button
              @click="exportConfig"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all"
            >
              <span class="material-icons mr-2">download</span>
              导出配置
            </button>
            <button
              @click="importConfig"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all"
            >
              <span class="material-icons mr-2">upload</span>
              导入配置
            </button>
          </div>
        </div>

        <!-- YAML 编辑器 -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <YamlConfigEditor
            v-model="yamlContent"
            :provider="selectedProvider"
            @validated="onValidated"
            ref="yamlEditorRef"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="saveConfig"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            :disabled="!isValid"
          >
            <span class="material-icons mr-2">save</span>
            保存配置
          </button>
          <button
            @click="testConfig"
            class="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            :disabled="!isValid || isTesting"
          >
            <span class="material-icons mr-2" v-if="!isTesting">bug_report</span>
            <span class="material-icons mr-2 animate-spin" v-else>refresh</span>
            {{ isTesting ? '测试中...' : '测试配置' }}
          </button>
          <button
            @click="goToBillProcessing"
            class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            :disabled="!isValid"
          >
            <span class="material-icons mr-2">play_arrow</span>
            处理账单
          </button>
        </div>
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else class="text-center py-12">
        <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">storage</span>
        <p class="text-gray-600 dark:text-gray-300">请先选择一个解析器来配置规则</p>
      </div>
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
const setProvider = async (provider: ProviderType | string) => {
  // 如果是 ProviderType，直接使用；如果是字符串，转换为 ProviderType
  const providerId = typeof provider === 'string' ? provider as ProviderType : provider
  selectedProvider.value = providerId
  try {
    await deg.setProvider(providerId)
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
    setProvider(providerParam as ProviderType)
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

