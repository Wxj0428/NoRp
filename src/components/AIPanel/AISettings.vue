<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 class="text-white text-lg font-semibold">AI 设置</h2>
        <button @click="$emit('close')" class="p-1 hover:bg-gray-700 rounded">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Provider Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">AI 提供商</label>
          <select
            v-model="localConfig.provider"
            @change="handleProviderChange"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT-4/GPT-3.5)</option>
            <option value="local">Local Model (Ollama)</option>
            <option value="custom">Custom API</option>
          </select>
        </div>

        <!-- API Key -->
        <div v-if="localConfig.provider !== 'local'">
          <label class="block text-sm font-medium text-gray-300 mb-2">API 密钥</label>
          <div class="relative">
            <input
              v-model="localConfig.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="请输入您的 API 密钥"
              class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white pr-10"
            />
            <button
              @click="showApiKey = !showApiKey"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
            >
              <svg v-if="showApiKey" class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="localConfig.provider === 'claude'" class="text-xs text-gray-500 mt-1">
            从 <a href="https://console.anthropic.com" target="_blank" class="text-blue-400 hover:underline">console.anthropic.com</a> 获取 API 密钥
          </p>
          <p v-else-if="localConfig.provider === 'openai'" class="text-xs text-gray-500 mt-1">
            从 <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-400 hover:underline">platform.openai.com</a> 获取 API 密钥
          </p>
        </div>

        <!-- Base URL (for custom/local) -->
        <div v-if="localConfig.provider === 'local' || localConfig.provider === 'custom'">
          <label class="block text-sm font-medium text-gray-300 mb-2">服务器地址</label>
          <input
            v-model="localConfig.baseURL"
            :placeholder="localConfig.provider === 'local' ? 'http://localhost:11434' : 'https://api.example.com'"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />
          <p v-if="localConfig.provider === 'local'" class="text-xs text-gray-500 mt-1">
            默认 Ollama 地址: http://localhost:11434
          </p>
        </div>

        <!-- Model Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">模型</label>
          <input
            v-model="localConfig.model"
            :placeholder="getDefaultModel()"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ getModelDescription() }}
          </p>
        </div>

        <!-- Temperature -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            温度: {{ localConfig.temperature }}
          </label>
          <input
            v-model.number="localConfig.temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>精确 (0)</span>
            <span>创造性 (1)</span>
          </div>
        </div>

        <!-- Max Tokens -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">最大令牌数</label>
          <input
            v-model.number="localConfig.maxTokens"
            type="number"
            min="100"
            max="32000"
            step="100"
            class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>

        <!-- Status -->
        <div v-if="error" class="p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded">
          <p class="text-sm text-red-300">{{ error }}</p>
        </div>

        <div v-else-if="localConfig.apiKey" class="p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded">
          <p class="text-sm text-green-300">✓ 配置就绪</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 flex justify-end gap-2">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
        >
          取消
        </button>
        <button
          @click="saveSettings"
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
import { useAIStore } from '@/stores/ai';
import type { AIServiceConfig } from '@/types';

const emit = defineEmits<{
  close: []
}>();

const aiStore = useAIStore();

const localConfig = ref<AIServiceConfig>({
  provider: 'claude',
  apiKey: '',
  baseURL: '',
  model: '',
  temperature: 0.7,
  maxTokens: 4096
});

const showApiKey = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  aiStore.loadConfig();
  localConfig.value = { ...aiStore.config };
});

function handleProviderChange() {
  // Reset model to default when provider changes
  localConfig.value.model = '';
  error.value = null;
}

function getDefaultModel(): string {
  const defaults: Record<string, string> = {
    claude: 'claude-3-5-sonnet-20241022',
    openai: 'gpt-4',
    local: 'llama2',
    custom: 'custom-model'
  };
  return defaults[localConfig.value.provider] || '';
}

function getModelDescription(): string {
  const descriptions: Record<string, string> = {
    claude: '推荐：claude-3-5-sonnet-20241022 或 claude-3-opus-20240229',
    openai: '推荐：gpt-4 或 gpt-3.5-turbo',
    local: '输入您的 Ollama 模型名称（例如：llama2, mistral）',
    custom: '输入您的自定义 API 模型名称'
  };
  return descriptions[localConfig.value.provider] || '';
}

function saveSettings() {
  // 验证
  if (localConfig.value.provider !== 'local' && !localConfig.value.apiKey) {
    error.value = '请输入 API 密钥';
    return;
  }

  if (localConfig.value.provider === 'local' && !localConfig.value.baseURL) {
    localConfig.value.baseURL = 'http://localhost:11434';
  }

  // 如果未指定模型，使用默认模型
  if (!localConfig.value.model) {
    localConfig.value.model = getDefaultModel();
  }

  aiStore.saveConfig(localConfig.value);
  error.value = null;

  // 触发关闭事件
  emit('close');
}
</script>
