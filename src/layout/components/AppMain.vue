<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-main {
  min-height: calc(100vh - 50px);
  padding: 16px;
  background: var(--n-color);
}
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity 0.2s ease;
}
.fade-transform-enter-from,
.fade-transform-leave-to {
  opacity: 0;
}
</style>
