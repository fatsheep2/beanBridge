<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>