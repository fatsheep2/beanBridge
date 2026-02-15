<template>
  <div class="page-bill">
      <!-- 解析器选择 -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">选择解析器</h2>
          <van-button v-if="currentProvider" size="small" @click="goToRuleConfig" title="跳转到规则配置页面">
            配置规则
          </van-button>
        </div>
        <ProviderSelector
          v-if="providersForSelector.length > 0"
          :supported-providers="providersForSelector"
          :selected-provider="currentProvider as any"
          @provider-selected="handleProviderSelected"
        />
        <div v-else class="p-4 rounded-md text-secondary text-sm">正在加载解析器列表...</div>
      </div>

      <!-- 文件上传 -->
      <div v-if="currentProvider" class="card mb-6">
        <h2 class="card-title mb-4">上传账单文件</h2>
        <FileUploadSection
          :selected-file="selectedFile"
          :detected-provider="null"
          @file-selected="handleFileSelect"
        />
      </div>

      <!-- 输出格式选择 -->
      <div v-if="currentProvider" class="card mb-6">
        <h2 class="card-title mb-4">输出格式</h2>
        <van-radio-group v-model="outputFormat" direction="horizontal">
          <van-radio name="beancount">Beancount</van-radio>
          <van-radio name="ledger">Ledger</van-radio>
        </van-radio-group>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-6 flex flex-wrap gap-3" v-if="selectedFile && currentProvider">
        <van-button type="primary" size="large" :loading="isProcessing" :disabled="!selectedFile" @click="handleProcessFile">
          {{ isProcessing ? '处理中...' : `生成 ${outputFormat === 'beancount' ? 'Beancount' : 'Ledger'}` }}
        </van-button>
        <van-button size="large" @click="goToRuleConfig">规则配置</van-button>
      </div>

      <!-- 错误信息 -->
      <van-notice-bar v-if="error" type="danger" left-icon="warning-o" class="mb-6">
        {{ error }}
      </van-notice-bar>

      <!-- 结果展示 -->
      <div v-if="processingResult && processingResult.success" class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">处理结果</h2>
          <div class="flex gap-2">
            <van-button size="small" @click="copyResult">复制</van-button>
            <van-button type="primary" size="small" @click="downloadResult">下载</van-button>
          </div>
        </div>

        <div class="mb-4 p-3 rounded-lg bg-gray-1 text-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><span class="text-secondary">格式:</span><span class="ml-2 font-medium">{{ processingResult.format || outputFormat }}</span></div>
          <div><span class="text-secondary">交易数:</span><span class="ml-2 font-medium">{{ processingResult.transactions || 0 }}</span></div>
          <div><span class="text-secondary">Provider:</span><span class="ml-2 font-medium">{{ processingResult.provider }}</span></div>
        </div>
        <pre class="result-pre">{{ processingResult.output }}</pre>
      </div>

      <!-- 规则匹配分析 -->
      <RuleMatchAnalysis
        v-if="processingResult && processingResult.success && processingResult.output"
        :processed-data="processingResult.output"
        :total-records="processingResult.transactions || 0"
      />

      <!-- 加载提示 -->
      <van-notice-bar v-if="isInitializing" type="primary" left-icon="info-o" class="mb-6">
        正在初始化 WASM 模块...
      </van-notice-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDegWasm } from '@/composables/useDegWasm'
import { useDegFileProcessing } from '@/composables/useDegFileProcessing'
import { useSharedProvider } from '@/composables/useSharedProvider'
import { yamlConfigService } from '@/services/yaml-config-service'
import { yaml } from '@/utils/yaml'
import { providers } from '@/data/providers'
import FileUploadSection from '@/components/FileUploadSection.vue'
import ProviderSelector from '@/components/ProviderSelector.vue'
import RuleMatchAnalysis from '@/components/RuleMatchAnalysis.vue'

const router = useRouter()
const route = useRoute()

const deg = useDegWasm()
const fileProcessing = useDegFileProcessing()
const { sharedProvider, setSharedProvider } = useSharedProvider()

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
        const errMsg = err instanceof Error ? err.message : String(err)
        if (errMsg.includes('expected a map, got') || errMsg.includes('expected a map')) {
          yamlConfigService.removeConfig(provider)
        }
        await deg.setProvider(provider)
        await new Promise(resolve => setTimeout(resolve, 100))
        const defaultConfig = yamlConfigService.getDefaultConfig(provider)
        await deg.updateConfig(yaml.parse(defaultConfig), provider)
      }
    } else {
      console.log(`[BillProcessing] 没有配置文件，只设置 provider`)
    }
    
    setSharedProvider(provider)
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
    
    // 解析器优先级：URL 参数 > 跨页共享状态 > 第一个支持的
    const providerParam = route.query.provider as string
    const list = providersForSelector.value
    const providerToUse = providerParam && list.some(p => p.type === providerParam)
      ? providerParam
      : (sharedProvider.value && list.some(p => p.type === sharedProvider.value) ? sharedProvider.value : null)
    if (providerToUse) {
      await deg.setProvider(providerToUse)
      setSharedProvider(providerToUse)
    } else if (list.length > 0) {
      const first = list[0].type
      await deg.setProvider(first)
      setSharedProvider(first)
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
          const errMsg = err instanceof Error ? err.message : String(err)
          if (errMsg.includes('expected a map, got') || errMsg.includes('expected a map')) {
            yamlConfigService.removeConfig(currentProvider.value)
          }
          await deg.setProvider(currentProvider.value)
          await new Promise(resolve => setTimeout(resolve, 50))
          const defaultConfig = yamlConfigService.getDefaultConfig(currentProvider.value)
          await deg.updateConfig(yaml.parse(defaultConfig), currentProvider.value)
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

<style scoped>
.page-bill {
  width: 100%;
  min-height: 100%;
}
.card {
  background: var(--van-cell-group-background, #fff);
  border-radius: var(--van-radius-lg, 12px);
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.text-secondary {
  color: #6b7280;
}
.result-pre {
  background: var(--van-gray-1, #f7f8fa);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 360px;
  overflow-y: auto;
  font-family: ui-monospace, monospace;
  color: #1f2937;
  border: 1px solid var(--van-gray-2, #ebedf0);
}
</style>
