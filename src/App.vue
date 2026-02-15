<template>
  <div id="app" class="min-h-screen">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

function applyDataTheme(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }
}

onMounted(() => {
  applyDataTheme(isDark.value)
})
watch(isDark, applyDataTheme, { immediate: true })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
