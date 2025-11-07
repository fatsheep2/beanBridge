<template>
  <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept=".csv,.xls,.xlsx"
        class="hidden"
        multiple
      />
      <div class="flex flex-col items-center">
        <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">cloud_upload</span>
        <button
          @click="() => fileInput?.click()"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all mb-3"
        >
          <span class="material-icons mr-2">folder_open</span>
          选择文件
        </button>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          支持的文件格式: CSV, XLS, XLSX
        </p>
      </div>
    </div>
    
    <div v-if="selectedFile" class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            <span class="material-icons text-sm mr-1 align-middle">description</span>
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            大小: {{ formatFileSize(selectedFile.size) }}
          </p>
          <p v-if="detectedProvider" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            检测到的解析器: {{ detectedProvider }}
          </p>
        </div>
        <button
          @click="clearFile"
          class="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="清除文件"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
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
  (e: 'file-selected', file: File | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    emit('file-selected', target.files[0]);
  } else {
    emit('file-selected', null);
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const clearFile = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('file-selected', null);
};
</script> 