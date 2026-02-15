<template>
  <div>
    <van-uploader
      :file-list="fileList"
      :max-count="1"
      accept=".csv,.xls,.xlsx"
      :after-read="afterRead"
      @delete="handleRemove"
    >
      <div class="upload-area">
        <van-icon name="upgrade" size="48" color="#c8c9cc" />
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint">支持 CSV, XLS, XLSX</p>
      </div>
    </van-uploader>

    <div v-if="selectedFile" class="file-card">
      <div class="file-info">
        <p class="file-name">{{ selectedFile.name }}</p>
        <p class="file-size">大小: {{ formatFileSize(selectedFile.size) }}</p>
      </div>
      <van-button size="small" type="danger" plain round icon="cross" @click="clearFile" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedFile: File | null
  detectedProvider: string | null
}

interface Emits {
  (e: 'file-selected', file: File | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 不把已选文件放进 uploader 的 file-list，用下方 file-card 单独展示，避免重复预览
const fileList = computed(() => [])

const afterRead = (item: { file: File } | { file: File }[]) => {
  const file = Array.isArray(item) ? item[0]?.file : item?.file
  if (file) emit('file-selected', file)
}

const handleRemove = () => {
  emit('file-selected', null)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const clearFile = () => {
  emit('file-selected', null)
}
</script>

<style scoped>
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--van-gray-1, #f7f8fa);
  border-radius: var(--van-radius-md, 10px);
  border: 1px dashed var(--van-gray-4, #dcdee0);
}
.upload-text {
  font-size: 15px;
  font-weight: 500;
  margin: 12px 0 4px;
  color: #323233;
}
.upload-hint {
  font-size: 12px;
  color: #969799;
}
.file-card {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--van-cell-group-background, #fff);
  border-radius: var(--van-radius-md, 10px);
  border: 1px solid var(--van-gray-2, #ebedf0);
}
.file-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px;
  color: #323233;
}
.file-size {
  font-size: 12px;
  color: #969799;
  margin: 0;
}
</style>
