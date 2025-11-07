<template>
  <div class="w-full min-h-screen bg-gray-50 dark:bg-gray-900 px-6 sm:px-12 lg:px-24 py-8">
      
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">账单处理</h1>
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
      
      <!-- 解析器选择 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">选择解析器</h2>
          <button
            v-if="currentProvider"
            @click="goToRuleConfig"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
            title="跳转到规则配置页面"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            配置规则
          </button>
        </div>
        <ProviderSelector
          v-if="providersForSelector.length > 0"
          :supported-providers="providersForSelector"
          :selected-provider="currentProvider as any"
          @provider-selected="handleProviderSelected"
        />
        <div v-else class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-sm">正在加载解析器列表...</p>
        </div>
      </div>

      <!-- 文件上传 -->
      <div v-if="currentProvider" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">上传账单文件</h2>
        <FileUploadSection
          :selected-file="selectedFile"
          :detected-provider="null"
          @file-selected="handleFileSelect"
        />
      </div>

      <!-- 输出格式选择 -->
      <div v-if="currentProvider" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">输出格式</h2>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              v-model="outputFormat"
              value="beancount"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-700 dark:text-gray-300">Beancount</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              v-model="outputFormat"
              value="ledger"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-700 dark:text-gray-300">Ledger</span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-6" v-if="selectedFile && currentProvider">
        <div class="flex flex-wrap gap-4">
          <button
            @click="handleProcessFile"
            :disabled="isProcessing || !selectedFile"
            class="inline-flex items-center px-12 py-5 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <svg v-if="!isProcessing" class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-7 h-7 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isProcessing ? '处理中...' : `生成 ${outputFormat === 'beancount' ? 'Beancount' : 'Ledger'}` }}
          </button>
          <button
            @click="goToRuleConfig"
            class="inline-flex items-center px-12 py-5 text-xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl shadow-xl transition-all duration-200"
          >
            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            规则配置
          </button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-800 dark:text-red-200 font-medium">{{ error }}</span>
        </div>
      </div>

      <!-- 结果展示 -->
      <div v-if="processingResult && processingResult.success" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">处理结果</h2>
          <div class="flex gap-2">
            <button
              @click="copyResult"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </button>
            <button
              @click="downloadResult"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载
            </button>
          </div>
        </div>

        <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
        <pre class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto font-mono text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">{{ processingResult.output }}</pre>
      </div>

      <!-- 加载提示 -->
      <div v-if="isInitializing" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-blue-800 dark:text-blue-200 font-medium">正在初始化 WASM 模块...</span>
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
    console.log(`[BillProcessing] 开始切换 provider 到: ${provider}`)
    
    // 先设置 provider，确保全局 currentProvider 正确
    console.log(`[BillProcessing] 第一次调用 setProvider: ${provider}`)
    const setResult1 = await deg.setProvider(provider)
    console.log(`[BillProcessing] setProvider 结果:`, setResult1)
    await new Promise(resolve => setTimeout(resolve, 100)) // 等待确保设置完成
    
    // 加载已保存的配置
    let savedConfig = yamlConfigService.getConfig(provider)
    if (!savedConfig) {
      // 如果没有保存的配置，使用默认配置
      savedConfig = yamlConfigService.getDefaultConfig(provider)
    }
    
    if (savedConfig) {
      try {
        // 再次设置 provider，确保在更新配置前 provider 是正确的
        console.log(`[BillProcessing] 第二次调用 setProvider: ${provider}`)
        const setResult2 = await deg.setProvider(provider)
        console.log(`[BillProcessing] setProvider 结果:`, setResult2)
        await new Promise(resolve => setTimeout(resolve, 100)) // 增加等待时间
        
        // 更新配置时传递 provider 确保正确
        console.log(`[BillProcessing] 调用 updateConfig，provider: ${provider}`)
        await deg.updateConfig(yaml.parse(savedConfig), provider)
        console.log(`[BillProcessing] updateConfig 完成`)
      } catch (err) {
        console.warn('加载配置失败，将使用默认配置:', err)
        // 如果加载失败，使用默认配置
        await deg.setProvider(provider)
        await new Promise(resolve => setTimeout(resolve, 100))
        const defaultConfig = yamlConfigService.getDefaultConfig(provider)
        await deg.updateConfig(yaml.parse(defaultConfig), provider)
      }
    } else {
      console.log(`[BillProcessing] 没有配置文件，只设置 provider`)
    }
    
    console.log(`[BillProcessing] provider 切换完成: ${provider}`)
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

  console.log(`[BillProcessing] 开始处理文件，当前 provider: ${currentProvider.value}`)
  
  // 直接处理文件，配置已经在选择 provider 时加载了
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
      // 先确保 provider 正确
      await deg.setProvider(currentProvider.value)
      await new Promise(resolve => setTimeout(resolve, 50))
      
      let savedConfig = yamlConfigService.getConfig(currentProvider.value)
      if (!savedConfig) {
        // 如果没有保存的配置，使用默认配置
        savedConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
      }
      
      if (savedConfig) {
        try {
          // updateConfig 时传递 provider 确保正确
          await deg.updateConfig(yaml.parse(savedConfig), currentProvider.value)
          
          // 配置更新后，再次确保 provider 正确
          await deg.setProvider(currentProvider.value)
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (err) {
          console.warn('加载配置失败，将使用默认配置:', err)
          // 如果加载失败，使用默认配置
          await deg.setProvider(currentProvider.value)
          await new Promise(resolve => setTimeout(resolve, 50))
          
          const defaultConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
          await deg.updateConfig(yaml.parse(defaultConfig), currentProvider.value)
          
          // 配置更新后，再次确保 provider 正确
          await deg.setProvider(currentProvider.value)
          await new Promise(resolve => setTimeout(resolve, 50))
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

