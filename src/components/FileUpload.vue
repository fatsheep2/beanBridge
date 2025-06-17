<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">上传交易文件</h2>
        <p class="text-gray-600">请上传您的银行对账单、CSV文件或Excel文件，我们将自动转换为Beancount格式</p>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="$emit('prev-step')"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <i class="fas fa-arrow-left mr-2"></i>上一步
        </button>
        <button 
          @click="startUpload"
          :disabled="!uploadedFile"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-arrow-right mr-2"></i>下一步
        </button>
      </div>
    </div>
    
    <div @dragover.prevent="dragOver = true" 
         @dragleave="dragOver = false"
         @drop.prevent="handleDrop"
         :class="{'dropzone active': dragOver, 'dropzone': !dragOver}"
         class="rounded-lg p-8 text-center cursor-pointer mb-6">
      <div class="max-w-md mx-auto">
        <i class="fas fa-cloud-upload-alt text-4xl text-indigo-500 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700 mb-2">拖放文件到此处</h3>
        <p class="text-sm text-gray-500 mb-4">支持CSV、Excel、PDF或银行对账单文件</p>
        <label for="file-upload" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
          <i class="fas fa-folder-open mr-2"></i>
          选择文件
          <input id="file-upload" type="file" class="hidden" @change="handleFileSelect" accept=".csv,.xlsx,.xls,.txt">
        </label>
      </div>
    </div>

    <div v-if="uploadedFile" class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <i class="fas fa-file-alt text-indigo-500 text-xl mr-3"></i>
          <div>
            <p class="font-medium">{{ uploadedFile.name }}</p>
            <p class="text-sm text-gray-500">{{ formatFileSize(uploadedFile.size) }}</p>
          </div>
        </div>
        <button @click="removeFile" class="text-red-500 hover:text-red-700">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- 读取提示弹窗 -->
    <div v-if="isReading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">正在读取文件</h3>
          <p class="text-gray-600">请稍候，正在解析您的账单文件...</p>
        </div>
      </div>
    </div>

    <!-- 错误弹窗 -->
    <div v-if="showError" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-red-800 flex items-center">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            文件解析失败
          </h3>
          <button @click="closeError" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-3">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-medium text-red-800 mb-2">{{ errorInfo.title }}</h4>
            <p class="text-red-700 text-sm mb-2">{{ errorInfo.message }}</p>
            <div v-if="errorInfo.details" class="text-red-600 text-sm">
              <p class="font-medium">详细信息：</p>
              <p class="mt-1">{{ errorInfo.details }}</p>
            </div>
            <div v-if="errorInfo.suggestions && errorInfo.suggestions.length > 0" class="mt-3">
              <p class="font-medium text-red-800">建议解决方案：</p>
              <ul class="list-disc list-inside text-red-700 text-sm mt-1 space-y-1">
                <li v-for="suggestion in errorInfo.suggestions" :key="suggestion">{{ suggestion }}</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-medium text-blue-800 mb-2">支持的文件格式</h4>
            <div class="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div class="flex items-center">
                <i class="fas fa-file-csv mr-2"></i>
                CSV文件 (.csv)
              </div>
              <div class="flex items-center">
                <i class="fas fa-file-excel mr-2"></i>
                Excel文件 (.xlsx, .xls)
              </div>
              <div class="flex items-center">
                <i class="fas fa-file-alt mr-2"></i>
                文本文件 (.txt)
              </div>
              <div class="flex items-center">
                <i class="fas fa-file-pdf mr-2"></i>
                PDF文件 (.pdf)
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6 space-x-3">
          <button @click="closeError" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            关闭
          </button>
          <button @click="retryUpload" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            重新尝试
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <!-- <h3 class="text-lg font-medium text-gray-800 mb-3">常见数据源</h3> -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="source in dataSources" :key="source.id" 
             @click="selectDataSource(source)"
             :class="{'border-indigo-500 bg-indigo-50': selectedDataSource === source.id}"
             class="border rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors">
          <div 
            class="w-16 h-16 mb-2 flex items-center justify-center rounded-lg mx-auto"
            :style="`background-color: ${source.color}20; border: 2px solid ${source.color}40;`"
          >
            <img 
              :src="source.icon" 
              :alt="source.name"
              class="w-10 h-10 object-contain"
              @error="handleImageError"
            />
          </div>
          <p class="text-sm font-medium">{{ source.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileProcessor } from '../utils/file-processor';

interface DataSource {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ErrorInfo {
  title: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

interface Props {
  onFileUploaded: (fileData: any) => void;
}

interface Emits {
  'prev-step': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dragOver = ref(false);
const uploadedFile = ref<File | null>(null);
const selectedDataSource = ref<string | null>(null);
const isReading = ref(false);
const showError = ref(false);
const errorInfo = ref<ErrorInfo>({
  title: '',
  message: '',
  details: '',
  suggestions: []
});

const fileProcessor = new FileProcessor();

const dataSources: DataSource[] = [
  // { id: 'alipay', name: '支付宝', icon: '/src/components/icons/alipay.png', color: '#00a1e9' },
  // { id: 'wechat', name: '微信支付', icon: '/src/components/icons/weixin.png', color: '#07c160' },
  // { id: 'bank', name: '银行对账单', icon: '/src/components/icons/工商银行.png', color: '#6c5ce7' },
  // { id: 'credit', name: '信用卡', icon: '/src/components/icons/中信银行.png', color: '#e84393' },
  // { id: 'csv', name: 'CSV文件', icon: '/src/components/icons/csv.png', color: '#0984e3' },
  // { id: 'excel', name: 'Excel', icon: '/src/components/icons/excel.png', color: '#00b894' },
  // { id: 'pdf', name: 'PDF', icon: '/src/components/icons/pdf.png', color: '#d63031' },
  // { id: 'other', name: '其他格式', icon: '/src/components/icons/file.png', color: '#636e72' }
];

const handleDrop = (e: DragEvent) => {
  dragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    uploadedFile.value = files[0];
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    uploadedFile.value = files[0];
  }
};

const removeFile = () => {
  uploadedFile.value = null;
};

const showErrorDialog = (error: any) => {
  let title = '文件解析失败';
  let message = '无法解析上传的文件';
  let details = '';
  let suggestions: string[] = [];

  // 根据错误类型提供具体的错误信息
  if (error.message) {
    if (error.message.includes('文件格式验证失败')) {
      title = '文件格式不匹配';
      message = '上传的文件格式与选择的数据源不匹配';
      details = error.message;
      suggestions = [
        '请确认选择了正确的数据源',
        '检查文件是否来自对应的银行或支付平台',
        '确保文件包含必要的字段（如交易时间、金额等）',
        '尝试重新导出账单文件'
      ];
    } else if (error.message.includes('文件结构无效')) {
      title = '文件结构错误';
      message = '文件格式不正确或已损坏';
      details = error.message;
      suggestions = [
        '检查文件是否完整下载',
        '尝试重新导出文件',
        '确保文件没有被其他程序占用',
        '检查文件编码格式（建议使用UTF-8）'
      ];
    } else if (error.message.includes('文件为空')) {
      title = '文件内容为空';
      message = '上传的文件没有包含任何数据';
      details = error.message;
      suggestions = [
        '检查文件是否包含交易记录',
        '确认导出时间范围是否正确',
        '尝试选择不同的时间范围重新导出',
        '检查原始数据源是否有交易记录'
      ];
    } else if (error.message.includes('编码')) {
      title = '文件编码问题';
      message = '文件编码格式不支持';
      details = error.message;
      suggestions = [
        '将文件另存为UTF-8编码格式',
        '使用记事本打开并另存为UTF-8格式',
        '检查原始导出设置中的编码选项',
        '尝试使用不同的导出工具'
      ];
    } else {
      message = error.message;
      suggestions = [
        '检查文件格式是否正确',
        '确认文件没有被损坏',
        '尝试使用不同的文件',
        '联系技术支持获取帮助'
      ];
    }
  }

  errorInfo.value = { title, message, details, suggestions };
  showError.value = true;
};

const closeError = () => {
  showError.value = false;
};

const retryUpload = () => {
  closeError();
  if (uploadedFile.value) {
    startUpload();
  }
};

const startUpload = async () => {
  if (!uploadedFile.value) return;
  
  isReading.value = true;
  
  try {
    const fileData = await fileProcessor.parseFile(uploadedFile.value);
    
    props.onFileUploaded(fileData);
  } catch (error) {
    console.error('文件解析失败:', error);
    showErrorDialog(error);
  } finally {
    isReading.value = false;
  }
};

const formatFileSize = (bytes: number): string => {
  return fileProcessor.formatFileSize(bytes);
};

const selectDataSource = (source: DataSource) => {
  selectedDataSource.value = source.id;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 当图片加载失败时，使用SVG默认图标
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    parent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10" style="color: ${parent.style.borderColor || '#666'}">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `;
  }
};
</script>

<style scoped>
.dropzone {
  border: 2px dashed #cbd5e0;
  transition: all 0.3s ease;
}
.dropzone.active {
  border-color: #4f46e5;
  background-color: #eef2ff;
}
</style> 