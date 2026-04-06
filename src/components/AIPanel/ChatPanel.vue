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
    <div ref="messagesContainer" @scroll="handleChatScroll" class="flex-1 overflow-y-auto p-4 space-y-4 relative">
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
            'max-w-[85%] rounded-lg p-3',
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : isErrorMessage(message)
                ? 'bg-red-900/50 border border-red-700/50 text-gray-200'
                : 'bg-gray-700 text-gray-200'
          ]"
        >
          <!-- Tool Call Details (collapsible) -->
          <div v-if="message.toolCallDetails && message.toolCallDetails.length > 0" class="mb-2 space-y-1">
            <div
              v-for="(tc, tcIdx) in message.toolCallDetails"
              :key="tcIdx"
              class="bg-gray-800 rounded overflow-hidden"
            >
              <!-- Summary row: clickable to expand -->
              <button
                @click="toggleToolDetail(`${index}-${tcIdx}`)"
                class="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-gray-600 transition text-left"
              >
                <svg
                  :class="['w-3 h-3 text-gray-400 transition-transform', expandedToolDetails.has(`${index}-${tcIdx}`) ? 'rotate-90' : '']"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span v-if="tc.isError" class="text-red-400">❌</span>
                <span v-else-if="tc.result" class="text-green-400">✅</span>
                <span v-else class="text-yellow-400">⏳</span>
                <span class="text-gray-300 font-medium">{{ tc.name }}</span>
                <span v-if="!tc.result" class="text-yellow-400 ml-auto">执行中...</span>
              </button>
              <!-- Expanded detail -->
              <div v-if="expandedToolDetails.has(`${index}-${tcIdx}`)" class="border-t border-gray-700 px-2 py-1.5 space-y-1">
                <!-- Arguments -->
                <div v-if="Object.keys(tc.arguments).length > 0">
                  <div class="text-[10px] text-gray-500 mb-0.5">参数</div>
                  <pre class="text-[11px] text-blue-300 bg-gray-900 rounded p-1.5 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">{{ formatToolArgs(tc.arguments) }}</pre>
                </div>
                <!-- Result -->
                <div v-if="tc.result">
                  <div class="text-[10px] text-gray-500 mb-0.5">结果</div>
                  <pre class="text-[11px] bg-gray-900 rounded p-1.5 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto" :class="tc.isError ? 'text-red-300' : 'text-green-300'">{{ tc.result }}</pre>
                </div>
              </div>
            </div>
          </div>
          <!-- Message content with markdown + code block rendering -->
          <div v-if="message.content.includes('```')" class="text-sm space-y-2 chat-markdown">
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
              <div v-else v-html="renderMarkdown(part.content)" class="leading-relaxed"></div>
            </template>
            <!-- Streaming cursor -->
            <span v-if="isLoading && hasReceivedFirstChunk && index === messages.length - 1 && message.role === 'assistant'" class="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle"></span>
          </div>
          <div v-else class="text-sm chat-markdown">
            <div v-html="renderMarkdown(message.content)" class="leading-relaxed"></div>
            <!-- Streaming cursor -->
            <span v-if="isLoading && hasReceivedFirstChunk && index === messages.length - 1 && message.role === 'assistant'" class="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle"></span>
          </div>
          <!-- Retry button for error messages -->
          <div v-if="isErrorMessage(message) && lastFailedMessage" class="mt-2">
            <button @click="retryLastMessage" class="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition">
              重试
            </button>
          </div>
        </div>
      </div>

      <!-- Loading indicator: only show bouncing dots before first chunk arrives -->
      <div v-if="isLoading && !hasReceivedFirstChunk" class="flex justify-start">
        <div class="bg-gray-700 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <div class="flex space-x-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span v-if="aiStore.isAgentRunning" class="text-xs text-gray-400">
              Agent 迭代 {{ aiStore.agentIterations }}/{{ aiStore.config.maxAgentIterations || 10 }}...
            </span>
            <span v-else class="text-xs text-gray-400">AI 正在思考...</span>
          </div>
        </div>
      </div>

      <!-- Scroll to bottom button -->
      <button
        v-if="!isUserAtBottom && isLoading"
        @click="scrollToBottom(true)"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full shadow-lg transition z-10"
      >
        ↓ 新消息
      </button>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-gray-700">
      <!-- 选中元素提示 -->
      <div
        v-if="editorStore.selectedElementHtml"
        class="mb-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 text-xs text-gray-300 flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-blue-400 shrink-0">&#x1F6CE;</span>
          <span class="truncate">选中: &lt;{{ editorStore.selectedElementTag }}&gt;</span>
        </div>
        <button
          @click="insertSelectedElement"
          class="shrink-0 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition"
        >
          发送到对话
        </button>
      </div>
      <div class="flex gap-2">
        <textarea
          ref="textareaRef"
          v-model="inputMessage"
          @keydown.enter.exact="handleEnterKey"
          @input="autoResizeTextarea"
          rows="1"
          :placeholder="inputPlaceholder"
          class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-blue-500 overflow-hidden"
          style="min-height: 38px; max-height: 150px;"
        ></textarea>
        <button
          v-if="isLoading"
          @click="cancelAgent"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center"
          title="停止生成"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
        <button
          v-else
          @click="sendMessage"
          :disabled="!inputMessage.trim()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center"
          title="生成页面 (Enter)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <div class="mt-2 flex gap-2">
        <button
          @click="insertCode"
          :disabled="!lastGeneratedCode"
          class="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded transition"
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
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useAIStore } from '@/stores/ai';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import { useToastStore } from '@/stores/toast';
import { createAIService } from '@/services/ai';
import { Agent } from '@/services/ai/agent';
import { ToolExecutor } from '@/services/ai/tools/executor';
import { ALL_TOOLS } from '@/services/ai/tools';
import { PromptBuilder } from '@/services/ai/prompt-builder';
import { renderMarkdown } from '@/composables/useMarkdown';
import type { ChatMessage, Skill, AIActionType, ToolCallDetail } from '@/types';

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
const textareaRef = ref<HTMLTextAreaElement>();
const isLoading = ref(false);
const lastGeneratedCode = ref('');
const streamingResponse = ref('');
const expandedToolDetails = ref(new Set<string>());
const hasReceivedFirstChunk = ref(false);
const lastFailedMessage = ref<string | null>(null);

// Smart scroll tracking
const isUserAtBottom = ref(true);

// Agent timeout protection
let agentTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Skill state
const activeSkillId = computed(() => aiStore.activeSkillId);
const activeSkill = computed(() => aiStore.getActiveSkill);

// Input placeholder
const inputPlaceholder = computed(() => {
  if (editorStore.selectedElementHtml) {
    return '描述你想要的修改... (已检测到选中元素，可点击"发送到对话")';
  }
  return '描述你想要的页面... (选择 Skill 可增强 AI 能力)';
});

function insertSelectedElement() {
  const tag = editorStore.selectedElementTag || 'element';
  const html = editorStore.selectedElementHtml || '';
  if (!html) return;

  // 截断过长的 HTML
  const truncated = html.length > 2000 ? html.substring(0, 2000) + '\n<!-- ...已截断 -->' : html;

  inputMessage.value = `请优化这个 ${tag} 元素的样式和设计：\n\`\`\`html\n${truncated}\n\`\`\``;
}

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

  // Early API key check (Phase 6C: don't pollute chat history)
  if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
      (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
    const toast = useToastStore();
    toast.warning('请先配置 AI 设置');
    return;
  }

  // 添加用户消息
  aiStore.addMessage({
    role: 'user',
    content: message
  });

  inputMessage.value = '';
  resetTextareaHeight();
  await scrollToBottom(true);

  isLoading.value = true;
  hasReceivedFirstChunk.value = false;
  lastFailedMessage.value = null;
  streamingResponse.value = '';
  editorStore.isCanvasBusy = true;

  // 添加助手回复占位符
  const assistantMessageIndex = aiStore.messages.length;
  aiStore.addMessage({
    role: 'assistant',
    content: ''
  });

  try {
    // Phase 7A: Keep skill selection (don't clear after each send)

    // 使用 PromptBuilder 构建消息
    const useTools = aiStore.config.enableToolCalling !== false;
    const promptBuilder = new PromptBuilder();
    const systemPrompt = promptBuilder.buildSystemPrompt({
      skill: activeSkill.value,
      currentPage: projectStore.currentPage,
      selectedElementHtml: editorStore.selectedElementHtml,
      selectedElementTag: editorStore.selectedElementTag,
      projectName: projectStore.project?.name,
      hasTools: useTools,
    });

    const enhancedMessages = promptBuilder.buildMessages(
      aiStore.messages,
      systemPrompt
    );

    // Create AI service
    const aiService = createAIService(aiStore.config);

    if (useTools) {
      // ====== Agent 模式：支持工具调用和多轮迭代 ======
      const toolExecutor = new ToolExecutor();
      const controller = aiStore.startAgent();

      const agent = new Agent(aiService, toolExecutor, {
        maxIterations: aiStore.config.maxAgentIterations || 10,
        signal: controller.signal,
      });

      // 120s 超时保护
      agentTimeoutId = setTimeout(() => {
        cancelAgent();
        const toast = useToastStore();
        toast.warning('AI 响应超时，已自动取消');
      }, 120000);

      // Track tool call details for collapsible display
      const toolCallDetailsMap = new Map<string, ToolCallDetail>();

      await agent.run(enhancedMessages, ALL_TOOLS, {
        onTextChunk: (text: string) => {
          hasReceivedFirstChunk.value = true;
          const current = aiStore.messages[assistantMessageIndex].content || '';
          aiStore.messages[assistantMessageIndex].content = current + text;
          streamingResponse.value = aiStore.messages[assistantMessageIndex].content;
          scrollToBottom();
        },
        onToolCallStart: (toolCall: any) => {
          const detail: ToolCallDetail = {
            id: toolCall.id,
            name: toolCall.name,
            arguments: toolCall.arguments,
            timestamp: Date.now(),
          };
          toolCallDetailsMap.set(toolCall.id, detail);
          // Store structured details on the message
          const msg = aiStore.messages[assistantMessageIndex];
          if (!msg.toolCallDetails) msg.toolCallDetails = [];
          msg.toolCallDetails.push(detail);
          aiStore.addToolCall(toolCall);

          // 捕获画布修改工具的 HTML，供"重新应用"按钮使用
          const canvasTools = ['replace_page', 'append_content', 'modify_element'];
          if (canvasTools.includes(toolCall.name)) {
            const html = toolCall.arguments?.html || toolCall.arguments?.newHtml || '';
            if (html) {
              const action = toolCall.name === 'replace_page' ? 'replace-page'
                : toolCall.name === 'modify_element' ? 'modify-selected' : 'append';
              lastGeneratedCode.value = action === 'replace-page'
                ? `<!-- ACTION:REPLACE_PAGE -->${html}`
                : action === 'modify-selected'
                ? `<!-- ACTION:MODIFY_SELECTED -->${html}`
                : html;
            }
          }

          scrollToBottom();
        },
        onToolCallResult: (result: any) => {
          // Update the detail with result
          const detail = toolCallDetailsMap.get(result.toolCallId);
          if (detail) {
            detail.result = result.content;
            detail.isError = result.isError;
          }
          scrollToBottom();
        },
        onIterationStart: (iteration: number, maxIterations: number) => {
          aiStore.setAgentIterations(iteration);
        },
        onComplete: (finalText: string, wasTruncated: boolean) => {
          // 截断警告
          if (wasTruncated) {
            aiStore.messages[assistantMessageIndex].content =
              (aiStore.messages[assistantMessageIndex].content || '') +
              '\n\n⚠️ **AI 响应被截断**（达到最大 token 限制）。生成的内容可能不完整，建议在设置中增大"最大令牌数"，或简化您的需求后重试。';
          }
          // 只保存 lastGeneratedCode 供"重新应用"按钮使用
          // 不再从 onComplete 重复设置 pendingAction（工具调用已直接应用）
          if (finalText) {
            const extractedHtml = extractHtmlFromResponse(finalText);
            if (extractedHtml) {
              lastGeneratedCode.value = extractedHtml;
            }
          }
          isLoading.value = false;
          editorStore.isCanvasBusy = false;
          hasReceivedFirstChunk.value = false;
          aiStore.setAgentRunning(false);
          aiStore.clearToolCalls();
          if (agentTimeoutId) { clearTimeout(agentTimeoutId); agentTimeoutId = null; }
        },
        onError: (error: Error) => {
          lastFailedMessage.value = message;
          aiStore.messages[assistantMessageIndex].content =
            `❌ 错误: ${error.message || '未知错误'}`;
          aiStore.setError(error.message);
          isLoading.value = false;
          editorStore.isCanvasBusy = false;
          hasReceivedFirstChunk.value = false;
          aiStore.setAgentRunning(false);
          if (agentTimeoutId) { clearTimeout(agentTimeoutId); agentTimeoutId = null; }
          scrollToBottom();
        },
      });
    } else {
      // ====== 纯文本模式：兼容模式 ======
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
      }
      isLoading.value = false;
      editorStore.isCanvasBusy = false;
    }
  } catch (error) {
    aiStore.messages[assistantMessageIndex].content =
      `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    aiStore.setError(error instanceof Error ? error.message : '未知错误');
    isLoading.value = false;
    editorStore.isCanvasBusy = false;
    hasReceivedFirstChunk.value = false;
    aiStore.setAgentRunning(false);
    if (agentTimeoutId) { clearTimeout(agentTimeoutId); agentTimeoutId = null; }
  }
}

function extractHtmlFromResponse(response: string): string | null {
  // 1. Try ```html ... ``` code block (with closing backticks)
  const codeMatch = response.match(/```html\n([\s\S]*?)\n```/);
  if (codeMatch) return codeMatch[1];

  // 1b. Try ```html ... (truncated — no closing backticks)
  const truncatedCodeMatch = response.match(/```html\n([\s\S]+)$/);
  if (truncatedCodeMatch) return truncatedCodeMatch[1];

  // 2. Try ``` ... ``` code block (no language tag)
  const genericMatch = response.match(/```\n([\s\S]*?)\n```/);
  if (genericMatch && genericMatch[1].includes('<') && genericMatch[1].includes('>')) {
    return genericMatch[1];
  }

  // 2b. Truncated generic code block
  const truncatedGeneric = response.match(/```\n([\s\S]+)$/);
  if (truncatedGeneric && truncatedGeneric[1].includes('<') && truncatedGeneric[1].includes('>')) {
    return truncatedGeneric[1];
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
  isLoading.value = false;
  editorStore.isCanvasBusy = false;
  expandedToolDetails.value.clear();
  aiStore.cancelAgent();
  aiStore.clearMessages();
}

function cancelAgent() {
  if (agentTimeoutId) { clearTimeout(agentTimeoutId); agentTimeoutId = null; }
  aiStore.cancelAgent();
  isLoading.value = false;
  editorStore.isCanvasBusy = false;
  hasReceivedFirstChunk.value = false;
}

function toggleToolDetail(key: string) {
  if (expandedToolDetails.value.has(key)) {
    expandedToolDetails.value.delete(key);
  } else {
    expandedToolDetails.value.add(key);
  }
  // Trigger reactivity
  expandedToolDetails.value = new Set(expandedToolDetails.value);
}

function formatToolArgs(args: Record<string, any>): string {
  // Truncate long HTML values for display
  const formatted: Record<string, any> = {};
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.length > 500) {
      formatted[key] = value.substring(0, 500) + `... (${value.length} 字符)`;
    } else {
      formatted[key] = value;
    }
  }
  return JSON.stringify(formatted, null, 2);
}

// Smart scroll: only auto-scroll when user is at bottom or force=true
async function scrollToBottom(force = false) {
  await nextTick();
  if (messagesContainer.value && (force || isUserAtBottom.value)) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function handleChatScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  const threshold = 100;
  isUserAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

function autoResizeTextarea() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

function handleEnterKey(e: KeyboardEvent) {
  if (e.shiftKey) return; // Allow Shift+Enter for newlines
  e.preventDefault();
  sendMessage();
}

function resetTextareaHeight() {
  const el = textareaRef.value;
  if (el) {
    el.style.height = 'auto';
  }
}

function isErrorMessage(message: ChatMessage): boolean {
  return message.role === 'assistant' &&
    (message.content.startsWith('❌') || message.content.startsWith('错误:'));
}

function retryLastMessage() {
  if (lastFailedMessage.value) {
    inputMessage.value = lastFailedMessage.value;
    lastFailedMessage.value = null;
    // Remove the last error message
    const msgs = aiStore.messages;
    if (msgs.length > 0 && isErrorMessage(msgs[msgs.length - 1])) {
      msgs.splice(msgs.length - 1, 1);
    }
    sendMessage();
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

  // Handle remaining content after last complete code block
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex);
    // Check for incomplete code block (streaming state - no closing backticks)
    const incompleteMatch = remaining.match(/```(\w*)\n([\s\S]*)$/);
    if (incompleteMatch) {
      // There might be text before the incomplete code block
      const textBefore = remaining.slice(0, remaining.indexOf('```'));
      if (textBefore.trim()) {
        parts.push({ type: 'text', content: textBefore });
      }
      parts.push({
        type: 'code',
        content: incompleteMatch[2],
        language: incompleteMatch[1] || 'code'
      });
    } else if (remaining.trim()) {
      parts.push({ type: 'text', content: remaining });
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

function getLanguage(part: { type: string; content: string; language?: string }): string {
  return part.type === 'code' ? (part.language || 'code') : '';
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    const toast = useToastStore();
    toast.success('代码已复制到剪贴板');
  });
}
</script>
