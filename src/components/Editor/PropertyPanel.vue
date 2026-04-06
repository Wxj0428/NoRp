<template>
  <div class="property-panel h-full overflow-y-auto">
    <div class="p-4 border-b border-gray-700">
      <h3 class="text-white font-semibold">属性面板</h3>
    </div>

    <div v-if="!selectedElement" class="p-4 text-gray-400 text-sm">
      请选择一个元素以编辑其属性
    </div>

    <div v-else class="p-4 space-y-4">
      <!-- Element Info -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">元素</label>
        <div class="bg-gray-900 rounded p-2">
          <code class="text-blue-400 text-sm">{{ selectedElement.tagName.toLowerCase() }}</code>
          <div v-if="selectedElement.id" class="text-gray-400 text-xs mt-1">
            #{{ selectedElement.id }}
          </div>
          <div v-if="selectedElement.className" class="text-gray-400 text-xs mt-1">
            .{{ selectedElement.className }}
          </div>
        </div>
      </div>

      <!-- Text Content -->
      <div v-if="isTextEditable" class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">文本内容</label>
        <textarea
          v-model="textContent"
          @input="updateTextContent"
          rows="3"
          class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white resize-none focus:outline-none focus:border-blue-500"
          :placeholder="'输入文本内容...'"
        ></textarea>
      </div>

      <!-- Layout -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">布局</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">宽度</label>
            <input
              v-model="styles.width"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="auto"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">高度</label>
            <input
              v-model="styles.height"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="auto"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">内边距</label>
            <input
              v-model="styles.padding"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">外边距</label>
            <input
              v-model="styles.margin"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <!-- Position & Overflow -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">定位</label>
        <div>
          <label class="text-xs text-gray-500">position</label>
          <select
            v-model="styles.position"
            @change="updateStyle"
            class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          >
            <option value="static">static</option>
            <option value="relative">relative</option>
            <option value="absolute">absolute</option>
            <option value="fixed">fixed</option>
            <option value="sticky">sticky</option>
          </select>
        </div>
        <div v-if="styles.position !== 'static'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">top</label>
            <input
              v-model="styles.top"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">left</label>
            <input
              v-model="styles.left"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">right</label>
            <input
              v-model="styles.right"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">bottom</label>
            <input
              v-model="styles.bottom"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">z-index</label>
            <input
              v-model="styles.zIndex"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">overflow</label>
            <select
              v-model="styles.overflow"
              @change="updateStyle"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            >
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
              <option value="scroll">scroll</option>
              <option value="auto">auto</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-500">opacity: {{ styles.opacity }}</label>
          <input
            v-model="styles.opacity"
            @input="updateStyle"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
          />
        </div>
      </div>

      <!-- Typography -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">文字</label>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">字号</label>
              <input
                v-model="styles.fontSize"
                @input="updateStyle"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">字体粗细</label>
              <select
                v-model="styles.fontWeight"
                @change="updateStyle"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="normal">正常</option>
                <option value="500">中等</option>
                <option value="600">半粗</option>
                <option value="700">粗体</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500">font-family</label>
            <input
              v-model="styles.fontFamily"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="sans-serif"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">行高</label>
              <input
                v-model="styles.lineHeight"
                @input="updateStyle"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">字间距</label>
              <input
                v-model="styles.letterSpacing"
                @input="updateStyle"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500">对齐方式</label>
            <select
              v-model="styles.textAlign"
              @change="updateStyle"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Colors -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">颜色</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500 w-20">背景色</label>
            <input
              v-model="styles.backgroundColor"
              @input="updateStyle"
              type="color"
              class="w-8 h-8 rounded cursor-pointer"
            />
            <input
              v-model="styles.backgroundColor"
              @input="updateStyle"
              type="text"
              class="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500 w-20">文字颜色</label>
            <input
              v-model="styles.color"
              @input="updateStyle"
              type="color"
              class="w-8 h-8 rounded cursor-pointer"
            />
            <input
              v-model="styles.color"
              @input="updateStyle"
              type="text"
              class="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <!-- Border -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">边框</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500">边框宽度</label>
            <input
              v-model="styles.borderWidth"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">圆角</label>
            <input
              v-model="styles.borderRadius"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-500 w-20">边框颜色</label>
          <input
            v-model="styles.borderColor"
            @input="updateStyle"
            type="color"
            class="w-8 h-8 rounded cursor-pointer"
          />
          <input
            v-model="styles.borderColor"
            @input="updateStyle"
            type="text"
            class="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          />
        </div>
      </div>

      <!-- Effects -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">效果</label>
        <div class="space-y-2">
          <div>
            <label class="text-xs text-gray-500">box-shadow</label>
            <input
              v-model="styles.boxShadow"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="0 2px 4px rgba(0,0,0,0.1)"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">transform</label>
            <input
              v-model="styles.transform"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="translateX(0) scale(1)"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">transition</label>
            <input
              v-model="styles.transition"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="all 0.3s ease"
            />
          </div>
        </div>
      </div>

      <!-- Flex/Grid Layout -->
      <div v-if="styles.display === 'flex' || styles.display === 'inline-flex' || styles.display === 'grid'" class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">
          {{ styles.display === 'grid' ? '网格布局' : '弹性布局' }}
        </label>

        <template v-if="styles.display !== 'grid'">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">flex-direction</label>
              <select
                v-model="styles.flexDirection"
                @change="updateStyle"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="">默认</option>
                <option value="row">row</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column">column</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500">flex-wrap</label>
              <select
                v-model="styles.flexWrap"
                @change="updateStyle"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="">默认</option>
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">justify-content</label>
              <select
                v-model="styles.justifyContent"
                @change="updateStyle"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="">默认</option>
                <option value="flex-start">start</option>
                <option value="center">center</option>
                <option value="flex-end">end</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-500">align-items</label>
              <select
                v-model="styles.alignItems"
                @change="updateStyle"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="">默认</option>
                <option value="flex-start">start</option>
                <option value="center">center</option>
                <option value="flex-end">end</option>
                <option value="stretch">stretch</option>
                <option value="baseline">baseline</option>
              </select>
            </div>
          </div>
        </template>

        <template v-if="styles.display === 'grid'">
          <div>
            <label class="text-xs text-gray-500">grid-template-columns</label>
            <input
              v-model="styles.gridTemplateColumns"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="1fr 1fr 1fr"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">grid-template-rows</label>
            <input
              v-model="styles.gridTemplateRows"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              placeholder="auto"
            />
          </div>
        </template>

        <div>
          <label class="text-xs text-gray-500">gap</label>
          <input
            v-model="styles.gap"
            @input="updateStyle"
            type="text"
            class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            placeholder="0px"
          />
        </div>
      </div>

      <!-- Display -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">显示</label>
        <select
          v-model="styles.display"
          @change="updateStyle"
          class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
        >
          <option value="block">块级 (block)</option>
          <option value="inline">内联 (inline)</option>
          <option value="inline-block">内联块 (inline-block)</option>
          <option value="flex">弹性 (flex)</option>
          <option value="inline-flex">内联弹性 (inline-flex)</option>
          <option value="grid">网格 (grid)</option>
          <option value="none">隐藏 (none)</option>
        </select>
      </div>

      <!-- Attributes -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">属性</label>
        <div class="space-y-2">
          <div v-if="isLinkElement">
            <div>
              <label class="text-xs text-gray-500">href</label>
              <input
                v-model="attributes.href"
                @input="updateAttribute('href')"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                placeholder="https://"
              />
            </div>
          </div>
          <div v-if="isImageElement">
            <div>
              <label class="text-xs text-gray-500">src</label>
              <input
                v-model="attributes.src"
                @input="updateAttribute('src')"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                placeholder="image url"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500">alt</label>
              <input
                v-model="attributes.alt"
                @input="updateAttribute('alt')"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
          <div v-if="isInputElement">
            <div>
              <label class="text-xs text-gray-500">placeholder</label>
              <input
                v-model="attributes.placeholder"
                @input="updateAttribute('placeholder')"
                type="text"
                class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-4 border-t border-gray-700 space-y-2">
        <button
          @click="handleDelete"
          class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
        >
          删除元素
        </button>
        <div class="text-xs text-gray-500 text-center">
          快捷键: Delete 或 Backspace
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import { useToastStore } from '@/stores/toast';

const editorStore = useEditorStore();
const toast = useToastStore();

const selectedElement = computed(() => editorStore.selectedElement);

const isLinkElement = computed(() => {
  const tag = selectedElement.value?.tagName?.toLowerCase();
  return tag === 'a';
});

const isImageElement = computed(() => {
  const tag = selectedElement.value?.tagName?.toLowerCase();
  return tag === 'img';
});

const isInputElement = computed(() => {
  const tag = selectedElement.value?.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea';
});

const isTextEditable = computed(() => {
  const tag = selectedElement.value?.tagName?.toLowerCase();
  if (!tag) return false;
  // 可编辑文本内容的元素
  const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'li', 'td', 'th', 'div', 'figcaption', 'blockquote', 'strong', 'em', 'b', 'i', 'small', 'sub', 'sup'];
  return textTags.includes(tag);
});

const textContent = ref('');

const styles = ref<Record<string, string>>({
  width: '',
  height: '',
  left: '',
  top: '',
  right: '',
  bottom: '',
  padding: '',
  margin: '',
  position: 'static',
  zIndex: '',
  overflow: '',
  opacity: '1',
  fontSize: '',
  fontWeight: '',
  fontFamily: '',
  lineHeight: '',
  letterSpacing: '',
  textAlign: '',
  backgroundColor: '#ffffff',
  color: '#000000',
  borderWidth: '',
  borderRadius: '',
  borderColor: '#000000',
  display: 'block',
  boxShadow: '',
  transform: '',
  transition: '',
  flexDirection: '',
  flexWrap: '',
  justifyContent: '',
  alignItems: '',
  gap: '',
  gridTemplateColumns: '',
  gridTemplateRows: '',
});

const attributes = ref<Record<string, string>>({
  href: '',
  src: '',
  alt: '',
  placeholder: '',
});

// Update styles when element is selected
watch(
  selectedElement,
  (element) => {
    if (element) {
      const cs = element.style;
      styles.value = {
        width: cs.width || '',
        height: cs.height || '',
        left: cs.left || '',
        top: cs.top || '',
        right: cs.right || '',
        bottom: cs.bottom || '',
        padding: cs.padding || '',
        margin: cs.margin || '',
        position: cs.position || 'static',
        zIndex: cs.zIndex || '',
        overflow: cs.overflow || '',
        opacity: cs.opacity || '1',
        fontSize: cs.fontSize || '',
        fontWeight: cs.fontWeight || '',
        fontFamily: cs.fontFamily || '',
        lineHeight: cs.lineHeight || '',
        letterSpacing: cs.letterSpacing || '',
        textAlign: cs.textAlign || '',
        backgroundColor: rgbToHex(cs.backgroundColor) || '#ffffff',
        color: rgbToHex(cs.color) || '#000000',
        borderWidth: cs.borderWidth || '',
        borderRadius: cs.borderRadius || '',
        borderColor: rgbToHex(cs.borderColor) || '#000000',
        display: cs.display || 'block',
        boxShadow: cs.boxShadow || '',
        transform: cs.transform || '',
        transition: cs.transition || '',
        flexDirection: cs.flexDirection || '',
        flexWrap: cs.flexWrap || '',
        justifyContent: cs.justifyContent || '',
        alignItems: cs.alignItems || '',
        gap: cs.gap || '',
        gridTemplateColumns: (cs as any).gridTemplateColumns || '',
        gridTemplateRows: (cs as any).gridTemplateRows || '',
      };
      // Read HTML attributes
      attributes.value = {
        href: element.getAttribute('href') || '',
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        placeholder: element.getAttribute('placeholder') || '',
      };
      // Read text content (only for direct text, not child elements)
      if (element.children.length === 0) {
        textContent.value = element.textContent || '';
      } else {
        textContent.value = '';
      }
    }
  },
  { immediate: true }
);

function updateStyle() {
  if (!selectedElement.value) return;

  const element = selectedElement.value;
  const s = styles.value;

  // Map CSS property names (camelCase → CSS camelCase for Object.assign)
  const styleUpdates: Record<string, string> = {};
  for (const [key, value] of Object.entries(s)) {
    if (!value) continue; // Skip empty values
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    styleUpdates[key] = value;
  }

  Object.assign(element.style, styleUpdates);
  persistCanvasToStore();
}

function updateTextContent() {
  if (!selectedElement.value) return;
  const el = selectedElement.value;

  // 只更新没有子元素的元素的文本内容
  if (el.children.length === 0) {
    el.textContent = textContent.value;
    // 同步更新页面 HTML 到 store
    const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      const container = frame.contentDocument.querySelector('.page-container');
      if (container) {
        const projectStore = useProjectStore();
        projectStore.updatePageHtml(container.innerHTML);
      }
    }
  }
}

function updateAttribute(name: string) {
  if (!selectedElement.value) return;
  const value = attributes.value[name];
  if (value) {
    selectedElement.value.setAttribute(name, value);
  } else {
    selectedElement.value.removeAttribute(name);
  }
  persistCanvasToStore();
}

// Debounced persist: sync canvas DOM → projectStore + editorStore (for undo/redo)
let stylePersistTimer: ReturnType<typeof setTimeout> | null = null;
function persistCanvasToStore() {
  if (stylePersistTimer) clearTimeout(stylePersistTimer);
  stylePersistTimer = setTimeout(() => {
    const frame = document.querySelector('.canvas-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      const container = frame.contentDocument.querySelector('.page-container');
      if (container) {
        const projectStore = useProjectStore();
        projectStore.updatePageHtml(container.innerHTML);
        const editorStore = useEditorStore();
        if (projectStore.currentPageId) {
          editorStore.pushSnapshot(projectStore.currentPageId, container.innerHTML);
        }
      }
    }
  }, 500);
}

function handleDelete() {
  if (!selectedElement.value) return;

  window.dispatchEvent(new CustomEvent('delete-element', {
    detail: { element: selectedElement.value }
  }));
}

function rgbToHex(rgb: string): string {
  if (!rgb || rgb.startsWith('#')) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  const [r, g, b] = match.map(Number);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
</script>
