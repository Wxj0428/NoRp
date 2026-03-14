/**
 * Local AI Service Implementation (Ollama)
 *
 * This module implements the AI service interface for local models via Ollama.
 */

import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig } from '@/types';

export class LocalAIService extends BaseAIService {
  name = 'Local (Ollama)';
  private baseURL: string;

  constructor(config: AIServiceConfig) {
    super(config);
    this.baseURL = config.baseURL || 'http://localhost:11434';
  }

  /**
   * Check if Ollama is accessible
   */
  isConfigured(): boolean {
    return true; // Ollama doesn't require API key
  }

  /**
   * Generate code using local model
   */
  async generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode> {
    const systemPrompt = this.buildSystemPrompt(context);
    const model = this.config.model || 'llama2';

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.response || '';
      const htmlCode = this.extractHtmlCode(responseText);
      return this.parseGeneratedCode(htmlCode, `Generated with local model: ${model}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling Ollama');
    }
  }

  /**
   * Chat with local model using streaming
   */
  async *chat(messages: ChatMessage[]): AsyncGenerator<string> {
    const model = this.config.model || 'llama2';

    // Build conversation history
    const prompt = messages
      .map((msg) => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      })
      .join('\n');

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt: `${prompt}\nAssistant:`,
          stream: true,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama streaming error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while streaming from Ollama');
    }
  }

  /**
   * Test connection to Ollama
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET'
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}
