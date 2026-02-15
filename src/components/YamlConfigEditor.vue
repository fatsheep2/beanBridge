<template>
  <div class="yaml-config-editor">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h3 class="text-lg font-semibold">YAML 配置编辑器</h3>
      <div class="flex gap-2">
        <van-button @click="formatYaml">格式化</van-button>
        <van-button type="primary" @click="validateYaml">验证</van-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
    >
      <div class="flex items-center">
        <span class="material-icons text-red-600 dark:text-red-400 mr-2">error</span>
        <span class="text-red-800 dark:text-red-200 text-sm">{{ error }}</span>
      </div>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="successMessage"
      class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
    >
      <div class="flex items-center">
        <span class="material-icons text-green-600 dark:text-green-400 mr-2">check_circle</span>
        <span class="text-green-800 dark:text-green-200 text-sm">{{ successMessage }}</span>
      </div>
    </div>

    <!-- YAML 编辑器 -->
    <div class="relative">
      <textarea
        v-model="yamlContent"
        class="yaml-textarea w-full h-96 p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="请输入 YAML 配置..."
        @input="onInput"
      ></textarea>
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50"
      >
        <div class="text-gray-600 dark:text-gray-300">加载中...</div>
      </div>
    </div>

    <!-- 行号提示 -->
    <div class="yaml-footer mt-2 text-xs">
      行数: {{ lineCount }} | 字符数: {{ yamlContent.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { yaml } from '@/utils/yaml'

interface Props {
  modelValue: string
  provider?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'validated', isValid: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const yamlContent = ref(props.modelValue || '')
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isLoading = ref(false)

const lineCount = computed(() => {
  return yamlContent.value.split('\n').length
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== yamlContent.value) {
    yamlContent.value = newValue
  }
})

watch(yamlContent, (newValue) => {
  emit('update:modelValue', newValue)
  error.value = null
  successMessage.value = null
})

const onInput = () => {
  error.value = null
  successMessage.value = null
}

const formatYaml = () => {
  try {
    const parsed = yaml.parse(yamlContent.value)
    yamlContent.value = yaml.stringify(parsed, {
      indent: 2,
      lineWidth: 0,
      minContentWidth: 0
    })
    successMessage.value = '格式化成功'
    setTimeout(() => {
      successMessage.value = null
    }, 2000)
  } catch (err) {
    error.value = `格式化失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

const validateYaml = () => {
  try {
    const parsed = yaml.parse(yamlContent.value)
    
    // 基本验证
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('配置必须是对象格式')
    }

    // 验证必需字段
    if (!parsed.defaultMinusAccount) {
      throw new Error('缺少必需字段: defaultMinusAccount')
    }
    if (!parsed.defaultPlusAccount) {
      throw new Error('缺少必需字段: defaultPlusAccount')
    }
    if (!parsed.defaultCurrency) {
      throw new Error('缺少必需字段: defaultCurrency')
    }

    // 验证 provider 配置
    if (props.provider && parsed[props.provider]) {
      const providerConfig = parsed[props.provider]
      if (providerConfig.rules && !Array.isArray(providerConfig.rules)) {
        throw new Error(`${props.provider}.rules 必须是数组`)
      }
    }

    error.value = null
    successMessage.value = 'YAML 配置验证通过'
    emit('validated', true)
    
    setTimeout(() => {
      successMessage.value = null
    }, 2000)
  } catch (err) {
    error.value = `验证失败: ${err instanceof Error ? err.message : String(err)}`
    emit('validated', false)
  }
}

// 暴露方法供父组件调用
defineExpose({
  formatYaml,
  validateYaml,
  getContent: () => yamlContent.value,
  setContent: (content: string) => {
    yamlContent.value = content
  }
})
</script>

