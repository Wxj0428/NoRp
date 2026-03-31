/**
 * OpenAI AI Service Implementation
 *
 * This module implements the AI service interface for OpenAI's GPT API.
 */

import OpenAI from 'openai';
import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig, ToolDefinition, AgentStreamEvent, ToolCall } from '@/types';

export class OpenAIService extends BaseAIService {
  name: string;
  private client: OpenAI | null = null;

  constructor(config: AIServiceConfig) {
    super(config);
    // Set name based on provider
    this.name = config.provider === 'custom' ? 'Custom API' : 'OpenAI';

    if (config.apiKey) {
      // Support custom baseURL for custom API providers
      const clientConfig: any = {
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true // Allow usage in Electron renderer process
      };
      if (config.baseURL) {
        clientConfig.baseURL = config.baseURL;
      }
      this.client = new OpenAI(clientConfig);
    }
  }

  /**
   * Check if OpenAI API is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.client;
  }

  /**
   * Generate code using OpenAI
   */
  async generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 4096
      });

      const responseText = response.choices[0]?.message?.content || '';
      const htmlCode = this.extractHtmlCode(responseText);
      return this.parseGeneratedCode(htmlCode, 'Generated with OpenAI GPT');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  /**
   * Chat with OpenAI using streaming
   */
  async *chat(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: openaiMessages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 4096,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI streaming error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while streaming from OpenAI');
    }
  }

  /**
   * Chat with tool calling support using OpenAI function calling
   */
  async *chatWithTools(messages: ChatMessage[], tools: ToolDefinition[]): AsyncGenerator<AgentStreamEvent> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiMessages = this._convertMessages(messages);
    const openaiTools = this._convertTools(tools);

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: openaiMessages,
        tools: openaiTools,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 4096,
        stream: true,
      });

      // Accumulate tool calls across streaming chunks
      const toolCallMap = new Map<number, { id: string; name: string; argsParts: string[] }>();
      let stopReason: string = 'stop';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const finishReason = chunk.choices[0]?.finish_reason;

        if (finishReason) {
          stopReason = finishReason;
        }

        // Text content
        if (delta?.content) {
          yield { type: 'text', content: delta.content };
        }

        // Tool calls
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallMap.has(idx)) {
              toolCallMap.set(idx, {
                id: tc.id || '',
                name: tc.function?.name || '',
                argsParts: [],
              });
            }
            const acc = toolCallMap.get(idx)!;
            if (tc.id) acc.id = tc.id;
            if (tc.function?.name) acc.name = tc.function.name;
            if (tc.function?.arguments) acc.argsParts.push(tc.function.arguments);
          }
        }
      }

      // Emit completed tool calls
      for (const [, acc] of toolCallMap) {
        const fullArgs = acc.argsParts.join('');
        let parsedArgs: Record<string, any> = {};
        try {
          parsedArgs = JSON.parse(fullArgs || '{}');
        } catch { /* empty args */ }

        yield {
          type: 'tool_call',
          toolCall: { id: acc.id, name: acc.name, arguments: parsedArgs },
        };
      }

      yield {
        type: 'done',
        stopReason: stopReason === 'tool_calls' ? 'tool_use' : 'end_turn',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI tool calling error: ${error.message}`);
      }
      throw new Error('Unknown error occurred during OpenAI tool calling');
    }
  }

  /**
   * Convert our messages to OpenAI chat format
   */
  private _convertMessages(messages: ChatMessage[]): OpenAI.ChatCompletionMessageParam[] {
    const result: OpenAI.ChatCompletionMessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'tool' && msg.toolCallId) {
        result.push({
          role: 'tool',
          tool_call_id: msg.toolCallId,
          content: msg.content,
        });
        continue;
      }

      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        result.push({
          role: 'assistant',
          content: msg.content || null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        });
        continue;
      }

      if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
        result.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return result;
  }

  /**
   * Convert our tool definitions to OpenAI function calling format
   */
  private _convertTools(tools: ToolDefinition[]): OpenAI.ChatCompletionTool[] {
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          ...tool.inputSchema,
          required: tool.inputSchema.required,
        } as any,
      },
    }));
  }

  /**
   * Update the client when config changes
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    super.updateConfig(config);
    if (config.apiKey) {
      this.client = new OpenAI({ apiKey: config.apiKey });
    }
  }
}
