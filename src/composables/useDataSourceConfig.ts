import { ref, computed } from 'vue';
import { FileProcessorV2 } from '../utils/file-processor-v2';
import type { ProviderConfig } from '../types/provider';
import { ProviderType } from '../types/provider';
import { useConfigStorage } from './useConfigStorage';
import { mockAlipayFile, mockWechatFile } from '../utils/test-data';
import { providers } from '../data/providers';

export function useDataSourceConfig() {
  const fileProcessor = new FileProcessorV2();
  const { currentConfig, currentProvider, loadConfig, updateConfig } = useConfigStorage();
  
  const selectedFile = ref<File | null>(null);
  const detectedProvider = ref<ProviderType | null>(null);
  const isProcessing = ref(false);
  const processingResult = ref<any>(null);
  const error = ref<string | null>(null);

  const supportedProviders = computed(() => {
    return providers;
  });

  const selectedProvider = computed(() => {
    return detectedProvider.value || (currentProvider.value as ProviderType);
  });

  const canProcess = computed(() => {
    return selectedFile.value && selectedProvider.value && !isProcessing.value;
  });

  const handleFileSelect = async (file: File) => {
    selectedFile.value = file;
    error.value = null;
    processingResult.value = null;

    try {
      // 自动检测解析器类型
      const detected = await fileProcessor.detectProvider(file);
      detectedProvider.value = detected;
      
      if (detected) {
        loadConfig(detected);
      }
    } catch (err) {
      console.error('文件检测失败:', err);
      error.value = '文件检测失败';
    }
  };

  const setProvider = (provider: ProviderType) => {
    detectedProvider.value = provider;
    loadConfig(provider);
  };

  const validateFile = () => {
    if (!selectedFile.value || !selectedProvider.value) {
      return { valid: false, error: '请选择文件和解析器' };
    }

    return fileProcessor.validateFile(selectedFile.value, selectedProvider.value);
  };

  const processFile = async () => {
    if (!selectedFile.value || !selectedProvider.value) {
      error.value = '请选择文件和解析器';
      return;
    }

    const validation = validateFile();
    if (!validation.valid) {
      error.value = validation.error || '文件验证失败';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      const result = await fileProcessor.processFile(
        selectedFile.value,
        selectedProvider.value,
        currentConfig.value || undefined
      );

      if (result.success) {
        processingResult.value = result;
      } else {
        error.value = result.error || '处理失败';
      }
    } catch (err) {
      console.error('文件处理失败:', err);
      error.value = '文件处理失败';
    } finally {
      isProcessing.value = false;
    }
  };

  const previewFile = async () => {
    if (!selectedFile.value || !selectedProvider.value) {
      error.value = '请选择文件和解析器';
      return;
    }

    isProcessing.value = true;
    error.value = null;

    try {
      const result = await fileProcessor.previewFile(
        selectedFile.value,
        selectedProvider.value
      );

      if (result.success) {
        processingResult.value = result;
      } else {
        error.value = result.error || '预览失败';
      }
    } catch (err) {
      console.error('文件预览失败:', err);
      error.value = '文件预览失败';
    } finally {
      isProcessing.value = false;
    }
  };

  const downloadResult = (filename?: string) => {
    if (!processingResult.value?.data) {
      error.value = '没有可下载的数据';
      return;
    }

    const blob = new Blob([processingResult.value.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `beancount_${new Date().toISOString().split('T')[0]}.beancount`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const reset = () => {
    selectedFile.value = null;
    detectedProvider.value = null;
    isProcessing.value = false;
    processingResult.value = null;
    error.value = null;
  };

  return {
    // 状态
    selectedFile,
    detectedProvider,
    selectedProvider,
    isProcessing,
    processingResult,
    error,
    supportedProviders,
    canProcess,

    // 方法
    handleFileSelect,
    setProvider,
    validateFile,
    processFile,
    previewFile,
    downloadResult,
    reset
  };
} 