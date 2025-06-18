<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-4">文件上传</h2>
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept=".csv"
        class="hidden"
      />
      <button
        @click="() => fileInput?.click()"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        选择文件
      </button>
      <p class="mt-2 text-gray-600">
        支持的文件格式: CSV
      </p>
    </div>
    
    <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded">
      <p><strong>文件名:</strong> {{ selectedFile.name }}</p>
      <p><strong>大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
      <p v-if="detectedProvider"><strong>检测到的解析器:</strong> {{ detectedProvider }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  selectedFile: File | null;
  detectedProvider: string | null;
}

interface Emits {
  (e: 'file-selected', file: File): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    emit('file-selected', target.files[0]);
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script> 