<template>
  <div class="layer-tree h-full overflow-y-auto">
    <div class="p-4 border-b border-gray-700 flex items-center justify-between">
      <h3 class="text-white font-semibold">图层</h3>
      <button
        @click="expandAll"
        class="p-1 hover:bg-gray-700 rounded text-xs text-gray-400"
        title="全部展开"
      >
        展开
      </button>
    </div>

    <div class="p-2">
      <div v-if="treeData.length === 0" class="text-gray-500 text-sm p-4">
        画布中没有元素
      </div>
      <div v-else class="space-y-0.5">
        <LayerTreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :depth="0"
          :selected-id="selectedElementId"
          @select="handleSelect"
          @toggle-visibility="handleToggleVisibility"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import LayerTreeNode from './LayerTreeNode.vue';

interface TreeNode {
  id: string;
  tagName: string;
  label: string;
  element: HTMLElement;
  children: TreeNode[];
  visible: boolean;
}

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const treeData = ref<TreeNode[]>([]);
const visibilityMap = ref(new Map<string, boolean>());
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const selectedElementId = computed(() => {
  const el = editorStore.selectedElement;
  if (!el) return '';
  return (el as any).dataset?.elementId || el.id || '';
});

function generateNodeId(el: HTMLElement): string {
  if (!el.id && !(el as any).dataset?.elementId) {
    el.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
  return el.id;
}

function buildTree(parent: Element): TreeNode[] {
  const children: TreeNode[] = [];
  for (const child of Array.from(parent.children)) {
    const el = child as HTMLElement;
    if (el.nodeType !== 1) continue;
    const nodeId = generateNodeId(el);
    children.push({
      id: nodeId,
      tagName: el.tagName,
      label: getElementLabel(el),
      element: el,
      children: buildTree(el),
      visible: visibilityMap.value.get(nodeId) ?? true,
    });
  }
  return children;
}

function refreshTree() {
  const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
  if (frame?.contentDocument) {
    const container = frame.contentDocument.querySelector('.page-container');
    if (container) {
      treeData.value = buildTree(container);
    }
  }
}

function scheduleRefresh() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(refreshTree, 300);
}

function setupObserver() {
  const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
  if (!frame?.contentDocument) return;
  const container = frame.contentDocument.querySelector('.page-container');
  if (!container) return;
  observer = new MutationObserver(() => scheduleRefresh());
  observer.observe(container, { childList: true, subtree: true, attributes: true });
}

function expandAll() {
  refreshTree();
}

function handleSelect(node: TreeNode) {
  editorStore.selectElement(node.element);
  editorStore.updateSelectedElementInfo(node.element);
  const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
  if (frame?.contentDocument) {
    const prev = frame.contentDocument.querySelector('.selected');
    if (prev) prev.classList.remove('selected');
    node.element.classList.add('selected');
  }
}

function handleToggleVisibility(node: TreeNode) {
  const newVisible = !node.visible;
  visibilityMap.value.set(node.id, newVisible);
  visibilityMap.value = new Map(visibilityMap.value);
  node.element.style.display = newVisible ? '' : 'none';
  refreshTree();
}

function getElementLabel(element: HTMLElement): string {
  if (element.id && !element.id.startsWith('node-')) return `#${element.id}`;
  const cls = typeof element.className === 'string' ? element.className.trim().split(/\s+/).find(c => c && c !== 'selected' && c !== 'hovered' && c !== 'page-container') : '';
  if (cls) return `.${cls}`;
  const text = element.textContent?.trim().substring(0, 30);
  if (text && element.children.length === 0) return text;
  return element.tagName.toLowerCase();
}

watch(() => projectStore.currentPageId, () => {
  if (observer) observer.disconnect();
  setTimeout(() => { refreshTree(); setupObserver(); }, 200);
});

onMounted(() => {
  setTimeout(() => { refreshTree(); setupObserver(); }, 300);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>
