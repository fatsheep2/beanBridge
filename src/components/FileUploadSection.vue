<template>
  <n-upload
    :file-list="fileList"
    :accept="'.csv,.xls,.xlsx'"
    :max="1"
    @change="handleFileChange"
    @remove="handleRemove"
    :show-file-list="false"
  >
    <n-upload-dragger>
      <div class="flex flex-col items-center py-8">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-lg font-medium mb-2">点击或拖拽文件到此处上传</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          支持的文件格式: CSV, XLS, XLSX
        </p>
      </div>
    </n-upload-dragger>
  </n-upload>
  
  <n-card v-if="selectedFile" class="mt-4">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium mb-1">
          <svg class="w-4 h-4 inline mr-1 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ selectedFile.name }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          大小: {{ formatFileSize(selectedFile.size) }}
        </p>
      </div>
      <n-button quaternary circle @click="clearFile" type="error">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </template>
      </n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NUpload, NUploadDragger, NCard, NButton, type UploadFileInfo } from 'naive-ui';

interface Props {
  selectedFile: File | null;
  detectedProvider: string | null;
}

interface Emits {
  (e: 'file-selected', file: File | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileList = computed(() => {
  if (props.selectedFile) {
    return [{
      id: '1',
      name: props.selectedFile.name,
      status: 'finished' as const,
      file: props.selectedFile,
    }];
  }
  return [];
});

const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  const file = options.fileList[0]?.file;
  if (file) {
    emit('file-selected', file as File);
  } else {
    emit('file-selected', null);
  }
};

const handleRemove = () => {
  emit('file-selected', null);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const clearFile = () => {
  emit('file-selected', null);
};
</script> 