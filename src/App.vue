<template>
  <div id="app" class="min-h-screen flex flex-col font-sans antialiased bg-gray-50 dark:bg-gray-900">
    <FontAwesomeChecker />
    <AppHeader />
    <div class="fixed top-4 right-4 z-50">
      <button @click="toggleDark" class="rounded-full bg-white/80 dark:bg-gray-800/80 shadow px-4 py-2 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
        <span v-if="isDark">🌙 深色</span>
        <span v-else>☀️ 浅色</span>
      </button>
    </div>
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import FontAwesomeChecker from './components/FontAwesomeChecker.vue';

const isDark = ref(false);

function setHtmlDarkClass(val: boolean) {
  const html = document.documentElement;
  if (val) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

function toggleDark() {
  isDark.value = !isDark.value;
  setHtmlDarkClass(isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

onMounted(() => {
  // 初始化主题
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    isDark.value = true;
    setHtmlDarkClass(true);
  } else if (saved === 'light') {
    isDark.value = false;
    setHtmlDarkClass(false);
  } else {
    // 跟随系统
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setHtmlDarkClass(isDark.value);
  }
});
</script>