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

      <!-- Quick Templates -->
      <div class="mb-3">
        <div class="text-xs text-gray-400 mb-2">🚀 快速模板</div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="template in quickTemplates"
            :key="template.id"
            @click="useQuickTemplate(template)"
            class="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            <span class="text-2xl">{{ template.icon }}</span>
            <span class="text-xs text-gray-300">{{ template.name }}</span>
          </button>
        </div>
      </div>

      <!-- Example Prompts -->
      <div>
        <div class="text-xs text-gray-400 mb-2">💡 示例需求</div>
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
          <!-- Check if message contains code block -->
          <div v-if="message.content.includes('```')" class="text-sm space-y-2">
            <template v-for="(part, partIndex) in parseMessage(message.content)" :key="partIndex">
              <div v-if="part.type === 'code'" class="my-2">
                <div class="bg-gray-900 rounded px-2 py-1 text-xs text-green-400 mb-1 flex items-center gap-2">
                  <span>{{ part.language }}</span>
                  <button
                    v-if="part.language === 'html'"
                    @click="copyCode(part.content)"
                    class="ml-auto text-gray-400 hover:text-white transition"
                    title="复制代码"
                  >
                    📋
                  </button>
                </div>
                <div class="bg-gray-900 rounded p-2 overflow-x-auto text-xs font-mono">
                  <pre class="whitespace-pre-wrap">{{ part.content }}</pre>
                </div>
              </div>
              <div v-else class="whitespace-pre-wrap">{{ part.content }}</div>
            </template>
          </div>
          <div v-else class="text-sm whitespace-pre-wrap">{{ message.content }}</div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <div class="flex space-x-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span class="text-xs text-gray-400">AI 正在生成页面...</span>
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
          placeholder="💡 提示：点击上方快速模板，或直接描述你想要的页面..."
          class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center"
          title="生成页面 (Enter)"
        >
          <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
      <div class="mt-2 flex gap-2">
        <button
          v-if="lastGeneratedCode"
          @click="insertCode"
          class="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          ✅ 插入到画布
        </button>
        <button
          @click="clearChat"
          class="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
        >
          🗑️ 清空对话
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

const quickTemplates = [
  {
    id: 'login',
    name: '登录页',
    icon: '🔐',
    prompt: '生成一个现代化的登录页面，包含：\n- 邮箱/用户名输入框\n- 密码输入框（带显示/隐藏功能）\n- "记住我"复选框\n- "忘记密码"链接\n- 登录按钮\n- 注册链接\n\n风格：简洁现代，使用渐变背景，卡片式布局，带有阴影和圆角'
  },
  {
    id: 'dashboard',
    name: '仪表板',
    icon: '📊',
    prompt: '生成一个完整的管理后台仪表板，包含：\n- 左侧导航栏（深色主题）\n- 顶部搜索栏和用户信息\n- 4个统计卡片（用户数、订单数、收入、访问量）\n- 图表展示区域\n- 最近活动列表\n\n风格：专业商务风格，使用蓝色为主色调，数据可视化清晰'
  },
  {
    id: 'product-list',
    name: '产品列表',
    icon: '🛍️',
    prompt: '生成一个电商产品列表页面，包含：\n- 顶部筛选栏（分类、价格、排序）\n- 12个产品卡片网格布局\n- 每个卡片包含：图片、标题、价格、购买按钮\n- 分页导航\n\n风格：电商风格，白色背景，产品卡片悬停效果，价格突出显示'
  },
  {
    id: 'form',
    name: '表单页',
    icon: '📝',
    prompt: '生成一个完整的联系表单页面，包含：\n- 姓名、邮箱、电话输入框\n- 下拉选择框（主题类型）\n- 多行文本域（详细内容）\n- 提交和重置按钮\n- 表单验证提示\n\n风格：简洁专业，使用绿色主色调，清晰的标签和提示文字'
  },
  {
    id: 'landing',
    name: '落地页',
    icon: '🎯',
    prompt: '生成一个产品营销落地页，包含：\n- 大标题和副标题首屏\n- 产品特点/优势区域（3-4个特点）\n- 产品截图展示区\n- 客户评价/案例\n- CTA按钮区域\n\n风格：营销导向，渐变色背景，大字体标题，强调视觉效果'
  },
  {
    id: 'settings',
    name: '设置页',
    icon: '⚙️',
    prompt: '生成一个用户设置页面，包含：\n- 左侧设置分类导航\n- 个人信息编辑表单\n- 密码修改区域\n- 通知偏好开关\n- 主题选择\n- 保存按钮\n\n风格：简洁实用，分组清晰，使用灰色调和蓝色强调色'
  }
];

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

🎨 我可以帮你快速生成完整的页面，包括：
• 登录/注册页面
• 管理后台仪表板
• 产品展示和电商页面
• 各种表单和组件
• 营销落地页
• 数据表格

🚀 三种使用方式：
1. 点击顶部的快速模板，一键生成常用页面
2. 使用示例需求，快速了解功能
3. 直接描述你想要的页面，我会为你生成

💡 提示：描述越详细，生成的效果越好！可以指定：
• 页面类型和功能
• 颜色风格（如蓝色系、暗色主题）
• 布局方式（如卡片网格、左右分栏）
• 交互效果（如悬停动画）

试试快速模板吧，或者直接告诉我你的需求！`
    });
  }
});

function useExamplePrompt(prompt: string) {
  inputMessage.value = prompt;
}

function useQuickTemplate(template: any) {
  inputMessage.value = template.prompt;
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
      content: '❌ 没有可插入的代码。\n\n💡 请先使用快速模板或描述需求来生成页面。'
    });
    scrollToBottom();
    return;
  }

  try {
    // 设置待插入的 HTML
    editorStore.setPendingInsert(lastGeneratedCode.value);

    messages.value.push({
      role: 'assistant',
      content: `🎉 页面已成功插入到画布！

✨ 接下来你可以：
• 在画布上查看和选择元素
• 拖拽调整元素位置
• 在右侧属性面板编辑样式
• 使用快捷键：Delete 删除元素

💡 提示：如果需要修改页面，可以继续描述需求，AI 会帮你优化！`
    });
    scrollToBottom();
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `❌ 插入失败：${error instanceof Error ? error.message : '未知错误'}\n\n请重试或检查生成的代码是否完整。`
    });
    scrollToBottom();
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

function parseMessage(content: string) {
  const parts: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2],
      language: match[1] || 'code'
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    // Show a brief notification
    messages.value.push({
      role: 'assistant',
      content: '✅ 代码已复制到剪贴板'
    });
    setTimeout(() => {
      messages.value.pop();
      scrollToBottom();
    }, 2000);
  });
}
</script>
