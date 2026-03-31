/**
 * Claude AI Service Implementation
 *
 * This module implements the AI service interface for Anthropic's Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';
import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig, ToolDefinition, AgentStreamEvent, ToolCall } from '@/types';

export class ClaudeService extends BaseAIService {
  name = 'Claude';
  private client: Anthropic | null = null;

  constructor(config: AIServiceConfig) {
    super(config);
    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }

  /**
   * Check if Claude API is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.client;
  }

  /**
   * Generate code using Claude
   */
  async generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const message = await this.client.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens || 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature || 0.7
      });

      // Extract text from response
      let responseText = '';
      for (const block of message.content) {
        if (block.type === 'text') {
          responseText += block.text;
        }
      }

      const htmlCode = this.extractHtmlCode(responseText);
      return this.parseGeneratedCode(htmlCode, 'Generated with Claude AI');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling Claude API');
    }
  }

  /**
   * Chat with Claude using streaming
   */
  async *chat(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Convert messages to Claude format
    const claudeMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    try {
      const stream = await this.client.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens || 4096,
        messages: claudeMessages,
        temperature: this.config.temperature || 0.7,
        stream: true
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude streaming error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while streaming from Claude');
    }
  }

  /**
   * Chat with tool calling support using Anthropic's tool_use
   */
  async *chatWithTools(messages: ChatMessage[], tools: ToolDefinition[]): AsyncGenerator<AgentStreamEvent> {
    if (!this.client || !this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const { systemMessages, claudeMessages } = this._convertMessages(messages);
    const claudeTools = this._convertTools(tools);

    try {
      const stream = await this.client.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens || 4096,
        system: systemMessages,
        messages: claudeMessages,
        tools: claudeTools,
        temperature: this.config.temperature || 0.7,
        stream: true,
      });

      const toolCallAccumulators = new Map<string, { id: string; name: string; jsonParts: string[] }>();
      let currentToolId = '';

      for await (const event of stream) {
        // 文本内容
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { type: 'text', content: event.delta.text };
        }

        // 工具调用开始
        if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
          currentToolId = event.content_block.id;
          toolCallAccumulators.set(currentToolId, {
            id: event.content_block.id,
            name: event.content_block.name,
            jsonParts: [],
          });
        }

        // 工具调用参数流式
        if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
          const acc = toolCallAccumulators.get(currentToolId);
          if (acc) {
            acc.jsonParts.push(event.delta.partial_json);
          }
        }

        // 工具调用结束
        if (event.type === 'content_block_stop') {
          const acc = toolCallAccumulators.get(currentToolId);
          if (acc) {
            const fullJson = acc.jsonParts.join('');
            let parsedArgs: Record<string, any> = {};
            try {
              parsedArgs = JSON.parse(fullJson || '{}');
            } catch { /* empty args */ }

            yield {
              type: 'tool_call',
              toolCall: { id: acc.id, name: acc.name, arguments: parsedArgs },
            };
          }
        }

        // 流结束
        if (event.type === 'message_stop') {
          // stop_reason is on the message event
        }
      }

      // We need stop_reason from the final message
      // Since we stream, we detect based on whether tool calls were emitted
      // The message_delta event has stop_reason
      yield { type: 'done', stopReason: 'end_turn' };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude tool calling error: ${error.message}`);
      }
      throw new Error('Unknown error occurred during Claude tool calling');
    }
  }

  /**
   * Convert our messages to Anthropic format (extract system, handle tool results)
   */
  private _convertMessages(messages: ChatMessage[]): {
    systemMessages: string;
    claudeMessages: Anthropic.MessageParam[];
  } {
    let systemContent = '';
    const claudeMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemContent += (systemContent ? '\n\n' : '') + msg.content;
        continue;
      }

      if (msg.role === 'tool' && msg.toolCallId) {
        // Anthropic: tool results go as user messages with tool_result content blocks
        claudeMessages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolCallId,
            content: msg.content,
          }],
        });
        continue;
      }

      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        // Assistant message with tool calls
        const content: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }
        for (const tc of msg.toolCalls) {
          content.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.arguments,
          });
        }
        claudeMessages.push({ role: 'assistant', content });
        continue;
      }

      // Regular user/assistant message
      if (msg.role === 'user' || msg.role === 'assistant') {
        claudeMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return { systemMessages: systemContent, claudeMessages };
  }

  /**
   * Convert our tool definitions to Anthropic tool format
   */
  private _convertTools(tools: ToolDefinition[]): Anthropic.Tool[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object' as const,
        ...tool.inputSchema,
      },
    }));
  }

  /**
   * Update the client when config changes
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    super.updateConfig(config);
    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }
}
