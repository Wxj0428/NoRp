/**
 * AI Service Base Class and Interfaces
 *
 * This module defines the base interface for all AI services.
 * All AI service implementations (Claude, OpenAI, Local) must implement this interface.
 */

import type { AIService, ChatMessage, ProjectContext, GeneratedCode, AIServiceConfig } from '@/types';

/**
 * Base AI service class with common functionality
 */
export abstract class BaseAIService implements AIService {
  abstract name: string;
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Generate code from a prompt
   */
  abstract generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode>;

  /**
   * Chat with streaming response
   */
  abstract chat(messages: ChatMessage[]): AsyncGenerator<string>;

  /**
   * Check if the service is properly configured
   */
  abstract isConfigured(): boolean;

  /**
   * Build system prompt for code generation
   */
  protected buildSystemPrompt(context: ProjectContext): string {
    return `You are an expert UI/UX designer and frontend developer specializing in creating modern, responsive web interfaces.

Your task is to generate clean, semantic HTML with inline CSS styles based on user requirements.

Guidelines:
- Use modern CSS features (Flexbox, Grid, CSS Variables)
- Ensure responsive design with mobile-first approach
- Use semantic HTML5 elements
- Include inline styles in the style attribute
- Avoid external dependencies
- Keep code clean and well-indented
- Use system font stack for better performance
- Include appropriate hover states and transitions

Output Format:
Provide the HTML code in a code block like this:
\`\`\`html
<div class="component" style="...">
  <!-- Your HTML here -->
</div>
\`\`\`

Current Context:
- Project: ${context.projectName}
${context.currentSelection ? `- Selected Element: ${context.currentSelection}` : ''}

Be concise and focused on delivering production-ready code.`;
  }

  /**
   * Extract HTML code from AI response
   */
  protected extractHtmlCode(response: string): string {
    // Try to extract code from markdown code blocks
    const codeBlockMatch = response.match(/```html\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Try to extract code from generic code blocks
    const genericMatch = response.match(/```\n([\s\S]*?)\n```/);
    if (genericMatch) {
      return genericMatch[1].trim();
    }

    // If no code block found, return the response as-is
    return response.trim();
  }

  /**
   * Parse generated code into structured format
   */
  protected parseGeneratedCode(html: string, description?: string): GeneratedCode {
    return {
      html,
      description
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
