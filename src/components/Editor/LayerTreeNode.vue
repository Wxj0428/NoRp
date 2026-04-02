<template>
  <div>
    <div
      :style="{ paddingLeft: indent }"
      :class="[
        'flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs group',
        'hover:bg-gray-700',
        { 'bg-blue-900/60': isSelected }
      ]"
      @click="onSelectNode"
    >
      <button v-if="hasChildren" @click.stop="toggleExpand"
        class="w-3 h-3 flex-shrink-0 text-gray-400 hover:text-gray-200">
        <svg :class="['w-3 h-3 transition-transform', expanded ? 'rotate-90' : '']"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-5 7" />
        </svg>
      </button>
      <span v-else class="w-3"></span>
      <button @click="onToggleVisibility"
        class="p-0.5 hover:bg-gray-700 rounded flex-shrink-0"
        :title="node.visible ? '隐藏' : '显示'">
        <svg v-if="node.visible" class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>
      <span class="text-gray-400 flex-shrink-0">{{ icons[node.tagName] || '◻' }}</span>
      <span :class="[isSelected ? 'text-white font-medium' : 'text-gray-300', 'truncate']">
        {{ node.label }}
      </span>
      <span class="text-gray-600 flex-shrink-0 ml-1">{{ node.tagName.toLowerCase() }}</span>
    </div>
    <div v-if="hasChildren && expanded">
      <LayerTreeNode v-for="child in node.children" :key="child.id"
        :node="child" :depth="depth + 1" :selected-id="selectedId"
        @select="$emit('select', $event)"
        @toggle-visibility="$emit('toggle-visibility', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface TreeNode {
  id: string;
  tagName: string;
  label: string;
  element: HTMLElement;
  children: TreeNode[];
  visible: boolean;
}

const props = defineProps<{
  node: TreeNode;
  depth: number;
  selectedId?: string;
}>();

const emit = defineEmits<{
  select: [node: TreeNode];
  'toggle-visibility': [node: TreeNode];
}>();

const expanded = ref(true);
const hasChildren = computed(() => props.node.children.length > 0);
const isSelected = computed(() => props.selectedId === props.node.id);
const indent = computed(() => props.depth * 16 + 'px');

const icons: Record<string, string> = {
  DIV: '▢', BUTTON: '☐', INPUT: '⌨', IMG: '🖼', P: '¶',
  H1: 'H₁', H2: 'H₂', H3: 'H₃', SPAN: 'a', A: '🔗',
  UL: '☰', LI: '☰', SECTION: '▤', HEADER: '◨', FOOTER: '🦶',
  NAV: '◽', FORM: '📝', TABLE: '⊞',
};

function toggleExpand() { expanded.value = !expanded.value; }
function onSelectNode() { emit('select', props.node); }
function onToggleVisibility(e: Event) {
  e.stopPropagation();
  emit('toggle-visibility', props.node);
}
</script>
