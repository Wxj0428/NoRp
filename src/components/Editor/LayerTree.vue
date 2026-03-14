<template>
  <div class="layer-tree h-full overflow-y-auto">
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <h3 class="text-white font-semibold">图层</h3>
      <button
        @click="refreshTree"
        class="p-1 hover:bg-gray-700 rounded"
        title="刷新"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <div class="p-2">
      <div v-if="elements.length === 0" class="text-gray-500 text-sm p-4">
        画布中没有元素
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="element in elements"
          :key="element.id"
          @click="selectElement(element)"
          @mouseenter="hoverElement(element)"
          @mouseleave="unhoverElement(element)"
          :class="[
            'flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm',
            'hover:bg-gray-700',
            { 'bg-blue-600': isSelected(element) }
          ]"
        >
          <span class="text-gray-400">
            {{ getElementIcon(element.tagName) }}
          </span>
          <span :class="isSelected(element) ? 'text-white' : 'text-gray-300'">
            {{ getElementLabel(element) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEditorStore } from '@/stores/editor';

const editorStore = useEditorStore();

const elements = ref<HTMLElement[]>([]);

onMounted(() => {
  refreshTree();
});

function refreshTree() {
  const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
  if (frame?.contentDocument) {
    const container = frame.contentDocument.querySelector('.page-container');
    if (container) {
      elements.value = Array.from(container.children) as HTMLElement[];
    }
  }
}

function selectElement(element: HTMLElement) {
  editorStore.selectElement(element);
}

function hoverElement(element: HTMLElement) {
  element.classList.add('hovered');
}

function unhoverElement(element: HTMLElement) {
  element.classList.remove('hovered');
}

function isSelected(element: HTMLElement): boolean {
  return editorStore.selectedElement === element;
}

function getElementIcon(tagName: string): string {
  const icons: Record<string, string> = {
    DIV: '▢',
    BUTTON: '⚙',
    INPUT: '⌨',
    IMG: '🖼',
    P: '¶',
    H1: 'H₁',
    H2: 'H₂',
    H3: 'H₃',
    SPAN: 'a',
    A: '🔗'
  };
  return icons[tagName] || '◻';
}

function getElementLabel(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.className) {
    const classes = typeof element.className === 'string'
      ? element.className.split(' ')[0]
      : '';
    return `.${classes}`;
  }
  return element.tagName.toLowerCase();
}
</script>
