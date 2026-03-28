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

        <!-- Skills Management -->
        <div class="border-t border-gray-700 pt-4">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-300">Skills 管理</label>
            <button
              @click="showAddSkill = !showAddSkill"
              class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              {{ showAddSkill ? '收起' : '+ 添加 Skill' }}
            </button>
          </div>

          <!-- Add Skill Form -->
          <div v-if="showAddSkill" class="mb-3 p-3 bg-gray-900 rounded space-y-2">
            <div class="flex gap-2">
              <input
                v-model="newSkill.icon"
                placeholder="图标"
                class="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-blue-500"
              />
              <input
                v-model="newSkill.name"
                placeholder="Skill 名称"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              v-model="newSkill.systemPrompt"
              placeholder="系统提示词 — 定义 AI 的专业知识和能力（这是 Skill 的核心，描述越详细 AI 表现越好）"
              rows="5"
              class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
            ></textarea>
            <button
              @click="addSkill"
              :disabled="!newSkill.name.trim() || !newSkill.systemPrompt.trim()"
              class="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition"
            >
              确认添加
            </button>
          </div>

          <!-- Skills List -->
          <div class="space-y-1.5">
            <div
              v-for="skill in aiStore.skills"
              :key="skill.id"
              class="flex items-center justify-between px-3 py-2 bg-gray-900 rounded"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="text-lg">{{ skill.icon }}</span>
                <div class="min-w-0">
                  <div class="text-sm text-white truncate">{{ skill.name }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ skill.systemPrompt.substring(0, 60) }}...</div>
                </div>
              </div>
              <button
                v-if="!skill.isDefault"
                @click="aiStore.deleteSkill(skill.id)"
                class="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition flex-shrink-0"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span v-else class="ml-2 text-xs text-gray-600 flex-shrink-0">内置</span>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div v-if="error" class="p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded">
          <p class="text-sm text-red-300">{{ error }}</p>
        </div>

        <div v-else-if="localConfig.apiKey" class="p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded">
          <p class="text-sm text-green-300">✓ 配置就绪</p>
        </div>

        <!-- Test Connection -->
        <div class="p-4 bg-gray-900 rounded border border-gray-700">
          <button
            @click="testConnection"
            :disabled="testing || !localConfig.apiKey"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition flex items-center justify-center gap-2"
          >
            <svg v-if="!testing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ testing ? '测试中...' : '测试 AI 连接' }}</span>
          </button>
          <div v-if="testResult" class="mt-3 text-sm" :class="testResult.success ? 'text-green-400' : 'text-red-400'">
            {{ testResult.message }}
          </div>
          <p class="text-xs text-gray-500 mt-2">
            💡 提示：发送简单消息测试连接是否正常
          </p>
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
import { createAIService } from '@/services/ai';
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

// Skill state
const showAddSkill = ref(false);
const newSkill = ref({ name: '', icon: '🔧', systemPrompt: '' });

function addSkill() {
  if (!newSkill.value.name.trim() || !newSkill.value.systemPrompt.trim()) return;
  aiStore.addSkill({
    id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: newSkill.value.name.trim(),
    icon: newSkill.value.icon || '🔧',
    systemPrompt: newSkill.value.systemPrompt.trim(),
    isDefault: false
  });
  newSkill.value = { name: '', icon: '🔧', systemPrompt: '' };
  showAddSkill.value = false;
}

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

const testing = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

async function testConnection() {
  // 先保存配置
  aiStore.saveConfig(localConfig.value);

  testing.value = true;
  testResult.value = null;

  try {
    const aiService = createAIService(localConfig.value);

    // 发送测试消息
    const testMessage = '你好，请回复"连接成功"';
    let responseText = '';

    for await (const chunk of aiService.chat([{ role: 'user', content: testMessage }])) {
      responseText += chunk;
    }

    testResult.value = {
      success: true,
      message: `✅ ${localConfig.value.provider} 连接成功！\n\nAI 回复：${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`
    };
  } catch (error) {
    testResult.value = {
      success: false,
      message: `❌ 连接失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查：\n1. API 密钥是否正确\n2. 模型名称是否正确\n3. 网络连接是否正常\n4. 余额是否充足`
    };
  } finally {
    testing.value = false;
  }
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
