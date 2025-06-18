<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Font Awesome 图标测试</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-4 border rounded">
        <i class="fas fa-arrow-left text-2xl text-blue-600 mb-2"></i>
        <p class="text-sm">fa-arrow-left</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-arrow-right text-2xl text-green-600 mb-2"></i>
        <p class="text-sm">fa-arrow-right</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-file-upload text-2xl text-purple-600 mb-2"></i>
        <p class="text-sm">fa-file-upload</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-cog text-2xl text-orange-600 mb-2"></i>
        <p class="text-sm">fa-cog</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-flask text-2xl text-red-600 mb-2"></i>
        <p class="text-sm">fa-flask</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-rocket text-2xl text-indigo-600 mb-2"></i>
        <p class="text-sm">fa-rocket</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fas fa-check-circle text-2xl text-green-600 mb-2"></i>
        <p class="text-sm">fa-check-circle</p>
      </div>
      
      <div class="text-center p-4 border rounded">
        <i class="fab fa-github text-2xl text-gray-800 mb-2"></i>
        <p class="text-sm">fa-github</p>
      </div>
    </div>
    
    <div class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-semibold mb-2">状态信息：</h3>
      <p>Font Awesome 加载状态: {{ fontAwesomeStatus }}</p>
      <p>备用图标是否激活: {{ fallbackActive ? '是' : '否' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const fontAwesomeStatus = ref('检测中...');
const fallbackActive = ref(false);

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
  
  if (!content || content === 'none' || content === 'normal') {
    fontAwesomeStatus.value = '加载失败 - 使用备用图标';
    fallbackActive.value = true;
  } else {
    fontAwesomeStatus.value = '加载成功';
    fallbackActive.value = false;
  }
  
  document.body.removeChild(testElement);
});
</script> 