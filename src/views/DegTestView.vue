<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">DEG WASM 完整功能测试</h1>
        <p class="text-gray-600 dark:text-gray-400">测试 YAML 配置、文件上传和解析的完整流程</p>
      </div>

      <!-- WASM 初始化状态 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">WASM 状态</h2>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <span class="material-icons mr-2" :class="isInitialized ? 'text-green-500' : 'text-gray-400'">
                  {{ isInitialized ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                <span class="text-sm" :class="isInitialized ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'">
                  {{ isInitialized ? '已初始化' : '未初始化' }}
                </span>
              </div>
              <div v-if="isLoading" class="flex items-center">
                <span class="material-icons mr-2 animate-spin text-blue-500">refresh</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">初始化中...</span>
              </div>
            </div>
          </div>
          <button
            @click="initWasm"
            :disabled="isLoading || isInitialized"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span class="material-icons mr-2">play_arrow</span>
            初始化 WASM
          </button>
        </div>
        <div v-if="wasmError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-center">
            <span class="material-icons text-red-600 dark:text-red-400 mr-2">error</span>
            <span class="text-red-800 dark:text-red-200 text-sm">{{ wasmError }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤 1: Provider 选择 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">步骤 1: 选择 Provider</h2>
        <div v-if="supportedProviders.length === 0" class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          请先初始化 WASM
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="provider in supportedProviders"
            :key="provider"
            @click="selectProvider(provider)"
            :class="[
              'px-4 py-3 rounded-lg font-medium transition-all',
              currentProvider === provider
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ provider }}
          </button>
        </div>
        <div v-if="currentProvider" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <span class="text-sm text-blue-800 dark:text-blue-200">当前选择: <strong>{{ currentProvider }}</strong></span>
        </div>
      </div>

      <!-- 步骤 2: YAML 配置 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">步骤 2: YAML 配置</h2>
          <div class="flex space-x-2">
            <button
              @click="loadExampleConfig"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition-all text-sm"
            >
              <span class="material-icons mr-2 text-sm">file_download</span>
              加载示例
            </button>
            <button
              @click="parseConfig"
              :disabled="!yamlConfig.trim()"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <span class="material-icons mr-2 text-sm">check_circle</span>
              解析配置
            </button>
          </div>
        </div>
        <textarea
          v-model="yamlConfig"
          class="w-full h-64 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          placeholder="请输入 YAML 配置..."
        ></textarea>
        <div v-if="configError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-center">
            <span class="material-icons text-red-600 dark:text-red-400 mr-2">error</span>
            <span class="text-red-800 dark:text-red-200 text-sm">{{ configError }}</span>
          </div>
        </div>
        <div v-if="configSuccess" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div class="flex items-center">
            <span class="material-icons text-green-600 dark:text-green-400 mr-2">check_circle</span>
            <span class="text-green-800 dark:text-green-200 text-sm">{{ configSuccess }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤 3: 文件上传 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">步骤 3: 上传账单文件</h2>
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".csv,.xls,.xlsx"
            class="hidden"
          />
          <div class="flex flex-col items-center">
            <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">cloud_upload</span>
            <button
              @click="() => fileInput?.click()"
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all mb-3"
            >
              <span class="material-icons mr-2">folder_open</span>
              选择文件
            </button>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              支持的文件格式: CSV, XLS, XLSX
            </p>
          </div>
        </div>
        <div v-if="selectedFile" class="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                <span class="material-icons text-sm mr-1 align-middle">description</span>
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                大小: {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
            <button
              @click="clearFile"
              class="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="清除文件"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤 4: 输出格式选择 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">步骤 4: 选择输出格式</h2>
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

      <!-- 步骤 5: 处理文件 -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">步骤 5: 处理文件</h2>
        <button
          @click="processFile"
          :disabled="!isInitialized || !currentProvider || !selectedFile || isProcessing"
          class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span class="material-icons mr-2" v-if="!isProcessing">play_arrow</span>
          <span class="material-icons mr-2 animate-spin" v-else>refresh</span>
          {{ isProcessing ? '处理中...' : '开始处理' }}
        </button>
        <div v-if="processError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-center">
            <span class="material-icons text-red-600 dark:text-red-400 mr-2">error</span>
            <span class="text-red-800 dark:text-red-200 text-sm">{{ processError }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤 6: 结果展示 -->
      <div v-if="processResult && processResult.success" class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">步骤 6: 处理结果</h2>
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
        <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">格式:</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processResult.format || outputFormat }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">交易数:</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processResult.transactions || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">Provider:</span>
              <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ processResult.provider || currentProvider }}</span>
            </div>
          </div>
        </div>
        <pre class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm overflow-x-auto max-h-96 overflow-y-auto font-mono text-gray-900 dark:text-gray-100">{{ processResult.output }}</pre>
      </div>

      <!-- 返回首页 -->
      <div class="text-center">
        <router-link
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md transition-all"
        >
          <span class="material-icons mr-2">arrow_back</span>
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// WASM 状态
const isInitialized = ref(false)
const isLoading = ref(false)
const wasmError = ref<string | null>(null)
const supportedProviders = ref<string[]>([])
const currentProvider = ref<string>('')

// YAML 配置
const yamlConfig = ref(`defaultMinusAccount: Assets:FIXME
defaultPlusAccount: Expenses:FIXME
defaultCurrency: CNY
title: 测试配置

alipay:
  rules:
    - category: 餐饮美食
      targetAccount: Expenses:Food
    - peer: 滴滴
      targetAccount: Expenses:Transport:Taxi
`)
const configError = ref<string | null>(null)
const configSuccess = ref<string | null>(null)

// 文件上传
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

// 输出格式
const outputFormat = ref<'beancount' | 'ledger'>('beancount')

// 处理状态
const isProcessing = ref(false)
const processError = ref<string | null>(null)
const processResult = ref<any>(null)

/**
 * 初始化 WASM
 */
const initWasm = async () => {
  isLoading.value = true
  wasmError.value = null

  try {
    // 检查 WASM 文件是否存在
    const wasmExecCheck = await fetch('/wasm/wasm_exec.js', { method: 'HEAD' }).catch(() => null)
    if (!wasmExecCheck || !wasmExecCheck.ok) {
      throw new Error('WASM 文件未找到。请确保已运行 `npm run copy-wasm` 或 `pnpm run copy-wasm` 复制 WASM 文件到 public/wasm/ 目录')
    }

    // 加载 wasm_exec.js
    if (!window.Go) {
      await loadScript('/wasm/wasm_exec.js')
    }

    // 检查 WASM 二进制文件
    const wasmCheck = await fetch('/wasm/double-entry-generator.wasm', { method: 'HEAD' }).catch(() => null)
    if (!wasmCheck || !wasmCheck.ok) {
      throw new Error('WASM 二进制文件未找到。请确保已构建 double-entry-generator 的 WASM 版本')
    }

    // 加载 WASM 模块
    const go = new window.Go()
    const wasmResponse = await fetch('/wasm/double-entry-generator.wasm')
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

    isInitialized.value = true

    // 获取支持的 providers
    if (window.getSupportedProviders) {
      const result = await window.getSupportedProviders()
      if (result.success && result.providers) {
        supportedProviders.value = result.providers
        if (result.providers.length > 0) {
          currentProvider.value = result.providers[0]
          // 设置默认 provider
          if (window.setProvider) {
            await window.setProvider(result.providers[0])
          }
        }
      }
    } else {
      // 如果 getSupportedProviders 不可用，使用默认列表
      supportedProviders.value = ['alipay', 'wechat', 'icbc', 'ccb', 'citic', 'cmb', 'huobi', 'htsec', 'hxsec', 'mt', 'jd', 'bmo', 'td', 'hsbchk']
      currentProvider.value = 'alipay'
      if (window.setProvider) {
        await window.setProvider('alipay')
      }
    }
  } catch (err: any) {
    console.error('WASM 初始化失败:', err)
    wasmError.value = err instanceof Error ? err.message : String(err)
    isInitialized.value = false
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载脚本
 */
const loadScript = (src: string): Promise<void> => {
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
 * 选择 Provider
 */
const selectProvider = async (provider: string) => {
  currentProvider.value = provider
  if (window.setProvider) {
    try {
      const result = await window.setProvider(provider)
      if (!result.success) {
        wasmError.value = result.error || '设置 Provider 失败'
      }
    } catch (err: any) {
      wasmError.value = err.message || '设置 Provider 失败'
    }
  }
}

/**
 * 加载示例配置
 */
const loadExampleConfig = () => {
  yamlConfig.value = `defaultMinusAccount: Assets:FIXME
defaultPlusAccount: Expenses:FIXME
defaultCurrency: CNY
title: 示例配置

alipay:
  rules:
    - category: 餐饮美食
      targetAccount: Expenses:Food
    - peer: 滴滴
      targetAccount: Expenses:Transport:Taxi
`
}

/**
 * 解析配置
 */
const parseConfig = async () => {
  if (!yamlConfig.value.trim()) {
    configError.value = '配置不能为空'
    return
  }

  configError.value = null
  configSuccess.value = null

  if (window.parseYamlConfig) {
    try {
      const result = await window.parseYamlConfig(yamlConfig.value)
      if (result.success) {
        configSuccess.value = result.message || '配置解析成功'
        configError.value = null
      } else {
        configError.value = result.error || '配置解析失败'
        configSuccess.value = null
      }
    } catch (err: any) {
      configError.value = err.message || '配置解析失败'
      configSuccess.value = null
    }
  } else {
    configError.value = 'WASM 未初始化或 parseYamlConfig 函数不可用'
  }
}

/**
 * 处理文件选择
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    processError.value = null
    processResult.value = null
  }
}

/**
 * 清除文件
 */
const clearFile = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  selectedFile.value = null
  processError.value = null
  processResult.value = null
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 处理文件
 */
const processFile = async () => {
  if (!isInitialized.value) {
    processError.value = '请先初始化 WASM'
    return
  }

  if (!currentProvider.value) {
    processError.value = '请先选择 Provider'
    return
  }

  if (!selectedFile.value) {
    processError.value = '请先选择文件'
    return
  }

  // 如果有配置，先解析配置
  if (yamlConfig.value.trim()) {
    await parseConfig()
    if (configError.value) {
      processError.value = '配置解析失败，请检查配置'
      return
    }
  }

  isProcessing.value = true
  processError.value = null
  processResult.value = null

  try {
    // 创建临时文件输入元素
    const tempFileInputId = 'tempWasmFileInput'
    const tempFileInput = document.createElement('input')
    tempFileInput.type = 'file'
    tempFileInput.id = tempFileInputId
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(selectedFile.value)
    tempFileInput.files = dataTransfer.files
    document.body.appendChild(tempFileInput)

    try {
      if (window.processFileFromInputWithFormat) {
        const result = await window.processFileFromInputWithFormat(tempFileInputId, outputFormat.value)
        if (result.success) {
          processResult.value = result
          processError.value = null
        } else {
          processError.value = result.error || '处理文件失败'
          processResult.value = null
        }
      } else {
        processError.value = 'WASM 函数 processFileFromInputWithFormat 不可用'
      }
    } finally {
      document.body.removeChild(tempFileInput)
    }
  } catch (err: any) {
    console.error('处理文件失败:', err)
    processError.value = err.message || '处理文件失败'
    processResult.value = null
  } finally {
    isProcessing.value = false
  }
}

/**
 * 复制结果
 */
const copyResult = async () => {
  if (processResult.value?.output) {
    try {
      await navigator.clipboard.writeText(processResult.value.output)
      alert('已复制到剪贴板！')
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败')
    }
  }
}

/**
 * 下载结果
 */
const downloadResult = () => {
  if (!processResult.value?.output) {
    processError.value = '没有可下载的数据'
    return
  }

  const extension = outputFormat.value === 'beancount' ? 'beancount' : 'ledger'
  const blob = new Blob([processResult.value.output], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `output.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 全局类型已在 src/types/wasm.ts 中声明，这里不需要重复声明

// 组件挂载时自动初始化
onMounted(() => {
  // 不自动初始化，让用户手动点击
})
</script>

