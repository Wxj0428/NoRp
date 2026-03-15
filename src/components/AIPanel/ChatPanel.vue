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
          placeholder="描述你想要的页面，AI 会生成完整的页面..."
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
  '生成一个用户登录页面，包含邮箱和密码输入框',
  '创建一个数据表格页面，带分页功能',
  '生成一个管理后台仪表板，包含侧边栏和统计卡片',
  '创建一个产品展示页面，使用卡片网格布局',
  '生成一个完整的注册表单，包含表单验证',
  '创建一个响应式导航栏，带下拉菜单'
];

onMounted(() => {
  aiStore.loadConfig();

  // 添加欢迎消息
  if (messages.value.length === 0) {
    messages.value.push({
      role: 'assistant',
      content: `👋 欢迎使用 NoRp AI 设计助手！

我可以帮你快速生成完整的页面，包括：
🎨 登录/注册页面
📊 数据表格和仪表板
🛒 产品展示页面
📝 各种表单和组件

使用方法：
1. 描述你想要的页面（越详细越好）
2. 点击"插入到画布"将生成的页面添加到项目

试试下面的提示词，或者直接告诉我你的需求！`
    });
  }
});

function useExamplePrompt(prompt: string) {
  inputMessage.value = prompt;
}

async function sendMessage() {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message
  });
  aiStore.addMessage({ role: 'user', content: message });

  inputMessage.value = '';
  await scrollToBottom();

  isLoading.value = true;
  streamingResponse.value = '';

  // 添加助手回复占位符
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    role: 'assistant',
    content: ''
  });

  try {
    // 构建增强的提示词，引导 AI 生成完整页面
    const enhancedPrompt = `${message}

请生成一个完整的 HTML 页面，包含：
- 完整的页面结构（使用语义化 HTML）
- 所有样式都内联在 style 属性中
- 现代化的设计风格（阴影、圆角、渐变、动画）
- 响应式布局
- 适当的交互效果（hover、focus 等）

输出格式：使用 \`\`\`html 包裹完整的 HTML 代码`;

    // 创建增强的消息数组
    const enhancedMessages = [
      { role: 'system', content: '你是一位专业的前端开发工程师和 UI 设计师。请生成完整、美观、可直接使用的 HTML 页面。所有样式必须内联在 style 属性中。不要使用任何外部依赖。' },
      ...messages.value.slice(-10), // 只包含最近10条消息作为上下文
      { role: 'user', content: enhancedPrompt }
    ];
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
    for await (const chunk of aiService.chat(enhancedMessages)) {
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
    } else {
      // 如果没有代码块标记，尝试提取 HTML 内容
      const htmlMatch = fullResponse.match(/<html[\s\S]*?<\/html>/);
      if (htmlMatch) {
        lastGeneratedCode.value = htmlMatch[0];
      }
      // 或者查找任何以 < 开头的 HTML 代码
      else {
        const lines = fullResponse.split('\n');
        const htmlLines: string[] = [];
        let inHtmlBlock = false;
        for (const line of lines) {
          if (line.trim().startsWith('<') && line.includes('>')) {
            inHtmlBlock = true;
          }
          if (inHtmlBlock) {
            htmlLines.push(line);
          }
          if (inHtmlBlock && line.trim().endsWith('</')) {
            inHtmlBlock = false;
          }
        }
        if (htmlLines.length > 0) {
          lastGeneratedCode.value = htmlLines.join('\n');
        }
      }
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
  if (!lastGeneratedCode.value) {
    messages.value.push({
      role: 'assistant',
      content: '❌ 没有可插入的代码。请先生成代码。'
    });
    return;
  }

  try {
    // 设置待插入的 HTML
    editorStore.setPendingInsert(lastGeneratedCode.value);

    messages.value.push({
      role: 'assistant',
      content: '✅ 代码已成功插入到画布！\n\n你可以：\n• 在画布上查看生成的组件\n• 拖拽调整组件位置\n• 在右侧属性面板编辑样式'
    });
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `❌ 插入失败：${error instanceof Error ? error.message : '未知错误'}`
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
