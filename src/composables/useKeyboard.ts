/**
 * useKeyboard Composable
 *
 * Vue composable for handling keyboard shortcuts
 */

import { onMounted, onUnmounted } from 'vue';
import { shortcutManager } from '@/core/shortcuts';

export function useKeyboard() {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    shortcutManager.handle(event);
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    handleKeyDown
  };
}
