<template>
  <div class="chat-panel h-full bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white font-semibold">AI 助手</h3>
        <div class="flex items-center gap-2">
          <button
            @click="$emit('openSettings')"
            class="p-1 hover:bg-gray-700 rounded"
            title="AI 设置"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            @click="$emit('close')"
            class="p-1 hover:bg-gray-700 rounded"
            title="关闭"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Example Prompts -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="example in examplePrompts"
          :key="example"
          @click="useExamplePrompt(example)"
          class="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition"
        >
          {{ example }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg p-3',
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200'
          ]"
        >
          <div class="text-sm whitespace-pre-wrap">{{ message.content }}</div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-gray-700">
      <div class="flex gap-2">
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          rows="3"
          placeholder="让 AI 生成或修改 UI..."
          class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <div class="mt-2 flex gap-2">
        <button
          @click="insertCode"
          class="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          插入到画布
        </button>
        <button
          @click="clearChat"
          class="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          清空对话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useAIStore } from '@/stores/ai';
import { useEditorStore } from '@/stores/editor';
import { createAIService } from '@/services/ai';
import type { ChatMessage } from '@/types';

defineEmits<{
  close: []
  openSettings: []
}>();

const aiStore = useAIStore();
const editorStore = useEditorStore();

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const messagesContainer = ref<HTMLElement>();
const isLoading = ref(false);
const lastGeneratedCode = ref('');
const streamingResponse = ref('');

const examplePrompts = [
  '创建登录表单',
  '添加导航栏',
  '生成卡片组件',
  '创建数据表格',
  '添加产品卡片',
  '生成页面布局'
];

onMounted(() => {
  aiStore.loadConfig();
});

function useExamplePrompt(prompt: string) {
  inputMessage.value = prompt;
}

async function sendMessage() {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // Add user message
  messages.value.push({
    role: 'user',
    content: message
  });
  aiStore.addMessage({ role: 'user', content: message });

  inputMessage.value = '';
  await scrollToBottom();

  isLoading.value = true;
  streamingResponse.value = '';

  // Add placeholder for assistant response
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    role: 'assistant',
    content: ''
  });

  try {
    // Check if AI is configured
    if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
        (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
      messages.value[assistantMessageIndex].content =
        '请先配置 AI 设置。点击顶部的"AI 设置"按钮进行配置。';
      await scrollToBottom();
      isLoading.value = false;
      return;
    }

    // Create AI service
    const aiService = createAIService(aiStore.config);

    // Build context
    // const _context = {
    //   projectName: projectStore.project?.name || 'Untitled',
    //   currentSelection: editorStore.selectedElementId,
    //   conversationHistory: messages.value.slice(-10)
    // };

    // Use streaming chat
    let fullResponse = '';
    for await (const chunk of aiService.chat([...messages.value])) {
      fullResponse += chunk;
      streamingResponse.value = fullResponse;
      messages.value[assistantMessageIndex].content = fullResponse;
      await scrollToBottom();
    }

    // Add to AI store
    aiStore.addMessage({ role: 'assistant', content: fullResponse });

    // Extract code from response if present
    const codeMatch = fullResponse.match(/```html\n([\s\S]*?)\n```/);
    if (codeMatch) {
      lastGeneratedCode.value = codeMatch[1];
    }

    isLoading.value = false;
  } catch (error) {
    messages.value[assistantMessageIndex].content =
      `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    aiStore.setError(error instanceof Error ? error.message : '未知错误');
    isLoading.value = false;
  }
}

function insertCode() {
  if (lastGeneratedCode.value) {
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = lastGeneratedCode.value;

    // Emit event to editor to insert the code
    // For now, use the editor store
    editorStore.setPendingInsert(lastGeneratedCode.value);

    messages.value.push({
      role: 'assistant',
      content: '✅ 代码已准备插入到画布。点击画布上的位置来放置组件。'
    });
  } else {
    messages.value.push({
      role: 'assistant',
      content: '❌ 没有可插入的代码。请先生成代码。'
    });
  }
}

function clearChat() {
  messages.value = [];
  lastGeneratedCode.value = '';
  aiStore.clearMessages();
}

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}
</script>
