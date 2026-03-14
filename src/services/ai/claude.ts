/**
 * Claude AI Service Implementation
 *
 * This module implements the AI service interface for Anthropic's Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';
import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig } from '@/types';

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
   * Update the client when config changes
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    super.updateConfig(config);
    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }
}
