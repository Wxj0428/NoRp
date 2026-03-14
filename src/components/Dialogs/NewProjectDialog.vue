<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-white text-lg font-semibold">新建项目</h2>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Project Name -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">项目名称</label>
          <input
            v-model="projectName"
            type="text"
            placeholder="输入项目名称"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Canvas Size -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">画布尺寸</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="preset in canvasPresets"
              :key="preset.name"
              @click="canvasSize = preset.size"
              :class="[
                'px-3 py-2 rounded border text-sm transition',
                canvasSize.width === preset.size.width && canvasSize.height === preset.size.height
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
              ]"
            >
              {{ preset.name }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label class="text-xs text-gray-500">宽度 (px)</label>
              <input
                v-model.number="canvasSize.width"
                type="number"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">高度 (px)</label>
              <input
                v-model.number="canvasSize.height"
                type="number"
                class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Background Color -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">背景颜色</label>
          <div class="flex items-center gap-2">
            <input
              v-model="backgroundColor"
              type="color"
              class="w-10 h-10 rounded cursor-pointer"
            />
            <input
              v-model="backgroundColor"
              type="text"
              class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <!-- Template Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">项目模板</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="template in templates"
              :key="template.id"
              @click="selectedTemplate = template.id"
              :class="[
                'p-3 rounded border text-left transition',
                selectedTemplate === template.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
              ]"
            >
              <div class="font-medium">{{ template.name }}</div>
              <div class="text-xs opacity-70 mt-1">{{ template.description }}</div>
            </button>
          </div>
        </div>

        <!-- AI Settings -->
        <div class="p-3 bg-gray-900 rounded border border-gray-700">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="enableAI"
              type="checkbox"
              class="w-4 h-4 rounded"
            />
            <span class="text-sm text-gray-300">启用 AI 辅助（需要配置 API Key）</span>
          </label>
          <p class="text-xs text-gray-500 mt-1 ml-6">创建项目后可在 AI 设置中配置</p>
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
          @click="handleCreate"
          :disabled="!projectName.trim()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          创建项目
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  create: [config: ProjectConfig];
  cancel: []
}>();

interface CanvasSize {
  width: number;
  height: number;
}

interface ProjectConfig {
  name: string;
  canvasSize: CanvasSize;
  backgroundColor: string;
  template: string;
  enableAI: boolean;
}

const projectName = ref('未命名项目');
const canvasSize = ref<CanvasSize>({ width: 1200, height: 800 });
const backgroundColor = ref('#ffffff');
const selectedTemplate = ref('blank');
const enableAI = ref(false);

const canvasPresets = [
  { name: '桌面', size: { width: 1200, height: 800 } },
  { name: '平板', size: { width: 768, height: 1024 } },
  { name: '手机', size: { width: 375, height: 667 } }
];

const templates = [
  { id: 'blank', name: '空白项目', description: '从零开始创建' },
  { id: 'landing', name: '落地页', description: '包含 Hero、特性、CTA 等' },
  { id: 'dashboard', name: '管理后台', description: '包含侧边栏、表格、图表' },
  { id: 'portfolio', name: '作品集', description: '展示个人作品' }
];

function handleCreate() {
  const config: ProjectConfig = {
    name: projectName.value.trim(),
    canvasSize: canvasSize.value,
    backgroundColor: backgroundColor.value,
    template: selectedTemplate.value,
    enableAI: enableAI.value
  };
  emit('create', config);
}
</script>
