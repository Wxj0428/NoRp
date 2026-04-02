import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

let nextId = 0;

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([]);

  function addToast(toast: Omit<ToastItem, 'id'>) {
    const id = String(++nextId);
    const item: ToastItem = { id, ...toast };
    items.value.push(item);

    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }

  function removeToast(id: string) {
    items.value = items.value.filter(t => t.id !== id);
  }

  function clearAll() {
    items.value = [];
  }

  // Convenience methods
  function success(message: string, options?: Partial<ToastItem>) {
    return addToast({ type: 'success', message, ...options });
  }

  function error(message: string, options?: Partial<ToastItem>) {
    return addToast({ type: 'error', message, duration: 5000, ...options });
  }

  function warning(message: string, options?: Partial<ToastItem>) {
    return addToast({ type: 'warning', message, duration: 4000, ...options });
  }

  function info(message: string, options?: Partial<ToastItem>) {
    return addToast({ type: 'info', message, ...options });
  }

  return { items, addToast, removeToast, clearAll, success, error, warning, info };
});
