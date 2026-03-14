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
          <div>
            <label class="text-xs text-gray-500">X</label>
            <input
              v-model="styles.left"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Y</label>
            <input
              v-model="styles.top"
              @input="updateStyle"
              type="text"
              class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <!-- Spacing -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">间距</label>
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

      <!-- Typography -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">文字</label>
        <div class="space-y-2">
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

      <!-- Display -->
      <div class="space-y-2">
        <label class="text-xs text-gray-400 uppercase tracking-wide">显示</label>
        <select
          v-model="styles.display"
          @change="updateStyle"
          class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
        >
          <option value="block">块级</option>
          <option value="inline">内联</option>
          <option value="inline-block">内联块</option>
          <option value="flex">弹性布局</option>
          <option value="grid">网格布局</option>
          <option value="none">隐藏</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '@/stores/editor';

const editorStore = useEditorStore();

const selectedElement = computed(() => editorStore.selectedElement);

const styles = ref({
  width: '',
  height: '',
  left: '',
  top: '',
  padding: '',
  margin: '',
  fontSize: '',
  fontWeight: '',
  textAlign: '',
  backgroundColor: '#ffffff',
  color: '#000000',
  borderWidth: '',
  borderRadius: '',
  borderColor: '#000000',
  display: 'block'
});

// Update styles when element is selected
watch(
  selectedElement,
  (element) => {
    if (element) {
      styles.value = {
        width: element.style.width || '',
        height: element.style.height || '',
        left: element.style.left || '',
        top: element.style.top || '',
        padding: element.style.padding || '',
        margin: element.style.margin || '',
        fontSize: element.style.fontSize || '',
        fontWeight: element.style.fontWeight || '',
        textAlign: element.style.textAlign || '',
        backgroundColor: rgbToHex(element.style.backgroundColor) || '#ffffff',
        color: rgbToHex(element.style.color) || '#000000',
        borderWidth: element.style.borderWidth || '',
        borderRadius: element.style.borderRadius || '',
        borderColor: rgbToHex(element.style.borderColor) || '#000000',
        display: element.style.display || 'block'
      };
    }
  },
  { immediate: true }
);

function updateStyle() {
  if (!selectedElement.value) return;

  const element = selectedElement.value;
  Object.assign(element.style, {
    width: styles.value.width,
    height: styles.value.height,
    left: styles.value.left,
    top: styles.value.top,
    padding: styles.value.padding,
    margin: styles.value.margin,
    fontSize: styles.value.fontSize,
    fontWeight: styles.value.fontWeight,
    textAlign: styles.value.textAlign,
    backgroundColor: styles.value.backgroundColor,
    color: styles.value.color,
    borderWidth: styles.value.borderWidth,
    borderRadius: styles.value.borderRadius,
    borderColor: styles.value.borderColor,
    display: styles.value.display
  });
}

function rgbToHex(rgb: string): string {
  if (!rgb || rgb.startsWith('#')) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  const [r, g, b] = match.map(Number);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
</script>
