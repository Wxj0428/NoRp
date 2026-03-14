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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useProjectStore } from '@/stores/project';
import type { Page } from '@/types';

const projectStore = useProjectStore();

const editingPageId = ref<string | null>(null);
const editingName = ref('');
const editInput = ref<HTMLInputElement>();

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  page: null as Page | null,
  index: -1
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

// Start renaming
function renamePage(page: any) {
  editingPageId.value = page.id;
  editingName.value = page.name;
  nextTick(() => {
    editInput.value?.focus();
    editInput.value?.select();
  });
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

// Close context menu on click outside
document.addEventListener('click', () => {
  if (contextMenu.value.show) {
    closeContextMenu();
  }
});
</script>
