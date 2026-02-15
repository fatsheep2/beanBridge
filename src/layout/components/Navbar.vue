<template>
  <div class="navbar">
    <van-button plain round class="hamburger" @click="toggleSidebar">
      <span class="hamburger-icon" :class="{ collapsed: sidebarCollapsed }">☰</span>
    </van-button>
    <div class="breadcrumb">
      <span class="breadcrumb-title">{{ currentTitle }}</span>
    </div>
    <div class="right-menu">
      <van-button plain round @click="toggleTheme" title="主题切换">
        <span v-if="isDark">🌙</span>
        <span v-else>☀️</span>
      </van-button>
      <a
        href="https://github.com/fatsheep2/beanBridge"
        target="_blank"
        rel="noopener noreferrer"
        class="right-menu-item"
        title="GitHub"
      >
        <span>GitHub</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const props = defineProps<{
  sidebarCollapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const currentTitle = computed(() => {
  const meta = route.meta?.title as string | undefined
  if (meta) return meta
  if (route.path === '/') return '首页'
  if (route.path === '/bill-processing') return '账单处理'
  if (route.path === '/rule-config') return '规则配置'
  return 'BeanBridge'
})

function toggleSidebar() {
  emit('toggle-sidebar')
}
</script>

<style scoped>
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
}
.hamburger {
  margin-right: 12px;
}
.hamburger-icon {
  font-size: 18px;
  display: inline-block;
  transition: transform 0.2s;
}
.breadcrumb {
  flex: 1;
  overflow: hidden;
}
.breadcrumb-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color);
}
.right-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}
.right-menu-item {
  padding: 6px 12px;
  font-size: 14px;
  color: var(--n-text-color-2);
  text-decoration: none;
  border-radius: 6px;
}
.right-menu-item:hover {
  background: var(--n-color-hover);
  color: var(--n-text-color);
}
</style>
