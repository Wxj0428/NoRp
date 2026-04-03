/**
 * Local AI Service Implementation (Ollama)
 *
 * This module implements the AI service interface for local models via Ollama.
 */

import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig, ToolDefinition, AgentStreamEvent } from '@/types';

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
            num_predict: this.config.maxTokens || 16384
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
            num_predict: this.config.maxTokens || 16384
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
   * Chat with tool calling support using Ollama /api/chat endpoint
   */
  async *chatWithTools(messages: ChatMessage[], tools: ToolDefinition[]): AsyncGenerator<AgentStreamEvent> {
    const model = this.config.model || 'llama2';

    const chatMessages = this._convertToChatMessages(messages);
    const ollamaTools = this._convertTools(tools);

    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          tools: ollamaTools,
          stream: true,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 16384,
          },
        }),
      });

      if (!response.ok) {
        // Fallback to text-only if tool calling is not supported
        const textGen = this.chat(messages);
        for await (const chunk of textGen) {
          yield { type: 'text', content: chunk };
        }
        yield { type: 'done', stopReason: 'end_turn' };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            // Text content
            if (data.message?.content) {
              yield { type: 'text', content: data.message.content };
            }

            // Tool calls (typically in the final message)
            if (data.message?.tool_calls) {
              for (const tc of data.message.tool_calls) {
                yield {
                  type: 'tool_call',
                  toolCall: {
                    id: tc.id || `tc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    name: tc.function?.name || '',
                    arguments: tc.function?.arguments || {},
                  },
                };
              }
            }

            // Done signal
            if (data.done) {
              const hasToolCalls = data.message?.tool_calls?.length > 0;
              yield {
                type: 'done',
                stopReason: hasToolCalls ? 'tool_use' : 'end_turn',
              };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // If we didn't get a done event, emit one
      yield { type: 'done', stopReason: 'end_turn' };
    } catch (error) {
      // Graceful fallback to text-only mode
      if (error instanceof Error && error.message.includes('tool')) {
        const textGen = this.chat(messages);
        for await (const chunk of textGen) {
          yield { type: 'text', content: chunk };
        }
        yield { type: 'done', stopReason: 'end_turn' };
        return;
      }
      throw error;
    }
  }

  /**
   * Convert messages to Ollama chat format
   */
  private _convertToChatMessages(messages: ChatMessage[]): any[] {
    const result: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'tool' && msg.toolCallId) {
        result.push({
          role: 'tool',
          content: msg.content,
        });
        continue;
      }

      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        result.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.toolCalls.map((tc) => ({
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        });
        continue;
      }

      result.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return result;
  }

  /**
   * Convert our tool definitions to Ollama format (OpenAI-compatible)
   */
  private _convertTools(tools: ToolDefinition[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
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
