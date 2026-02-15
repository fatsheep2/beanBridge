<template>
  <div class="app-container home">
    <!-- 欢迎区 -->
    <div class="home-hero">
      <h1 class="hero-title">BeanBridge</h1>
      <p class="hero-desc">将各类账单文件快速转换为 Beancount 格式，支持多种数据源，完全本地化处理</p>
      <div class="hero-actions">
        <van-button type="primary" @click="router.push('/bill-processing')">账单处理</van-button>
        <van-button @click="router.push('/rule-config')">规则配置</van-button>
        <van-button plain type="primary" href="https://deb-sig.github.io/double-entry-generator/" target="_blank" rel="noopener noreferrer">
          在线文档
        </van-button>
      </div>
    </div>

    <!-- 隐私提示 -->
    <van-notice-bar
      left-icon="info-o"
      color="#d97706"
      background="#fef3c7"
      class="privacy-alert"
    >
      账本数据非常隐私，建议使用离线版本或本地运行。所有数据处理均在浏览器本地完成，不会上传到服务器。
    </van-notice-bar>

    <!-- 支持的数据源 -->
    <div class="section">
      <h2 class="section-title">支持的数据源</h2>
      <div v-if="isLoading" class="loading-wrap">
        <van-loading size="24px" vertical>加载解析器中...</van-loading>
      </div>
      <ProviderSelector
        v-else
        :supported-providers="supportedProviders"
        :selected-provider="selectedProvider"
        @provider-selected="setProvider"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProviderSelector from '@/components/ProviderSelector.vue'
import { providers } from '@/data/providers'
import type { ProviderType } from '@/types/provider'
import { useDegWasm } from '@/composables/useDegWasm'

const router = useRouter()
const deg = useDegWasm()
const selectedProvider = ref<ProviderType | null>(null)
const isLoading = ref(true)

const supportedProviders = computed(() => {
  const wasmProviders = deg.supportedProviders.value
  return wasmProviders
    .map((providerId) => providers.find((p) => p.type === providerId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
})

function setProvider(providerType: ProviderType) {
  selectedProvider.value = providerType
}

onMounted(async () => {
  if (!deg.isInitialized.value) {
    await deg.init()
  }
  isLoading.value = false
})
</script>

<style scoped>
.app-container.home {
  padding: 0;
  min-height: auto;
}
.home-hero {
  margin-bottom: 20px;
}
.hero-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
}
.hero-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.privacy-alert {
  margin-bottom: 20px;
}
.section {
  margin-top: 24px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
}
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
</style>
