<template>
  <div class="app-layout">
    <van-nav-bar
      :title="pageTitle"
      fixed
      placeholder
      safe-area-inset-top
    >
      <template #right>
        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDark ? '切换到浅色' : '切换到深色'"
          @click="toggleTheme"
        >
          <span v-if="isDark" class="theme-icon">🌙</span>
          <span v-else class="theme-icon">☀️</span>
        </button>
      </template>
    </van-nav-bar>
    <main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <van-tabbar v-model="activeTab" fixed placeholder safe-area-inset-bottom @change="onTabChange">
      <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item name="bill-processing" icon="notes-o">账单处理</van-tabbar-item>
      <van-tabbar-item name="rule-config" icon="setting-o">规则配置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSharedProvider } from '@/composables/useSharedProvider'

const route = useRoute()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { sharedProvider } = useSharedProvider()

const tabNameMap: Record<string, string> = {
  home: 'home',
  'bill-processing': 'bill-processing',
  'rule-config': 'rule-config',
}

const activeTab = computed({
  get() {
    const name = route.name as string
    return tabNameMap[name] ?? 'home'
  },
  set(_v: string) {}
})

const pageTitle = computed(() => (route.meta?.title as string) ?? 'BeanBridge')

function onTabChange(name: string) {
  const path = name === 'home' ? '/' : `/${name}`
  if (route.path !== path) {
    if ((name === 'bill-processing' || name === 'rule-config') && sharedProvider.value) {
      router.push({ path, query: { provider: sharedProvider.value } })
    } else {
      router.push(path)
    }
  }
}

watch(
  () => route.path,
  () => {}
)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--van-gray-1, #f7f8fa);
}
.layout-main {
  flex: 1;
  padding: var(--van-padding-md, 14px);
  padding-bottom: calc(var(--van-tabbar-height, 56px) + 16px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.theme-toggle {
  padding: 4px 8px;
  margin: 0 -4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  opacity: 0.85;
}
.theme-toggle:hover {
  opacity: 1;
}
.theme-icon {
  display: block;
}
</style>
