<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-2xl rounded-2xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-10">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold">账单处理</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <span class="material-icons mr-3">arrow_back</span>
          返回首页
        </router-link>
      </div>
      
      <!-- 解析器选择组件 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">选择解析器</h2>
          <button
            v-if="currentProvider"
            @click="goToRuleConfig"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition-all text-sm"
            title="跳转到规则配置页面"
          >
            <span class="material-icons mr-2 text-sm">settings</span>
            配置规则
          </button>
        </div>
        <ProviderSelector
          v-if="providersForSelector.length > 0"
          :supported-providers="providersForSelector"
          :selected-provider="currentProvider"
          @provider-selected="handleProviderSelected"
        />
        <div v-else class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-sm">正在加载解析器列表...</p>
        </div>
      </div>

      <!-- 文件上传组件 -->
      <div v-if="currentProvider" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">上传账单文件</h2>
        <FileUploadSection
          :selected-file="selectedFile"
          :detected-provider="currentProvider"
          @file-selected="handleFileSelect"
        />
      </div>

      <!-- 输出格式选择 -->
      <div v-if="currentProvider" class="mb-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold mb-4">输出格式</h2>
        <div class="flex space-x-6">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              v-model="outputFormat"
              value="beancount"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-700 dark:text-gray-300 font-medium">Beancount</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              v-model="outputFormat"
              value="ledger"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-700 dark:text-gray-300 font-medium">Ledger</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-8" v-if="selectedFile && currentProvider">
        <div class="flex flex-wrap gap-4">
          <button
            @click="handleProcessFile"
            :disabled="isProcessing || !selectedFile"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span class="material-icons mr-2" v-if="!isProcessing">play_arrow</span>
            <span class="material-icons mr-2 animate-spin" v-else>refresh</span>
            {{ isProcessing ? '处理中...' : `生成 ${outputFormat === 'beancount' ? 'Beancount' : 'Ledger'}` }}
          </button>
          <button
            @click="goToRuleConfig"
            class="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md transition-all"
          >
            <span class="material-icons mr-2">settings</span>
            规则配置
          </button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div class="flex items-center">
          <span class="material-icons text-red-600 dark:text-red-400 mr-2">error</span>
          <span class="text-red-800 dark:text-red-200 font-medium">{{ error }}</span>
        </div>
      </div>

      <!-- 结果展示 -->
      <div v-if="processingResult && processingResult.success" class="mb-8">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">处理结果</h2>
            <div class="flex gap-2">
              <button
                @click="copyResult"
                class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-all"
              >
                <span class="material-icons mr-2 text-sm">content_copy</span>
                复制
              </button>
              <button
                @click="downloadResult"
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
              >
                <span class="material-icons mr-2 text-sm">download</span>
                下载
              </button>
            </div>
          </div>

          <div class="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">格式:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processingResult.format || outputFormat }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">交易数:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processingResult.transactions || 0 }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Provider:</span>
                <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processingResult.provider }}</span>
              </div>
            </div>
          </div>
          <pre class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm overflow-x-auto max-h-96 overflow-y-auto font-mono text-gray-900 dark:text-gray-100">{{ processingResult.output }}</pre>
        </div>
      </div>

      <!-- 加载提示 -->
      <div v-if="isInitializing" class="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div class="flex items-center">
          <span class="material-icons text-blue-600 dark:text-blue-400 mr-2 animate-spin">refresh</span>
          <span class="text-blue-800 dark:text-blue-200 font-medium">正在初始化 WASM 模块...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDegWasm } from '@/composables/useDegWasm'
import { useDegFileProcessing } from '@/composables/useDegFileProcessing'
import { yamlConfigService } from '@/services/yaml-config-service'
import { yaml } from '@/utils/yaml'
import { providers } from '@/data/providers'
import FileUploadSection from '@/components/FileUploadSection.vue'
import ProviderSelector from '@/components/ProviderSelector.vue'

const router = useRouter()
const route = useRoute()

const deg = useDegWasm()
const fileProcessing = useDegFileProcessing()

// 响应式数据
const isInitializing = ref(true)
const currentProvider = computed<string | null>(() => deg.currentProvider.value)
// 将 WASM 返回的 providers 转换为 ProviderSelector 期望的格式
const providersForSelector = computed(() => {
  const wasmProviders = deg.supportedProviders.value
  if (wasmProviders.length === 0) {
    // 如果没有 WASM providers，使用默认列表
    return providers.filter(p => ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk'].includes(p.type))
  }
  // 将 WASM provider ID 映射到 ProviderInfo
  return wasmProviders
    .map(providerId => {
      const provider = providers.find(p => p.type === providerId)
      return provider
    })
    .filter((p): p is typeof providers[0] => p !== undefined)
})
const selectedFile = computed(() => fileProcessing.selectedFile.value)
const isProcessing = computed(() => fileProcessing.isProcessing.value)
const processingResult = computed(() => fileProcessing.processingResult.value)
const error = computed(() => fileProcessing.error.value || deg.error.value)
const outputFormat = computed({
  get: () => fileProcessing.outputFormat.value,
  set: (value) => {
    fileProcessing.outputFormat.value = value
  }
})

// 方法
const handleProviderSelected = async (provider: string) => {
  try {
    await deg.setProvider(provider)
    // 加载已保存的配置
    let savedConfig = yamlConfigService.getConfig(provider)
    if (!savedConfig) {
      // 如果没有保存的配置，使用默认配置
      savedConfig = yamlConfigService.getDefaultConfig(provider)
    }
    
    if (savedConfig) {
      try {
        await deg.updateConfig(yaml.parse(savedConfig))
      } catch (err) {
        console.warn('加载配置失败，将使用默认配置:', err)
        // 如果加载失败，使用默认配置
        const defaultConfig = yamlConfigService.getDefaultConfig(provider)
        await deg.updateConfig(yaml.parse(defaultConfig))
      }
    }
  } catch (err) {
    console.error('设置 Provider 失败:', err)
    fileProcessing.error.value = `设置 Provider 失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

const handleFileSelect = (file: File | null) => {
  fileProcessing.selectedFile.value = file
  fileProcessing.error.value = null
  if (!file) {
    fileProcessing.processingResult.value = null
  }
}

const handleProcessFile = async () => {
  if (!selectedFile.value || !currentProvider.value) {
    fileProcessing.error.value = '请选择文件和解析器'
    return
  }

  // 确保已加载配置
  if (currentProvider.value) {
    let savedConfig = yamlConfigService.getConfig(currentProvider.value)
    if (!savedConfig) {
      // 如果没有保存的配置，使用默认配置
      savedConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
    }
    
    if (savedConfig) {
      try {
        await deg.updateConfig(yaml.parse(savedConfig))
      } catch (err) {
        console.warn('加载配置失败，将使用默认配置:', err)
        // 如果加载失败，使用默认配置
        const defaultConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
        await deg.updateConfig(yaml.parse(defaultConfig))
      }
    }
  }

  await fileProcessing.processFile(selectedFile.value, outputFormat.value)
}

const copyResult = async () => {
  if (processingResult.value?.output) {
    const success = await fileProcessing.copyToClipboard(processingResult.value.output)
    if (success) {
      alert('已复制到剪贴板！')
    } else {
      alert('复制失败')
    }
  }
}

const downloadResult = () => {
  const extension = outputFormat.value === 'beancount' ? 'beancount' : 'ledger'
  fileProcessing.downloadResult(`output.${extension}`)
}

const goToRuleConfig = () => {
  if (currentProvider.value) {
    router.push({
      path: '/rule-config',
      query: { provider: currentProvider.value, from: 'bill-processing' }
    })
  } else {
    router.push({ path: '/rule-config', query: { from: 'bill-processing' } })
  }
}

// 初始化
onMounted(async () => {
  try {
    // 初始化 WASM
    await deg.init()
    
    // 等待一下让 providers 加载完成
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 从 URL 参数获取 provider
    const providerParam = route.query.provider as string
    if (providerParam) {
      await deg.setProvider(providerParam)
    } else if (deg.supportedProviders.value.length > 0) {
      // 如果没有指定 provider，使用第一个支持的 provider
      await deg.setProvider(deg.supportedProviders.value[0])
    } else if (providersForSelector.value.length > 0) {
      // 如果 WASM 没有返回 providers，使用默认列表的第一个
      await deg.setProvider(providersForSelector.value[0].type)
    }

    // 加载已保存的配置
    if (currentProvider.value) {
      let savedConfig = yamlConfigService.getConfig(currentProvider.value)
      if (!savedConfig) {
        // 如果没有保存的配置，使用默认配置
        savedConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
      }
      
      if (savedConfig) {
        try {
          await deg.updateConfig(yaml.parse(savedConfig))
        } catch (err) {
          console.warn('加载配置失败，将使用默认配置:', err)
          // 如果加载失败，使用默认配置
          const defaultConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
          await deg.updateConfig(yaml.parse(defaultConfig))
        }
      }
    }
  } catch (err) {
    console.error('初始化失败:', err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    fileProcessing.error.value = `WASM 初始化失败: ${errorMsg}。请刷新页面重试`
  } finally {
    isInitializing.value = false
  }
})
</script>

