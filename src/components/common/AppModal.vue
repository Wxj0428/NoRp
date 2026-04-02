<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @keydown.escape="handleClose"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60"
          @click="backdropClose && handleClose()"
        ></div>

        <!-- Content -->
        <div
          class="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
          :style="{ width, maxHeight: maxHeight }"
        >
          <!-- Header -->
          <div v-if="title" class="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 class="text-white text-lg font-semibold">{{ title }}</h2>
            <button
              v-if="closable"
              @click="handleClose"
              class="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="p-4 border-t border-gray-700 flex justify-end gap-2">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

const props = withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  width?: string;
  maxHeight?: string;
  closable?: boolean;
  backdropClose?: boolean;
}>(), {
  width: '500px',
  maxHeight: '80vh',
  closable: true,
  backdropClose: true,
});

const emit = defineEmits<{
  close: [];
}>();

function handleClose() {
  if (props.closable) {
    emit('close');
  }
}

// Lock body scroll when modal is open
watch(() => props.visible, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.2s ease-out;
}
.modal-leave-active {
  transition: all 0.15s ease-in;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
