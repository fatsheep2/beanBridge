<template>
  <div class="sidebar-container">
    <div class="logo-area" :class="{ collapsed: sidebarCollapsed }">
      <img v-if="!sidebarCollapsed" src="/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
      <span v-if="!sidebarCollapsed" class="logo-title">BeanBridge</span>
      <span v-else class="logo-title-short">BB</span>
    </div>
    <nav class="menu-scroll">
      <a
        v-for="item in menuOptions"
        :key="item.key"
        :href="item.key === '/' ? '/' : item.key"
        class="menu-label-link"
        @click.prevent="go(item.key)"
      >
        {{ item.label }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  collapsed: boolean
}>()

const sidebarCollapsed = computed(() => props.collapsed)
const route = useRoute()
const router = useRouter()

const menuOptions = [
  { label: '首页', key: '/' },
  { label: '账单处理', key: '/bill-processing' },
  { label: '规则配置', key: '/rule-config' },
]

function go(path: string) {
  const p = path === '/' ? '/' : path
  if (p !== (route.path || '/')) router.push(p)
}
</script>

<style scoped>
.menu-scroll {
  overflow-y: auto;
  padding: 8px 0;
}
.menu-label-link {
  display: block;
  padding: 10px 16px;
  color: inherit;
  text-decoration: none;
}
.menu-label-link:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
