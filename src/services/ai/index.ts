/**
 * AI Service Factory
 *
 * This module provides a factory function to create AI service instances
 * based on the provider configuration.
 */

import type { AIService, AIServiceConfig } from '@/types';
import { ClaudeService } from './claude';
import { OpenAIService } from './openai';
import { LocalAIService } from './local';

/**
 * Create an AI service instance based on the provider
 */
export function createAIService(config: AIServiceConfig): AIService {
  switch (config.provider) {
    case 'claude':
      return new ClaudeService(config);
    case 'openai':
      return new OpenAIService(config);
    case 'local':
      return new LocalAIService(config);
    case 'custom':
      // For custom API, we use the local service with custom base URL
      return new LocalAIService(config);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

/**
 * Export all AI service classes for direct usage
 */
export { ClaudeService } from './claude';
export { OpenAIService } from './openai';
export { LocalAIService } from './local';
export { BaseAIService } from './base';
