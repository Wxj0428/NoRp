<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-white text-lg font-semibold">项目设置</h2>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Basic Info -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">基本信息</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">项目名称</label>
              <input
                v-model="settings.name"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">创建时间</label>
                <div class="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 text-sm">
                  {{ formatDate(project.createdAt) }}
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">修改时间</label>
                <div class="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 text-sm">
                  {{ formatDate(project.modifiedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Canvas Settings -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">画布设置</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">画布宽度</label>
                <input
                  v-model.number="settings.canvasWidth"
                  type="number"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">画布高度</label>
                <input
                  v-model.number="settings.canvasHeight"
                  type="number"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">背景颜色</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.backgroundColor"
                  type="color"
                  class="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  v-model="settings.backgroundColor"
                  type="text"
                  class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Grid Settings -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">网格设置</h3>
          <div class="space-y-3">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-gray-300">显示网格</span>
              <input
                v-model="settings.gridEnabled"
                type="checkbox"
                class="w-4 h-4 rounded"
              />
            </label>
            <div v-if="settings.gridEnabled">
              <label class="block text-xs text-gray-500 mb-1">网格大小</label>
              <input
                v-model.number="settings.gridSize"
                type="number"
                min="5"
                max="50"
                step="5"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-gray-300">对齐网格</span>
              <input
                v-model="settings.snapToGrid"
                type="checkbox"
                class="w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>

        <!-- Auto Save -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">自动保存</h3>
          <div class="space-y-3">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-gray-300">启用自动保存</span>
              <input
                v-model="settings.autosave"
                type="checkbox"
                class="w-4 h-4 rounded"
              />
            </label>
            <div v-if="settings.autosave">
              <label class="block text-xs text-gray-500 mb-1">保存间隔（秒）</label>
              <input
                v-model.number="settings.autosaveInterval"
                type="number"
                min="10"
                max="300"
                step="10"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 flex justify-end gap-2">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          取消
        </button>
        <button
          @click="handleSave"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Project } from '@/types';

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  save: [settings: any];
  cancel: []
}>();

const settings = ref({
  name: '',
  canvasWidth: 1200,
  canvasHeight: 800,
  backgroundColor: '#ffffff',
  gridEnabled: true,
  gridSize: 10,
  snapToGrid: true,
  autosave: true,
  autosaveInterval: 30
});

onMounted(() => {
  settings.value = {
    name: props.project.name,
    canvasWidth: 1200,
    canvasHeight: 800,
    backgroundColor: '#ffffff',
    gridEnabled: props.project.settings.gridEnabled,
    gridSize: props.project.settings.gridSize,
    snapToGrid: props.project.settings.snapToGrid,
    autosave: props.project.settings.autosave,
    autosaveInterval: props.project.settings.autosaveInterval / 1000
  };
});

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN');
}

function handleSave() {
  emit('save', {
    ...settings.value,
    autosaveInterval: settings.value.autosaveInterval * 1000
  });
}
</script>
