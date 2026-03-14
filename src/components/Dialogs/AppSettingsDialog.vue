<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg shadow-xl w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header with tabs -->
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-white text-lg font-semibold mb-4">应用设置</h2>
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded text-sm transition',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- General Tab -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">界面</h3>
            <div class="space-y-3">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-gray-300">暗色主题</span>
                <input
                  v-model="localSettings.darkMode"
                  type="checkbox"
                  class="w-4 h-4 rounded"
                />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-gray-300">显示标尺</span>
                <input
                  v-model="localSettings.showRulers"
                  type="checkbox"
                  class="w-4 h-4 rounded"
                />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-gray-300">显示辅助线</span>
                <input
                  v-model="localSettings.showGuides"
                  type="checkbox"
                  class="w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">编辑器</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">默认缩放</label>
                <select
                  v-model.number="localSettings.defaultZoom"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option :value="0.5">50%</option>
                  <option :value="0.75">75%</option>
                  <option :value="1">100%</option>
                  <option :value="1.25">125%</option>
                  <option :value="1.5">150%</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">项目</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">默认项目位置</label>
                <input
                  v-model="localSettings.defaultProjectPath"
                  type="text"
                  placeholder="留空使用系统默认"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-gray-300">自动创建备份</span>
                <input
                  v-model="localSettings.autoBackup"
                  type="checkbox"
                  class="w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- AI Tab -->
        <div v-if="activeTab === 'ai'" class="space-y-6">
          <div class="p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🤖</span>
              <div>
                <h4 class="text-white font-medium">AI 配置</h4>
                <p class="text-sm text-gray-400 mt-1">点击顶部"AI 设置"按钮配置 AI 服务</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">生成设置</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">默认 AI 提供商</label>
                <select
                  v-model="localSettings.defaultAIProvider"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="openai">OpenAI</option>
                  <option value="local">本地模型</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">最大 Token 数</label>
                <input
                  v-model.number="localSettings.maxTokens"
                  type="number"
                  min="1000"
                  max="32000"
                  step="1000"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">温度</label>
                <input
                  v-model.number="localSettings.temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Shortcuts Tab -->
        <div v-if="activeTab === 'shortcuts'" class="space-y-4">
          <div
            v-for="category in shortcutCategories"
            :key="category.name"
            class="space-y-2"
          >
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">{{ category.name }}</h3>
            <div
              v-for="(shortcut, index) in category.shortcuts"
              :key="index"
              class="flex items-center justify-between bg-gray-900 rounded px-3 py-2"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-300">{{ shortcut.description }}</span>
              </div>
              <div class="flex items-center gap-2">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400"
                >
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
            <p class="text-xs text-gray-500">
              💡 提示：快捷键将在下一版本支持自定义
            </p>
          </div>
        </div>

        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="space-y-6">
          <div class="text-center">
            <div class="text-6xl mb-4">🎨</div>
            <h2 class="text-2xl font-bold text-white mb-2">NoRp UI 设计器</h2>
            <p class="text-gray-400">版本 0.1.0</p>
          </div>

          <div class="bg-gray-900 rounded p-4 space-y-2">
            <h3 class="text-sm font-semibold text-gray-400">功能特性</h3>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>✨ AI 驱动的 UI 生成</li>
              <li>🎨 可视化拖拽编辑</li>
              <li>📦 30+ 预设组件</li>
              <li>💾 项目保存和导出</li>
              <li>⌨️ 丰富的快捷键</li>
            </ul>
          </div>

          <div class="bg-gray-900 rounded p-4 space-y-2">
            <h3 class="text-sm font-semibold text-gray-400">技术栈</h3>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Electron</span>
              <span class="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Vue 3</span>
              <span class="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">TypeScript</span>
              <span class="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Vite</span>
              <span class="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">Pinia</span>
            </div>
          </div>

          <div class="text-center text-sm text-gray-500">
            <p>© 2024 NoRp Team. All rights reserved.</p>
            <p class="mt-2">
              <a href="https://github.com/norp" target="_blank" class="text-blue-400 hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 flex justify-end gap-2">
        <button
          @click="handleReset"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          重置默认
        </button>
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
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const emit = defineEmits<{
  save: [settings: any];
  cancel: []
}>();

const activeTab = ref('general');

const tabs = [
  { id: 'general', name: '常规' },
  { id: 'ai', name: 'AI' },
  { id: 'shortcuts', name: '快捷键' },
  { id: 'about', name: '关于' }
];

const localSettings = ref({
  darkMode: true,
  showRulers: true,
  showGuides: true,
  defaultZoom: 1,
  defaultProjectPath: '',
  autoBackup: true,
  defaultAIProvider: 'claude',
  maxTokens: 4096,
  temperature: 0.7
});

const shortcutCategories = [
  {
    name: '文件操作',
    shortcuts: [
      { description: '新建项目', keys: ['Ctrl', 'N'] },
      { description: '打开项目', keys: ['Ctrl', 'O'] },
      { description: '保存项目', keys: ['Ctrl', 'S'] },
      { description: '导出 HTML', keys: ['Ctrl', 'E'] }
    ]
  },
  {
    name: '编辑操作',
    shortcuts: [
      { description: '撤销', keys: ['Ctrl', 'Z'] },
      { description: '重做', keys: ['Ctrl', 'Shift', 'Z'] },
      { description: '复制', keys: ['Ctrl', 'C'] },
      { description: '粘贴', keys: ['Ctrl', 'V'] },
      { description: '剪切', keys: ['Ctrl', 'X'] },
      { description: '删除', keys: ['Delete'] }
    ]
  },
  {
    name: '画布操作',
    shortcuts: [
      { description: '放大', keys: ['Ctrl', '+'] },
      { description: '缩小', keys: ['Ctrl', '-'] },
      { description: '重置缩放', keys: ['Ctrl', '0'] }
    ]
  }
];

onMounted(() => {
  // Load settings from localStorage
  const saved = localStorage.getItem('norp-app-settings');
  if (saved) {
    try {
      localSettings.value = { ...localSettings.value, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load app settings:', e);
    }
  }
});

function handleSave() {
  localStorage.setItem('norp-app-settings', JSON.stringify(localSettings.value));
  emit('save', localSettings.value);
}

function handleReset() {
  if (confirm('确定要重置为默认设置吗？')) {
    localSettings.value = {
      darkMode: true,
      showRulers: true,
      showGuides: true,
      defaultZoom: 1,
      defaultProjectPath: '',
      autoBackup: true,
      defaultAIProvider: 'claude',
      maxTokens: 4096,
      temperature: 0.7
    };
  }
}
</script>
