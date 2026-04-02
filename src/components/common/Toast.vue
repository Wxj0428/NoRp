<template>
  <div class="fixed bottom-16 right-20 z-[100] flex flex-col gap-2 pointer-events-none" style="max-width: 360px;">
    <TransitionGroup name="toast">
      <div
        v-for="item in toastStore.items"
        :key="item.id"
        class="pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-sm text-sm"
        :class="typeClasses[item.type]"
      >
        <span class="mt-0.5 text-base flex-shrink-0">{{ typeIcons[item.type] }}</span>
        <div class="flex-1 min-w-0">
          <p class="whitespace-pre-line break-words">{{ item.message }}</p>
        </div>
        <button
          v-if="item.action"
          @click="item.action.handler(); toastStore.removeToast(item.id)"
          class="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded hover:opacity-80 underline"
        >
          {{ item.action.label }}
        </button>
        <button
          @click="toastStore.removeToast(item.id)"
          class="flex-shrink-0 opacity-60 hover:opacity-100 text-base leading-none"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '../../stores/toast';

const toastStore = useToastStore();

const typeIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const typeClasses: Record<string, string> = {
  success: 'bg-green-900/90 border-green-700 text-green-100',
  error: 'bg-red-900/90 border-red-700 text-red-100',
  warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
  info: 'bg-blue-900/90 border-blue-700 text-blue-100',
};
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(80px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
