<template>
  <div v-if="!fontAwesomeLoaded" class="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
    <div class="flex items-center">
      <span class="mr-2">⚠️</span>
      <span>Font Awesome 加载失败，使用备用图标</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const fontAwesomeLoaded = ref(true);

onMounted(() => {
  // 检测Font Awesome是否加载成功
  const testElement = document.createElement('i');
  testElement.className = 'fas fa-check';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  // 检查计算样式
  const computedStyle = window.getComputedStyle(testElement, '::before');
  const content = computedStyle.content;
  
  // 如果content为空或为none，说明Font Awesome没有加载
  if (!content || content === 'none' || content === 'normal') {
    fontAwesomeLoaded.value = false;
    console.warn('Font Awesome 加载失败，使用备用图标');
  }
  
  document.body.removeChild(testElement);
});
</script> 