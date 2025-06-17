<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">功能测试页面</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 数据源选择器测试 -->
      <div class="bg-white border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">数据源选择器</h2>
        <DataSourceSelector
          :onDataSourceSelected="handleDataSourceSelected"
          :onEditConfig="handleEditConfig"
        />
      </div>
      
      <!-- 规则配置编辑器测试 -->
      <div class="bg-white border rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">规则配置编辑器</h2>
        <RuleConfigEditor
          :dataSource="selectedDataSource"
          :fileContent="testFileContent"
        />
      </div>
    </div>
    
    <!-- 测试结果显示 -->
    <div class="mt-6 bg-white border rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">测试结果</h2>
      <div class="space-y-2">
        <p><strong>选中的数据源:</strong> {{ selectedDataSource?.name || '无' }}</p>
        <p><strong>数据源ID:</strong> {{ selectedDataSource?.id || '无' }}</p>
        <p><strong>数据源描述:</strong> {{ selectedDataSource?.description || '无' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataSourceSelector from './DataSourceSelector.vue';
import RuleConfigEditor from './RuleConfigEditor.vue';
import type { DataSource } from '../types/data-source';

const selectedDataSource = ref<DataSource | null>(null);

const testFileContent = `日期,金额,描述,分类
2023-06-01,100.00,购物,消费
2023-06-02,-50.00,退款,收入
2023-06-03,200.00,工资,收入`;

const handleDataSourceSelected = (source: DataSource) => {
  selectedDataSource.value = source;
  console.log('选中的数据源:', source);
};

const handleEditConfig = (sourceId: string) => {
  console.log('编辑配置:', sourceId);
};
</script> 