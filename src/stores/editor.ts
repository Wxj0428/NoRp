import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HistoryAction, ElementData, AIActionType } from '../types';

export const useEditorStore = defineStore('editor', () => {
  // State
  const selectedElement = ref<HTMLElement | null>(null);
  const selectedElementId = ref<string | null>(null);
  const hoveredElement = ref<HTMLElement | null>(null);
  const history = ref<HistoryAction[]>([]);
  const historyIndex = ref(-1);
  const clipboard = ref<ElementData | null>(null);
  const pendingInsert = ref<string | null>(null);
  const pendingAction = ref<{ type: AIActionType; html: string; pageId?: string } | null>(null);

  // Selected element serialization for AI context
  const selectedElementHtml = ref<string | null>(null);
  const selectedElementTag = ref<string | null>(null);

  // Canvas settings
  const zoom = ref(1);
  const gridEnabled = ref(true);
  const gridSize = ref(10);
  const snapToGrid = ref(true);
  const showRulers = ref(true);

  // Getters
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  // Actions
  function selectElement(element: HTMLElement | null) {
    selectedElement.value = element;
  }

  function updateSelectedElementInfo(element: HTMLElement | null) {
    if (element) {
      selectedElementHtml.value = element.outerHTML.substring(0, 4000);
      const tag = element.tagName.toLowerCase();
      const cls = element.className ? '.' + String(element.className).trim().split(/\s+/).join('.') : '';
      const id = element.id ? '#' + element.id : '';
      selectedElementTag.value = `${tag}${id}${cls}`;
    } else {
      selectedElementHtml.value = null;
      selectedElementTag.value = null;
    }
  }

  function hoverElement(element: HTMLElement | null) {
    hoveredElement.value = element;
  }

  function pushHistory(action: HistoryAction) {
    // Remove any future history if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    history.value.push(action);
    historyIndex.value++;
  }

  function undo(): HistoryAction | null {
    if (!canUndo.value) return null;
    historyIndex.value--;
    return history.value[historyIndex.value];
  }

  function redo(): HistoryAction | null {
    if (!canRedo.value) return null;
    historyIndex.value++;
    return history.value[historyIndex.value];
  }

  function copy(elementData: ElementData) {
    clipboard.value = elementData;
  }

  function paste(): ElementData | null {
    return clipboard.value;
  }

  function clearClipboard() {
    clipboard.value = null;
  }

  function setZoom(newZoom: number) {
    zoom.value = Math.max(0.1, Math.min(3, newZoom));
  }

  function resetView() {
    zoom.value = 1;
  }

  function clearHistory() {
    history.value = [];
    historyIndex.value = -1;
  }

  function setPendingInsert(html: string) {
    pendingInsert.value = html;
  }

  function clearPendingInsert() {
    pendingInsert.value = null;
  }

  function setPendingAction(type: AIActionType, html: string, pageId?: string) {
    pendingAction.value = { type, html, pageId };
  }

  function clearPendingAction() {
    pendingAction.value = null;
  }

  function getSelectedElementId(): string | null {
    return selectedElementId.value;
  }

  return {
    selectedElement,
    selectedElementId,
    hoveredElement,
    history,
    historyIndex,
    clipboard,
    pendingInsert,
    pendingAction,
    selectedElementHtml,
    selectedElementTag,
    zoom,
    gridEnabled,
    gridSize,
    snapToGrid,
    showRulers,
    canUndo,
    canRedo,
    selectElement,
    updateSelectedElementInfo,
    hoverElement,
    pushHistory,
    undo,
    redo,
    copy,
    paste,
    clearClipboard,
    setZoom,
    resetView,
    clearHistory,
    setPendingInsert,
    clearPendingInsert,
    setPendingAction,
    clearPendingAction,
    getSelectedElementId
  }
});
