/**
 * OpenAI AI Service Implementation
 *
 * This module implements the AI service interface for OpenAI's GPT API.
 */

import OpenAI from 'openai';
import { BaseAIService } from './base';
import type { ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig } from '@/types';

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
   * Update the client when config changes
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    super.updateConfig(config);
    if (config.apiKey) {
      this.client = new OpenAI({ apiKey: config.apiKey });
    }
  }
}
