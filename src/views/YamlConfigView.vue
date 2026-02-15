<template>
  <div class="page-rule">
      <!-- Provider选择 -->
      <div class="card mb-6">
        <h2 class="card-title mb-4">选择解析器</h2>
        <ProviderSelector
          v-if="supportedProviders.length > 0"
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider as any"
          @provider-selected="setProvider"
        />
        <div v-else class="p-4 rounded-md text-secondary text-sm">正在加载解析器列表...</div>
      </div>

      <!-- 配置内容 -->
      <div v-if="selectedProvider" class="space-y-6">
        <!-- 配置头部 -->
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ getProviderDisplayName(selectedProvider) }}</h3>
              <p class="text-sm text-secondary mt-1">使用 double-entry-generator 的 YAML 配置格式</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <van-button :loading="isLoadingExample" :disabled="isLoadingExample" @click="loadFromExample">
                {{ isLoadingExample ? '加载中...' : '加载示例' }}
              </van-button>
              <van-button @click="showHistoryModal = true">历史</van-button>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <van-button type="primary" @click="exportConfig">导出</van-button>
            <van-button plain type="primary" @click="importConfig">导入</van-button>
          </div>
        </div>

        <!-- YAML 编辑器 -->
        <div class="card">
          <YamlConfigEditor
            v-model="yamlContent"
            :provider="selectedProvider"
            @validated="onValidated"
            ref="yamlEditorRef"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="my-6 flex flex-wrap gap-2 justify-end">
          <van-button type="primary" @click="saveConfig">保存配置</van-button>
          <van-button plain type="primary" @click="goToBillProcessing">处理账单</van-button>
        </div>

        <!-- 规则列表可视化 -->
        <RuleListViewer
          :yaml-content="yamlContent"
          :provider="selectedProvider"
        />
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else class="text-center py-12">
        <van-empty description="请先选择一个解析器来配置规则" />
      </div>

    <!-- 历史记录弹层 -->
    <van-popup v-model:show="showHistoryModal" round position="bottom" :style="{ maxHeight: '70%' }">
      <div class="popup-header">
        <h3 class="popup-title">历史记录</h3>
        <van-button size="small" plain @click="showHistoryModal = false">关闭</van-button>
      </div>
      <div class="popup-body">
        <div v-for="history in providerHistory" :key="history.id" class="history-item" @click="applyHistory(history.id)">
          <div class="history-info">
            <h4 class="font-medium">{{ history.provider }}</h4>
            <p class="text-sm text-secondary">{{ formatDate(history.createdAt) }}</p>
          </div>
          <div class="flex gap-2">
            <van-button size="small" type="primary" @click.stop="applyHistory(history.id)">应用</van-button>
            <van-button size="small" type="danger" plain @click.stop="deleteHistory(history.id)">删除</van-button>
          </div>
        </div>
        <van-empty v-if="providerHistory.length === 0" description="暂无历史记录" />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDegWasm } from '@/composables/useDegWasm'
import { useSharedProvider } from '@/composables/useSharedProvider'
import { yamlConfigService } from '@/services/yaml-config-service'
import ProviderSelector from '@/components/ProviderSelector.vue'
import YamlConfigEditor from '@/components/YamlConfigEditor.vue'
import RuleListViewer from '@/components/RuleListViewer.vue'
import { providers } from '@/data/providers'
import type { ProviderType } from '@/types/provider'

const route = useRoute()
const router = useRouter()
const deg = useDegWasm()
const { sharedProvider, setSharedProvider } = useSharedProvider()

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
  setSharedProvider(provider)
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
    await deg.updateConfig(validation.config!, selectedProvider.value)

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

// 从 URL 或跨页共享状态初始化 Provider
const initFromRoute = () => {
  const providerParam = route.query.provider as string
  const list = supportedProviders.value
  if (providerParam && list.some(p => p.type === providerParam)) {
    setProvider(providerParam)
  } else if (sharedProvider.value && list.some(p => p.type === sharedProvider.value)) {
    setProvider(sharedProvider.value!)
  } else if (list.length > 0 && !selectedProvider.value) {
    setProvider(list[0].type)
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

<style scoped>
.page-rule {
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
.text-gray-900 {
  color: #1f2937;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--van-gray-2, #ebedf0);
}
.popup-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.popup-body {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--van-gray-1, #f7f8fa);
}
.history-info {
  flex: 1;
}
</style>
