import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AIServiceConfig, ChatMessage } from '../types';

export const useAIStore = defineStore('ai', () => {
  // State
  const config = ref<AIServiceConfig>({
    provider: 'claude',
    apiKey: '',
    baseURL: '',
    model: '',
    temperature: 0.7,
    maxTokens: 4096
  });

  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Load config from localStorage
  function loadConfig() {
    const saved = localStorage.getItem('norp-ai-config');
    if (saved) {
      try {
        config.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load AI config:', e);
      }
    }
  }

  // Save config to localStorage
  function saveConfig(newConfig: AIServiceConfig) {
    config.value = newConfig;
    localStorage.setItem('norp-ai-config', JSON.stringify(newConfig));
    error.value = null;
  }

  // Clear conversation
  function clearMessages() {
    messages.value = [];
  }

  // Add message
  function addMessage(message: ChatMessage) {
    messages.value.push(message);
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  return {
    config,
    messages,
    isLoading,
    error,
    loadConfig,
    saveConfig,
    clearMessages,
    addMessage,
    setLoading,
    setError
  }
});
