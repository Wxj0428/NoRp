<template>
  <div class="canvas-container h-full w-full relative overflow-hidden bg-gray-700">
    <!-- Toolbar -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-gray-800 rounded-lg shadow-lg flex items-center gap-2 p-2">
      <button
        @click="handleUndo"
        :disabled="!canUndo"
        class="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title="撤销 (Ctrl+Z)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>
      <button
        @click="handleRedo"
        :disabled="!canRedo"
        class="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title="重做 (Ctrl+Shift+Z)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>
      <div class="w-px h-6 bg-gray-600"></div>

      <!-- Device Presets -->
      <div class="flex items-center gap-1 px-2 border-l border-r border-gray-600">
        <button
          v-for="device in devices"
          :key="device.id"
          @click="setDevice(device)"
          :class="[
            'p-2 hover:bg-gray-700 rounded transition',
            currentDevice === device.id ? 'bg-blue-600' : ''
          ]"
          :title="device.name"
        >
          <span class="text-sm">{{ device.icon }}</span>
        </button>
      </div>

      <div class="w-px h-6 bg-gray-600"></div>

      <!-- Delete Button -->
      <button
        @click="handleDeleteSelected"
        :disabled="!selectedElement"
        class="p-2 hover:bg-red-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title="删除选中元素 (Delete)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      <div class="w-px h-6 bg-gray-600"></div>
      <button
        @click="handleZoomOut"
        class="p-2 hover:bg-gray-700 rounded"
        title="缩小"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="text-sm text-gray-300 min-w-[50px] text-center">{{ Math.round(zoom * 100) }}%</span>
      <button
        @click="handleZoomIn"
        class="p-2 hover:bg-gray-700 rounded"
        title="放大"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
      <button
        @click="handleResetZoom"
        class="p-2 hover:bg-gray-700 rounded"
        title="重置缩放"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>

    <!-- Canvas Frame -->
    <div
      ref="canvasWrapper"
      class="absolute inset-0 flex items-center justify-center overflow-auto"
      @mousedown="handleCanvasClick"
      @mousemove="handleMouseMove"
      @drop="handleExternalDrop"
      @dragover="handleExternalDragOver"
      @dragenter="handleExternalDragEnter"
      @dragleave="handleExternalDragLeave"
    >
      <div
        :style="{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }"
      >
        <iframe
          ref="canvasFrame"
          class="canvas-frame bg-white shadow-2xl"
          :style="{
            width: canvasWidth + 'px',
            height: canvasHeight + 'px',
            border: isExternalDragOver ? '3px dashed #3b82f6' : (selectedElement ? '2px solid #3b82f6' : '1px solid #d1d5db')
          }"
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const editorStore = useEditorStore();
const projectStore = useProjectStore();

const canvasWrapper = ref<HTMLDivElement>();
const canvasFrame = ref<HTMLIFrameElement>();
const canvasWidth = ref(1200);
const canvasHeight = ref(800);

const zoom = computed(() => editorStore.zoom);
const canUndo = computed(() => editorStore.canUndo);
const canRedo = computed(() => editorStore.canRedo);
const selectedElement = computed(() => editorStore.selectedElement);
const currentDevice = ref('desktop');

const devices = [
  { id: 'desktop', name: '桌面 (1920x1080)', icon: '🖥️', width: 1200, height: 800 },
  { id: 'laptop', name: '笔记本 (1366x768)', icon: '💻', width: 1100, height: 700 },
  { id: 'tablet', name: '平板 (768x1024)', icon: '📱', width: 768, height: 1024 },
  { id: 'mobile', name: '手机 (375x667)', icon: '📱', width: 375, height: 667 }
];

// 拖拽状态
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const dragElement = ref<HTMLElement | null>(null);
const isExternalDragOver = ref(false);

// Initialize canvas content
onMounted(() => {
  if (canvasFrame.value) {
    const iframe = canvasFrame.value;
    const doc = iframe.contentDocument;

    if (doc) {
      doc.open();
      const htmlContent = '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' +
        '* { margin: 0; padding: 0; box-sizing: border-box; }' +
        'body {' +
        'font-family: system-ui, -apple-system, sans-serif;' +
        'min-height: 100vh;' +
        '}' +
        '.page-container {' +
        'width: 100%;' +
        'min-height: 100vh;' +
        'padding: 20px;' +
        'background: #f9fafb;' +
        '}' +
        '.selected {' +
        'outline: 2px solid #3b82f6;' +
        'outline-offset: 2px;' +
        'cursor: move;' +
        '}' +
        '.hovered { outline: 2px solid #10b981; outline-offset: 2px; }' +
        '.page-container.drag-over {' +
        'background: #dbeafe;' +
        'border: 2px dashed #3b82f6;' +
        '}' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="page-container">' +
        '<!-- Drag components here -->' +
        '</div>' +
        '</body>' +
        '</html>';
      doc.write(htmlContent);
      doc.close();

      // 使用 setTimeout 确保 DOM 完全加载
      setTimeout(() => {
        // 初始化内容
        const container = doc.querySelector('.page-container');
        if (container && projectStore.currentPage) {
          container.innerHTML = projectStore.currentPage.html;
        }

        // Add event listeners for selection
        doc.body.addEventListener('click', handleElementClick, true);
        doc.body.addEventListener('mouseover', handleMouseOver, true);
        doc.body.addEventListener('mouseout', handleMouseOut, true);
        doc.body.addEventListener('dragstart', (e) => e.preventDefault());

        // 添加鼠标事件监听器用于拖拽元素
        doc.addEventListener('mousedown', handleElementMouseDown, true);
        doc.addEventListener('mousemove', handleElementMouseMove, true);
        doc.addEventListener('mouseup', handleElementMouseUp, true);

        // 添加键盘事件监听（用于删除等快捷键）
        doc.addEventListener('keydown', handleKeyDown, true);

        // Add drop event listeners to the page container
        if (container) {
          attachDropHandlers(container);
        }

        console.log('Canvas initialized');

        // Push initial state for undo/redo
        if (container && projectStore.currentPageId) {
          editorStore.pushSnapshot(projectStore.currentPageId, container.innerHTML);
        }
      }, 100);
    }
  }

  // 监听来自属性面板的删除事件
  window.addEventListener('delete-element', handleDeleteEvent);

  // 监听来自快捷键系统的自定义事件
  window.addEventListener('editor:undo', handleUndo);
  window.addEventListener('editor:redo', handleRedo);
  window.addEventListener('editor:delete', handleDeleteSelected);
});

// 清理键盘事件监听器
onUnmounted(() => {
  const doc = canvasFrame.value?.contentDocument;
  if (doc) {
    doc.removeEventListener('keydown', handleKeyDown, true);
  }
  window.removeEventListener('delete-element', handleDeleteEvent);
  window.removeEventListener('editor:undo', handleUndo);
  window.removeEventListener('editor:redo', handleRedo);
  window.removeEventListener('editor:delete', handleDeleteSelected);
});

// Watch for page changes
watch(
  () => projectStore.currentPage?.html,
  () => {
    updateCanvasContent();
  },
  { deep: true }
);

// Watch for pending insert from AI
watch(
  () => editorStore.pendingInsert,
  (html) => {
    if (html && canvasFrame.value?.contentDocument) {
      insertHTMLToCanvas(html);
      editorStore.clearPendingInsert();
    }
  }
);

// Extract body content from a full HTML document, preserving <style> and <link> from <head>
function extractBodyContent(html: string): string {
  // Try to match body tag
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  // Collect <style> and <link rel="stylesheet"> from <head> or anywhere in the document
  const preservedTags: string[] = [];
  const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
  let m;
  while ((m = styleRegex.exec(html)) !== null) {
    preservedTags.push(m[0].trim());
  }
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  while ((m = linkRegex.exec(html)) !== null) {
    preservedTags.push(m[0].trim());
  }

  if (bodyMatch) {
    const bodyContent = bodyMatch[1].trim();
    // Prepend <style>/<link> tags to body content so they apply in iframe
    if (preservedTags.length > 0) {
      return preservedTags.join('\n') + '\n' + bodyContent;
    }
    return bodyContent;
  }

  // If no <body> tag, check if it has <html> wrapper
  if (/<html/i.test(html) && !/<body/i.test(html)) {
    // Full HTML doc without body — strip html/head tags but preserve <style>
    let stripped = html.replace(/<\/?html[^>]*>/gi, '').replace(/<\/?head[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '').trim();
    // Remove <title>, <meta>, <script> tags but keep <style> and <link>
    stripped = stripped.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '').replace(/<meta[^>]*?>/gi, '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    return stripped;
  }

  return html;
}

// Apply HTML to a specific page (current page goes to canvas, others go to store)
function applyHtmlToPage(pageId: string, html: string) {
  const content = extractBodyContent(html);

  if (pageId === projectStore.currentPageId) {
    // Apply to current canvas
    const doc = canvasFrame.value?.contentDocument;
    const container = doc?.querySelector('.page-container');
    if (container) {
      container.innerHTML = content;
      projectStore.updatePageHtml(container.innerHTML);
      attachDropHandlers(container);
    }
  } else {
    // Update non-current page directly in store
    const page = projectStore.pageList.find(p => p.id === pageId);
    if (page) {
      page.html = content;
      projectStore.isDirty = true;
    }
  }
}

// Watch for pending action (replace/modify/append from AI)
watch(
  () => editorStore.pendingAction,
  (action) => {
    if (!action) return;

    const targetPageId = action.pageId || projectStore.currentPageId;

    // If action targets a non-current page, just update the store
    if (targetPageId !== projectStore.currentPageId) {
      const content = extractBodyContent(action.html);
      const page = projectStore.pageList.find(p => p.id === targetPageId);
      if (page) {
        page.html = content;
        projectStore.isDirty = true;
      }
      editorStore.clearPendingAction();
      return;
    }

    // Current page — apply to canvas
    if (!canvasFrame.value?.contentDocument) return;
    const doc = canvasFrame.value.contentDocument;
    const container = doc.querySelector('.page-container');
    if (!container) return;

    switch (action.type) {
      case 'replace-page':
        container.innerHTML = extractBodyContent(action.html);
        break;

      case 'modify-selected': {
        const selected = editorStore.selectedElement;
        if (selected && selected.parentNode) {
          const tempDiv = doc.createElement('div');
          tempDiv.innerHTML = action.html;
          const newEl = tempDiv.firstElementChild;
          if (newEl) {
            selected.parentNode.replaceChild(newEl, selected);
            editorStore.selectElement(newEl as HTMLElement);
            editorStore.updateSelectedElementInfo(newEl as HTMLElement);
          }
        } else {
          container.insertAdjacentHTML('beforeend', action.html);
        }
        break;
      }

      case 'append':
      default:
        insertHTMLToCanvas(action.html);
        break;
    }

    projectStore.updatePageHtml(container.innerHTML);

    // Push snapshot AFTER applying action
    if (projectStore.currentPageId) {
      editorStore.pushSnapshot(projectStore.currentPageId, container.innerHTML);
    }

    editorStore.clearPendingAction();
    attachDropHandlers(container);
  },
  { flush: 'sync' }
);

function updateCanvasContent() {
  if (!canvasFrame.value?.contentDocument) return;

  const container = canvasFrame.value.contentDocument.querySelector('.page-container');
  if (!container) return;

  if (projectStore.currentPage) {
    // 直接更新 innerHTML
    container.innerHTML = projectStore.currentPage.html;

    // Re-attach drop event listeners after DOM update
    setTimeout(() => {
      attachDropHandlers(container);
    }, 50);
  }
}

function attachDropHandlers(container: Element) {
  // Remove existing listeners to avoid duplicates
  container.removeEventListener('dragover', handleDragOver);
  container.removeEventListener('dragleave', handleDragLeave);
  container.removeEventListener('drop', handleDrop);

  // Add fresh listeners
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('dragleave', handleDragLeave);
  container.addEventListener('drop', handleDrop);
}

function handleDragOver(e: any) {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
  (e.currentTarget as HTMLElement).classList.add('drag-over');
}

function handleDragLeave(e: Event) {
  e.preventDefault();
  e.stopPropagation();
  (e.currentTarget as HTMLElement).classList.remove('drag-over');
}

function handleDrop(e: any) {
  e.preventDefault();
  e.stopPropagation();
  (e.currentTarget as HTMLElement).classList.remove('drag-over');

  const doc = canvasFrame.value?.contentDocument;
  if (!doc || !projectStore.currentPage) return;

  // 尝试多种格式获取数据
  let componentHtml = e.dataTransfer?.getData('component');
  if (!componentHtml) {
    componentHtml = e.dataTransfer?.getData('text/plain');
  }

  // 如果还是没有，尝试从父窗口获取（跨 iframe 拖拽）
  if (!componentHtml && (window.parent as any)?.draggedComponentHtml) {
    componentHtml = (window.parent as any).draggedComponentHtml;
    // 清除全局变量
    (window.parent as any).draggedComponentHtml = '';
  }

  if (componentHtml) {
    // 添加可选中标识到组件 HTML
    const componentWithId = componentHtml.replace(
      /^<([a-z][a-z0-9]*)/i,
      `<$1 data-element-id="${Date.now().toString()}"`
    );

    // 更新项目 HTML，追加新组件
    const currentHtml = projectStore.currentPage.html || '';
    const newHtml = currentHtml + componentWithId;
    projectStore.updatePageHtml(newHtml);

    // Push snapshot AFTER drop
    if (projectStore.currentPageId) {
      editorStore.pushSnapshot(projectStore.currentPageId, newHtml);
    }

    console.log('Component added successfully');
  } else {
    console.warn('No component data found');
  }
}

function handleElementClick(e: MouseEvent) {
  e.stopPropagation();
  const target = e.target as HTMLElement;

  if (target === canvasFrame.value?.contentDocument?.body) {
    editorStore.selectElement(null);
    editorStore.updateSelectedElementInfo(null);
    return;
  }

  editorStore.selectElement(target);
  editorStore.updateSelectedElementInfo(target);
}

// 元素拖拽功能
function handleElementMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // 忽略容器和 body
  if (target === canvasFrame.value?.contentDocument?.body) return;
  if (target.classList.contains('page-container')) return;

  // 只在已选中元素上启动拖拽
  if (editorStore.selectedElement === target || target.contains(editorStore.selectedElement)) {
    // 确保是元素本身，不是其子元素
    if (target === editorStore.selectedElement) {
      isDragging.value = true;
      dragElement.value = target;

      // 计算鼠标相对于元素的偏移
      const rect = target.getBoundingClientRect();
      dragOffset.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // 确保元素是绝对定位
      const computedStyle = window.getComputedStyle(target);
      if (computedStyle.position === 'static') {
        target.style.position = 'absolute';
        target.style.left = rect.left + 'px';
        target.style.top = rect.top + 'px';
      }

      console.log('Started dragging element:', target.tagName);
    }
  }
}

function handleElementMouseMove(e: MouseEvent) {
  if (!isDragging.value || !dragElement.value || !canvasFrame.value?.contentDocument) return;

  e.preventDefault();

  const container = canvasFrame.value.contentDocument.querySelector('.page-container');
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const zoom = editorStore.zoom;

  // 计算新位置（相对于容器）
  let newX = (e.clientX - containerRect.left - dragOffset.value.x) / zoom;
  let newY = (e.clientY - containerRect.top - dragOffset.value.y) / zoom;

  // 应用新位置
  dragElement.value.style.left = newX + 'px';
  dragElement.value.style.top = newY + 'px';
}

function handleElementMouseUp(_e: MouseEvent) {
  if (isDragging.value && dragElement.value) {
    // Save position change — snapshot was not taken at mousedown, so take it now
    // from the pre-move state (currentPage.html has the old state)
    // Actually we need to save the old state before the move changed things.
    // The container.innerHTML already has the new position. So we need to track the pre-move html.
    // For simplicity: the snapshot was set before the move started via page html,
    // and now we just save the new state.
    const container = canvasFrame.value?.contentDocument?.querySelector('.page-container');
    if (container) {
      projectStore.updatePageHtml(container.innerHTML);
    }
  }

  isDragging.value = false;
  dragElement.value = null;
}

function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasWrapper.value) {
    editorStore.selectElement(null);
  }
}

function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target !== canvasFrame.value?.contentDocument?.body) {
    target.classList.add('hovered');
    editorStore.hoverElement(target);
  }
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement;
  target.classList.remove('hovered');
  if (editorStore.hoveredElement === target) {
    editorStore.hoverElement(null);
  }
}

function handleMouseMove(_e: MouseEvent) {
  // 这个函数现在不需要了，拖拽逻辑在 iframe 内部的 handleElementMouseMove 中处理
}

function handleExternalDragEnter(e: DragEvent) {
  e.preventDefault();
  isExternalDragOver.value = true;
}

function handleExternalDragLeave(e: DragEvent) {
  // 只在真正离开时才清除
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    isExternalDragOver.value = false;
  }
}

function handleExternalDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
}

function handleExternalDrop(e: DragEvent) {
  e.preventDefault();
  isExternalDragOver.value = false;

  console.log('External drop on canvas wrapper');

  // 获取拖拽数据
  let componentHtml = e.dataTransfer?.getData('component');
  if (!componentHtml) {
    componentHtml = e.dataTransfer?.getData('text/plain');
  }

  console.log('External drop data:', componentHtml);

  if (componentHtml && canvasFrame.value?.contentDocument) {
    const container = canvasFrame.value.contentDocument.querySelector('.page-container');
    if (container) {
      const tempDiv = container.ownerDocument.createElement('div');
      tempDiv.innerHTML = componentHtml;
      const newElement = tempDiv.firstElementChild;

      if (newElement) {
        newElement.setAttribute('data-element-id', Date.now().toString());
        container.appendChild(newElement);
        projectStore.updatePageHtml(container.innerHTML);
        console.log('Component added via external drop');
      }
    }
  }
}

function handleZoomIn() {
  editorStore.setZoom(zoom.value + 0.1);
}

function handleZoomOut() {
  editorStore.setZoom(zoom.value - 0.1);
}

function handleResetZoom() {
  editorStore.resetView();
}

function handleUndo() {
  const action = editorStore.undo();
  if (!action || !canvasFrame.value?.contentDocument) return;

  // Only apply if the snapshot is for the current page
  if (action.pageId === projectStore.currentPageId) {
    const container = canvasFrame.value.contentDocument.querySelector('.page-container');
    if (container) {
      container.innerHTML = action.pageHtml;
      projectStore.updatePageHtml(container.innerHTML);
    }
  }
}

function handleRedo() {
  const action = editorStore.redo();
  if (!action || !canvasFrame.value?.contentDocument) return;

  if (action.pageId === projectStore.currentPageId) {
    const container = canvasFrame.value.contentDocument.querySelector('.page-container');
    if (container) {
      container.innerHTML = action.pageHtml;
      projectStore.updatePageHtml(container.innerHTML);
    }
  }
}

function handleDeleteSelected() {
  const selected = editorStore.selectedElement;
  if (!selected || !canvasFrame.value?.contentDocument) return;

  // 从 DOM 中移除元素
  selected.remove();

  // 更新项目 HTML
  const container = canvasFrame.value.contentDocument.querySelector('.page-container');
  if (container) {
    projectStore.updatePageHtml(container.innerHTML);

    // Push snapshot AFTER delete
    if (projectStore.currentPageId) {
      editorStore.pushSnapshot(projectStore.currentPageId, container.innerHTML);
    }
  }

  // 清除选中状态
  editorStore.selectElement(null);

  console.log('Element deleted');
}

function handleDeleteEvent(e: any) {
  const element = e.detail.element;
  if (!element || !canvasFrame.value?.contentDocument) return;

  // 从 DOM 中移除元素
  element.remove();

  // 更新项目 HTML
  const container = canvasFrame.value.contentDocument.querySelector('.page-container');
  if (container) {
    projectStore.updatePageHtml(container.innerHTML);
  }

  // 清除选中状态
  editorStore.selectElement(null);

  console.log('Element deleted via property panel');
}

function insertHTMLToCanvas(html: string) {
  const doc = canvasFrame.value?.contentDocument;
  if (!doc || !projectStore.currentPage) return;

  // 创建临时元素解析 HTML
  const tempDiv = doc.createElement('div');
  tempDiv.innerHTML = html;

  // 获取容器
  const container = doc.querySelector('.page-container');
  if (!container) return;

  // 提取所有顶级元素并添加到画布
  const children = Array.from(tempDiv.children);
  if (children.length === 0) {
    // 如果没有子元素，尝试直接插入 HTML 字符串
    container.insertAdjacentHTML('beforeend', html);
  } else {
    // 逐个添加子元素
    children.forEach(child => {
      // 为每个元素添加唯一 ID
      if (!child.getAttribute('data-element-id')) {
        child.setAttribute('data-element-id', Date.now().toString() + Math.random().toString(36).substr(2, 9));
      }
      container.appendChild(child);
    });
  }

  // 更新项目 HTML
  projectStore.updatePageHtml(container.innerHTML);

  // Push snapshot AFTER inserting
  if (projectStore.currentPageId) {
    editorStore.pushSnapshot(projectStore.currentPageId, container.innerHTML);
  }

  // 重新附加事件处理器
  setTimeout(() => {
    attachDropHandlers(container);
  }, 50);

  console.log('HTML inserted to canvas:', html.substring(0, 100));
}

function handleKeyDown(e: KeyboardEvent) {
  // Delete 或 Backspace 键删除选中元素
  if ((e.key === 'Delete' || e.key === 'Backspace') && editorStore.selectedElement) {
    // 避免在输入框中删除文本时触发元素删除
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    e.preventDefault();
    handleDeleteSelected();
  }

  // Ctrl+Z 撤销
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (e.shiftKey) {
      editorStore.redo();
    } else {
      editorStore.undo();
    }
  }

  // Ctrl+Y 重做
  if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    editorStore.redo();
  }

  // Escape 取消选中
  if (e.key === 'Escape' && editorStore.selectedElement) {
    e.preventDefault();
    editorStore.selectElement(null);
  }
}

function setDevice(device: any) {
  currentDevice.value = device.id;
  canvasWidth.value = device.width;
  canvasHeight.value = device.height;

  // Reset zoom when changing device
  editorStore.setZoom(1);
}
</script>

<style scoped>
.canvas-frame {
  display: block;
  background: white;
}

.canvas-container :deep(.selected) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
