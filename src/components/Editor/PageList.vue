<template>
  <div class="page-list flex flex-col h-full bg-gray-800 border-r border-gray-700">
    <!-- Header -->
    <div class="p-3 border-b border-gray-700">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-white text-sm font-semibold">页面</h3>
        <button
          @click="addPage"
          class="p-1 hover:bg-gray-700 rounded"
          title="添加页面"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Page List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-for="(page, index) in pages"
        :key="page.id"
        :class="[
          'group relative flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-sm transition',
          currentPageId === page.id
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-700 text-gray-300'
        ]"
        @click="selectPage(page.id)"
        @dblclick="startRename(page)"
        @contextmenu.prevent="showContextMenu($event, page, index)"
      >
        <!-- Page Icon -->
        <span class="flex-shrink-0">
          📄
        </span>

        <!-- Page Name -->
        <div
          v-if="editingPageId === page.id"
          class="flex-1"
        >
          <input
            ref="editInput"
            v-model="editingName"
            @blur="finishRename(page)"
            @keydown.enter="finishRename(page)"
            @keydown.esc="cancelRename"
            class="w-full bg-gray-900 border border-blue-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
          />
        </div>
        <span v-else class="flex-1 truncate">
          {{ page.name }}
        </span>

        <!-- Actions -->
        <div
          v-if="currentPageId === page.id && editingPageId !== page.id"
          class="hidden group-hover:flex items-center gap-1"
        >
          <button
            @click.stop="openDescriptionModal(page)"
            class="p-1 hover:bg-gray-600 rounded"
            title="页面说明"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            @click.stop="duplicatePage(page)"
            class="p-1 hover:bg-gray-600 rounded"
            title="复制页面"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            v-if="pages.length > 1"
            @click.stop="deletePage(page)"
            class="p-1 hover:bg-red-600 rounded"
            title="删除页面"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="pages.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-sm">暂无页面</p>
        <button
          @click="addPage"
          class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
        >
          添加第一个页面
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-700">
      <div class="text-xs text-gray-500">
        {{ pages.length }} 个页面
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.show"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-gray-900 border border-gray-700 rounded shadow-xl py-1 min-w-[150px]"
      @click="closeContextMenu"
    >
      <button
        @click="openDescriptionModal(contextMenu.page)"
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        页面说明
      </button>
      <button
        @click="renamePage(contextMenu.page)"
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        重命名
      </button>
      <button
        @click="duplicatePage(contextMenu.page)"
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        复制页面
      </button>
      <div class="border-t border-gray-700 my-1"></div>
      <button
        @click="aiGenerateFromDescription(contextMenu.page)"
        :disabled="!contextMenu.page?.description?.trim()"
        :class="[
          'w-full px-3 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2',
          contextMenu.page?.description?.trim() ? 'text-purple-400' : 'text-gray-600 cursor-not-allowed'
        ]"
        :title="contextMenu.page?.description?.trim() ? '根据页面说明用 AI 生成页面内容' : '请先填写页面说明'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        根据说明生成页面
      </button>
      <div class="border-t border-gray-700 my-1"></div>
      <button
        v-if="pages.length > 1"
        @click="deletePage(contextMenu.page)"
        class="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
        </svg>
        删除页面
      </button>
    </div>

    <!-- Description Modal -->
    <div
      v-if="descriptionModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeDescriptionModal"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 class="text-white font-semibold">📝 页面说明</h3>
          <button
            @click="closeDescriptionModal"
            class="p-1 hover:bg-gray-700 rounded"
            title="关闭"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">页面名称</label>
            <div class="text-white text-lg">{{ descriptionModal.page?.name }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">设计思路说明</label>
            <textarea
              v-model="descriptionModal.content"
              rows="15"
              placeholder="在这里记录页面的设计思路、功能说明、交互逻辑等..."
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
            <div class="text-xs text-gray-400 mb-2">💡 提示：可以记录以下内容</div>
            <ul class="text-xs text-gray-500 space-y-1">
              <li>• 页面的主要功能和目标用户</li>
              <li>• 设计思路和视觉风格</li>
              <li>• 用户交互流程和体验设计</li>
              <li>• 需要注意的技术细节</li>
              <li>• 待优化或待实现的功能</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-700 flex justify-between">
          <div class="flex gap-2">
            <button
              @click="aiOptimizeDescription"
              :disabled="isGeneratingDesc || !descriptionModal.content.trim()"
              class="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition flex items-center gap-2 text-sm"
              title="AI 优化当前设计思路内容"
            >
              <svg v-if="!isGeneratingDesc" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isGeneratingDesc ? '优化中...' : '优化思路' }}
            </button>
            <button
              @click="aiGenerateToCanvas"
              :disabled="isGeneratingToCanvas || !descriptionModal.content.trim()"
              class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition flex items-center gap-2 text-sm"
              title="根据设计思路生成页面到画布"
            >
              <svg v-if="!isGeneratingToCanvas" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isGeneratingToCanvas ? '生成中...' : '生成到画布' }}
            </button>
          </div>
          <div class="flex gap-2">
            <button
              @click="closeDescriptionModal"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              取消
            </button>
            <button
              @click="saveDescription"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              保存说明
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useAIStore } from '@/stores/ai';
import { useEditorStore } from '@/stores/editor';
import { createAIService } from '@/services/ai';
import { Agent } from '@/services/ai/agent';
import { ToolExecutor } from '@/services/ai/tools/executor';
import { ALL_TOOLS } from '@/services/ai/tools';
import { PromptBuilder } from '@/services/ai/prompt-builder';
import type { Page, ToolCallDetail, ChatMessage } from '@/types';

const projectStore = useProjectStore();
const aiStore = useAIStore();
const editorStore = useEditorStore();

const editingPageId = ref<string | null>(null);
const editingName = ref('');
const editInput = ref<HTMLInputElement>();
const isGeneratingDesc = ref(false);
const isGeneratingToCanvas = ref(false);
const optimizeBuffer = ref('');
const generateBuffer = ref('');

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  page: null as Page | null,
  index: -1
});

const descriptionModal = ref({
  show: false,
  page: null as Page | null,
  content: ''
});

const pages = computed(() => projectStore.pageList);
const currentPageId = computed(() => projectStore.currentPageId);

// Add new page
function addPage() {
  const name = `页面 ${pages.value.length + 1}`;
  projectStore.addPage(name);
}

// Select page
function selectPage(pageId: string) {
  if (currentPageId.value !== pageId) {
    projectStore.currentPageId = pageId;
  }
}

// Start renaming (double click)
function startRename(page: Page) {
  editingPageId.value = page.id;
  editingName.value = page.name;
  nextTick(() => {
    editInput.value?.focus();
    editInput.value?.select();
  });
}

// Start renaming (from context menu)
function renamePage(page: Page | null) {
  if (page) startRename(page);
}

// Finish renaming
function finishRename(page: Page) {
  if (editingName.value.trim()) {
    page.name = editingName.value.trim();
  }
  editingPageId.value = null;
  editingName.value = '';
}

// Cancel renaming
function cancelRename() {
  editingPageId.value = null;
  editingName.value = '';
}

// Duplicate page
function duplicatePage(page: any) {
  projectStore.addPage(`${page.name} 副本`);
  // TODO: Copy page content
}

// Delete page
function deletePage(page: any) {
  if (pages.value.length <= 1) {
    alert('至少需要保留一个页面');
    return;
  }

  if (confirm(`确定要删除页面"${page.name}"吗？`)) {
    projectStore.deletePage(page.id);
  }
}

// Context menu
function showContextMenu(event: MouseEvent, page: Page, index: number) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    page,
    index
  };
}

function closeContextMenu() {
  contextMenu.value.show = false;
}

// Description modal functions
function openDescriptionModal(page: Page) {
  descriptionModal.value = {
    show: true,
    page,
    content: page.description || ''
  };
}

function closeDescriptionModal() {
  descriptionModal.value.show = false;
}

function saveDescription() {
  if (descriptionModal.value.page) {
    projectStore.updatePageDescription(descriptionModal.value.content);
    closeDescriptionModal();
  }
}

// AI: Optimize existing description content (Agent mode)
async function aiOptimizeDescription() {
  const content = descriptionModal.value.content.trim();
  if (!content) {
    alert('请先输入设计思路内容');
    return;
  }

  if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
      (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
    alert('请先在 AI 设置中配置 API 密钥');
    return;
  }

  isGeneratingDesc.value = true;
  optimizeBuffer.value = '';

  try {
    const aiService = createAIService(aiStore.config);
    const useTools = aiStore.config.enableToolCalling !== false;

    const systemPrompt = `你是一位专业的 UI/UX 设计师。用户会提供一段页面设计思路/描述，请优化它。

优化方向：
1. 补充缺失的设计细节（布局、配色、字体、间距等）
2. 完善交互流程和用户体验描述
3. 增加技术实现建议
4. 使描述更加清晰、结构化、专业

${useTools ? '你可以使用工具读取当前页面的 HTML 来更好地理解设计上下文，从而给出更精准的优化建议。' : ''}

请直接输出优化后的文本，不要使用代码块包裹，保持中文。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请优化以下设计思路：\n\n${content}` },
    ];

    if (useTools) {
      const toolExecutor = new ToolExecutor();
      const controller = aiStore.startAgent();
      const agent = new Agent(aiService, toolExecutor, {
        maxIterations: 3,
        signal: controller.signal,
      });

      let fullText = '';
      const timeoutId = setTimeout(() => { controller.abort(); }, 60000);
      try {
        await agent.run(messages, ALL_TOOLS, {
          onTextChunk: (text) => { fullText += text; },
          onToolCallStart: () => {},
          onToolCallResult: () => {},
          onIterationStart: () => {},
          onComplete: (text) => { fullText = text || fullText; },
          onError: (error) => { throw error; },
        });
      } finally {
        clearTimeout(timeoutId);
      }
      descriptionModal.value.content = fullText;
    } else {
      for await (const chunk of aiService.chat(messages)) {
        optimizeBuffer.value += chunk;
      }
      descriptionModal.value.content = optimizeBuffer.value;
    }
  } catch (error) {
    alert('AI 优化失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    isGeneratingDesc.value = false;
    optimizeBuffer.value = '';
    aiStore.setAgentRunning(false);
  }
}

// AI: Generate page to canvas from description content (Agent mode)
async function aiGenerateToCanvas() {
  const originalContent = descriptionModal.value.content.trim();
  const page = descriptionModal.value.page;
  if (!originalContent) {
    alert('请先输入设计思路内容');
    return;
  }

  if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
      (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
    alert('请先在 AI 设置中配置 API 密钥');
    return;
  }

  // Save description first
  if (page) {
    projectStore.updatePageDescription(originalContent);
  }

  isGeneratingToCanvas.value = true;
  generateBuffer.value = '';

  try {
    const aiService = createAIService(aiStore.config);
    const useTools = aiStore.config.enableToolCalling !== false;

    const promptBuilder = new PromptBuilder();
    const systemPrompt = promptBuilder.buildSystemPrompt({
      currentPage: page,
      hasTools: useTools,
    });

    const messages: ChatMessage[] = promptBuilder.buildMessages(
      [],
      systemPrompt,
      `请根据以下设计思路生成完整的页面：\n\n${originalContent}`,
    );

    if (useTools) {
      const toolExecutor = new ToolExecutor();
      const controller = aiStore.startAgent();
      const agent = new Agent(aiService, toolExecutor, {
        maxIterations: aiStore.config.maxAgentIterations || 10,
        signal: controller.signal,
      });

      let fullText = '';
      let agentUsedTools = false;

      // 添加超时保护：120秒后自动取消
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000);

      try {
        await agent.run(messages, ALL_TOOLS, {
          onTextChunk: (text) => { fullText += text; },
          onToolCallStart: () => { agentUsedTools = true; },
          onToolCallResult: () => {},
          onIterationStart: () => {},
          onComplete: (text) => { fullText = text || fullText; },
          onError: (error) => { throw error; },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (agentUsedTools) {
        // Agent 模式下，工具已经直接修改了画布
        closeDescriptionModal();
      } else {
        // Agent 没用工具，从文本中提取 HTML
        const extractedHtml = extractHtmlFromText(fullText);
        if (extractedHtml) {
          const pageId = page?.id || projectStore.currentPageId;
          closeDescriptionModal();
          await nextTick();
          editorStore.setPendingAction('replace-page', extractedHtml, pageId);
        } else {
          alert('AI 未能生成有效的 HTML 内容');
        }
      }
    } else {
      // 纯文本回退模式
      for await (const chunk of aiService.chat(messages)) {
        generateBuffer.value += chunk;
      }

      if (generateBuffer.value) {
        const codeMatch = generateBuffer.value.match(/```html\n([\s\S]*?)\n```/);
        const html = codeMatch ? codeMatch[1]
          : generateBuffer.value.match(/<html[\s\S]*?<\/html>/)?.[0]
          || (generateBuffer.value.includes('<') && generateBuffer.value.includes('>') ? generateBuffer.value : '');

        if (html) {
          const pageId = page?.id || projectStore.currentPageId;
          closeDescriptionModal();
          await nextTick();
          editorStore.setPendingAction('replace-page', html, pageId);
        } else {
          alert('AI 未能生成有效的 HTML 内容');
        }
      }
    }
  } catch (error) {
    alert('AI 生成页面失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    isGeneratingToCanvas.value = false;
    generateBuffer.value = '';
    aiStore.setAgentRunning(false);
  }
}

// AI: Generate page from description (context menu action, Agent mode)
async function aiGenerateFromDescription(page: Page | null) {
  if (!page?.description?.trim()) return;

  closeContextMenu();

  if ((aiStore.config.provider !== 'local' && !aiStore.config.apiKey) ||
      (aiStore.config.provider === 'local' && !aiStore.config.baseURL)) {
    alert('请先在 AI 设置中配置 API 密钥');
    return;
  }

  // Switch to this page first
  if (currentPageId.value !== page.id) {
    projectStore.currentPageId = page.id;
  }

  try {
    const aiService = createAIService(aiStore.config);
    const useTools = aiStore.config.enableToolCalling !== false;

    const promptBuilder = new PromptBuilder();
    const systemPrompt = promptBuilder.buildSystemPrompt({
      currentPage: projectStore.currentPage,
      hasTools: useTools,
    });

    const messages: ChatMessage[] = promptBuilder.buildMessages(
      aiStore.messages,
      systemPrompt,
      `请根据以下设计思路生成完整的页面：\n\n${page.description}`,
    );

    if (useTools) {
      const toolExecutor = new ToolExecutor();
      const controller = aiStore.startAgent();
      const agent = new Agent(aiService, toolExecutor, {
        maxIterations: aiStore.config.maxAgentIterations || 10,
        signal: controller.signal,
      });

      let fullText = '';
      await agent.run(messages, ALL_TOOLS, {
        onTextChunk: (text) => { fullText += text; },
        onToolCallStart: () => {},
        onToolCallResult: () => {},
        onIterationStart: () => {},
        onComplete: (text) => {
          fullText = text || fullText;
          // 后备：如果 agent 没用工具，从文本提取 HTML
          if (text) {
            const extractedHtml = extractHtmlFromText(text);
            if (extractedHtml) {
              editorStore.setPendingAction('replace-page', extractedHtml, page.id);
            }
          }
        },
        onError: (error) => { throw error; },
      });
    } else {
      let fullResponse = '';
      for await (const chunk of aiService.chat(messages)) {
        fullResponse += chunk;
      }

      const extractedHtml = extractHtmlFromText(fullResponse);
      if (extractedHtml) {
        editorStore.setPendingAction('replace-page', extractedHtml, page.id);
      } else {
        alert('AI 未能生成有效的 HTML 内容');
      }
    }
  } catch (error) {
    alert('AI 生成页面失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    aiStore.setAgentRunning(false);
  }
}

function extractHtmlFromText(text: string): string | null {
  const codeMatch = text.match(/```html\n([\s\S]*?)\n```/);
  if (codeMatch) return codeMatch[1];

  const htmlMatch = text.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) return htmlMatch[0];

  const tagCount = (text.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length;
  if (tagCount >= 3) {
    const firstTag = text.indexOf('<');
    if (firstTag >= 0) return text.substring(firstTag);
  }

  return null;
}

// Close context menu on click outside
document.addEventListener('click', () => {
  if (contextMenu.value.show) {
    closeContextMenu();
  }
});
</script>
