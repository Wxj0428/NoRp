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

      <!-- Skills Grid -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400">🚀 Skills</span>
          <span v-if="activeSkillId" class="text-xs text-blue-400">
            已选: {{ activeSkill?.name }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="skill in aiStore.skills"
            :key="skill.id"
            @click="selectSkill(skill)"
            :class="[
              'flex flex-col items-center gap-0.5 p-1.5 rounded transition',
              activeSkillId === skill.id
                ? 'bg-blue-600 ring-1 ring-blue-400'
                : 'bg-gray-700 hover:bg-gray-600'
            ]"
            :title="skill.name"
          >
            <span class="text-xl">{{ skill.icon }}</span>
            <span class="text-[10px] text-gray-300 truncate w-full text-center">{{ skill.name }}</span>
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
                  <span>{{ getLanguage(part) }}</span>
                  <button
                    v-if="getLanguage(part) === 'html'"
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
          placeholder="描述你想要的页面... (选择 Skill 可增强 AI 能力)"
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
          重新应用到画布
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
import { ref, computed, nextTick, onMounted } from 'vue';
import { useAIStore } from '@/stores/ai';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import { createAIService } from '@/services/ai';
import type { ChatMessage, Skill, AIActionType } from '@/types';

defineEmits<{
  close: []
  openSettings: []
}>();

const aiStore = useAIStore();
const editorStore = useEditorStore();
const projectStore = useProjectStore();

const messages = computed(() => aiStore.messages);
const inputMessage = ref('');
const messagesContainer = ref<HTMLElement>();
const isLoading = ref(false);
const lastGeneratedCode = ref('');
const streamingResponse = ref('');

// Skill state
const activeSkillId = computed(() => aiStore.activeSkillId);
const activeSkill = computed(() => aiStore.getActiveSkill);

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
  if (aiStore.messages.length === 0) {
    aiStore.addMessage({
      role: 'assistant',
      content: `👋 欢迎使用 NoRp AI 设计助手！

🎨 我可以帮你快速生成完整的页面，包括：
• 登录/注册页面
• 管理后台仪表板
• 产品展示和电商页面
• 各种表单和组件
• 营销落地页
• 数据表格

🚀 使用方式：
1. 选择上方 Skill 增强 AI 能力（前端设计、响应式布局、表单设计、动效设计）
2. 使用示例需求，快速了解功能
3. 直接描述你想要的页面，我会为你生成

💡 提示：Skill 是 AI 的能力增强，选择后 AI 会以对应专业视角生成页面
⚙️ 在 AI 设置中可以管理你的 Skill（添加/删除自定义 Skill）`
    });
  }
});

function useExamplePrompt(prompt: string) {
  inputMessage.value = prompt;
}

function selectSkill(skill: Skill) {
  if (activeSkillId.value === skill.id) {
    aiStore.setActiveSkill(null);
  } else {
    aiStore.setActiveSkill(skill.id);
  }
}

async function sendMessage() {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 添加用户消息
  aiStore.addMessage({
    role: 'user',
    content: message
  });

  inputMessage.value = '';
  await scrollToBottom();

  isLoading.value = true;
  streamingResponse.value = '';

  // 添加助手回复占位符
  const assistantMessageIndex = aiStore.messages.length;
  aiStore.addMessage({
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

    // 使用 skill 的 systemPrompt 或默认的
    let systemContent = activeSkill.value
      ? activeSkill.value.systemPrompt
      : '你是一位专业的前端开发工程师和 UI 设计师。请生成完整、美观、可直接使用的 HTML 页面。所有样式必须内联在 style 属性中。不要使用任何外部依赖。';

    // 注入页面上下文
    const currentPage = projectStore.currentPage;
    if (currentPage) {
      const contextParts: string[] = [
        '\n\n## 当前页面上下文',
        `- 页面名称: ${currentPage.name}`,
      ];

      if (currentPage.description) {
        contextParts.push(`- 页面描述: ${currentPage.description}`);
      }

      if (currentPage.html) {
        const truncatedHtml = currentPage.html.length > 8000
          ? currentPage.html.substring(0, 8000) + '\n<!-- [...已截断...] -->'
          : currentPage.html;
        contextParts.push(`\n### 当前页面 HTML:\n\`\`\`html\n${truncatedHtml}\n\`\`\``);
      }

      if (editorStore.selectedElementHtml) {
        const selectedHtml = editorStore.selectedElementHtml.length > 2000
          ? editorStore.selectedElementHtml.substring(0, 2000) + '\n<!-- [...已截断...] -->'
          : editorStore.selectedElementHtml;
        contextParts.push(`\n### 当前选中元素 (${editorStore.selectedElementTag || 'unknown'}):\n\`\`\`html\n${selectedHtml}\n\`\`\``);
      }

      contextParts.push(`\n## 响应操作\n生成 HTML 时，在代码开头用注释标记操作类型：\n- 替换整个页面: <!-- ACTION:REPLACE_PAGE -->\n- 修改选中元素: <!-- ACTION:MODIFY_SELECTED -->（HTML 将替换当前选中的元素）\n- 追加新内容: <!-- ACTION:APPEND -->（默认，追加到页面末尾）\n\n当用户要求修改已有元素时，使用 MODIFY_SELECTED。\n当用户要求全新设计时，使用 REPLACE_PAGE。\n当用户要求添加新部分时，使用 APPEND。`);

      systemContent += contextParts.join('\n');
    }

    // 创建增强的消息数组
    const enhancedMessages: ChatMessage[] = [
      { role: 'system', content: systemContent },
      ...aiStore.messages.slice(-10), // 只包含最近10条消息作为上下文
      { role: 'user', content: enhancedPrompt }
    ];

    // 发送后清除 skill 选中状态
    aiStore.setActiveSkill(null);

    // Check if AI is configured
    if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
        (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
      aiStore.messages[assistantMessageIndex].content =
        '请先配置 AI 设置。点击顶部的"AI 设置"按钮进行配置。';
      await scrollToBottom();
      isLoading.value = false;
      return;
    }

    // Create AI service
    const aiService = createAIService(aiStore.config);

    // Use streaming chat
    let fullResponse = '';
    for await (const chunk of aiService.chat(enhancedMessages)) {
      fullResponse += chunk;
      streamingResponse.value = fullResponse;
      aiStore.messages[assistantMessageIndex].content = fullResponse;
      await scrollToBottom();
    }

    // Auto-extract and apply code to canvas
    const extractedHtml = extractHtmlFromResponse(fullResponse);
    if (extractedHtml) {
      lastGeneratedCode.value = extractedHtml;
      const { action, html } = parseAIAction(extractedHtml);
      editorStore.setPendingAction(action, html);

      const actionLabels: Record<string, string> = {
        'replace-page': '替换页面',
        'modify-selected': '修改选中元素',
        'append': '追加内容'
      };

      aiStore.addMessage({
        role: 'assistant',
        content: `已自动应用到画布（${actionLabels[action] || '追加'}）。\n继续对话可以迭代优化页面。`
      });
      await scrollToBottom();
    }

    isLoading.value = false;
  } catch (error) {
    aiStore.messages[assistantMessageIndex].content =
      `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    aiStore.setError(error instanceof Error ? error.message : '未知错误');
    isLoading.value = false;
  }
}

function extractHtmlFromResponse(response: string): string | null {
  // 1. Try ```html ... ``` code block
  const codeMatch = response.match(/```html\n([\s\S]*?)\n```/);
  if (codeMatch) return codeMatch[1];

  // 2. Try ``` ... ``` code block (no language tag)
  const genericMatch = response.match(/```\n([\s\S]*?)\n```/);
  if (genericMatch && genericMatch[1].includes('<') && genericMatch[1].includes('>')) {
    return genericMatch[1];
  }

  // 3. Try full HTML document
  const htmlMatch = response.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) return htmlMatch[0];

  // 4. Try <style> + HTML fragment pattern
  const styleHtmlMatch = response.match(/(<style[\s\S]*?<\/style>\s*<[\s\S]*)/);
  if (styleHtmlMatch) return styleHtmlMatch[1];

  // 5. Try any substantial HTML content (starts with < and has multiple tags)
  const tagCount = (response.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length;
  if (tagCount >= 3) {
    // Find the first < to last > as a heuristic
    const firstTag = response.indexOf('<');
    if (firstTag >= 0) {
      return response.substring(firstTag);
    }
  }

  return null;
}

function parseAIAction(html: string): { action: AIActionType; html: string } {
  const trimmed = html.trim();
  if (trimmed.startsWith('<!-- ACTION:REPLACE_PAGE -->')) {
    return { action: 'replace-page', html: trimmed.replace('<!-- ACTION:REPLACE_PAGE -->', '').trim() };
  }
  if (trimmed.startsWith('<!-- ACTION:MODIFY_SELECTED -->')) {
    return { action: 'modify-selected', html: trimmed.replace('<!-- ACTION:MODIFY_SELECTED -->', '').trim() };
  }
  return { action: 'append', html: trimmed };
}

function insertCode() {
  if (!lastGeneratedCode.value) {
    aiStore.addMessage({
      role: 'assistant',
      content: '❌ 没有可插入的代码。\n\n💡 请先使用 Skill 或描述需求来生成页面。'
    });
    scrollToBottom();
    return;
  }

  try {
    const { action, html } = parseAIAction(lastGeneratedCode.value);

    // 使用新的 pendingAction 机制
    editorStore.setPendingAction(action, html);

    const actionLabels: Record<string, string> = {
      'replace-page': '替换整个页面',
      'modify-selected': '修改选中元素',
      'append': '追加到页面'
    };

    aiStore.addMessage({
      role: 'assistant',
      content: `🎉 页面已成功插入到画布！操作：${actionLabels[action] || '追加'}

✨ 接下来你可以：
• 在画布上查看和选择元素
• 拖拽调整元素位置
• 在右侧属性面板编辑样式
• 使用快捷键：Delete 删除元素

💡 提示：如果需要修改页面，可以继续描述需求，AI 会帮你优化！`
    });
    scrollToBottom();
  } catch (error) {
    aiStore.addMessage({
      role: 'assistant',
      content: `❌ 插入失败：${error instanceof Error ? error.message : '未知错误'}\n\n请重试或检查生成的代码是否完整。`
    });
    scrollToBottom();
  }
}

function clearChat() {
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

function getLanguage(part: { type: string; content: string; language?: string }): string {
  return part.type === 'code' ? (part.language || 'code') : '';
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    // Show a brief notification
    const idx = aiStore.messages.length;
    aiStore.addMessage({
      role: 'assistant',
      content: '✅ 代码已复制到剪贴板'
    });
    setTimeout(() => {
      aiStore.messages.splice(idx, 1);
      scrollToBottom();
    }, 2000);
  });
}
</script>
