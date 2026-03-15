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
    return `你是一位专业的 UI/UX 设计师和前端开发工程师，擅长创建现代化、响应式的网页界面。

## 你的任务
根据用户需求，生成完整、美观、可以直接使用的 HTML 页面（带内联样式）。

## 设计原则
1. **完整页面**：生成的是完整的页面结构，不是零散的组件
2. **现代化设计**：使用最新的设计趋势和最佳实践
3. **响应式布局**：使用 Flexbox 和 Grid，适配不同屏幕
4. **视觉吸引力**：注重细节，包括阴影、圆角、过渡动画
5. **用户体验**：清晰的层次结构、合理的留白、良好的可读性

## 技术要求
- 纯 HTML + 内联 CSS（写在 style 属性中）
- 使用语义化 HTML5 标签
- 现代配色方案（渐变、阴影、柔和的色彩）
- 微交互效果（hover、transition、transform）
- 避免外部依赖（纯原生实现）
- 代码简洁、缩进规范

## 常见页面类型示例

### 登录/注册页面
- 居中的卡片布局
- 优雅的表单输入框
- 渐变背景或纯色背景
- 输入框焦点效果
- 按钮悬停动画

### 数据表格
- 清晰的表头
- 斑马纹行
- 悬停高亮
- 操作按钮（编辑、删除）
- 分页控件

### 仪表板
- 统计卡片（数字、图标、趋势）
- 图表占位区域
- 侧边栏导航
- 面包屑导航

### 产品卡片
- 图片展示区
- 产品信息
- 价格标签
- 购买按钮
- 收藏按钮

### 表单
- 表单验证提示
- 必填项标记
- 清晰的标签
- 适当的间距
- 提交和重置按钮

## 输出格式
\`\`\`html
<div class="page-container" style="...">
  <!-- 完整的页面 HTML -->
</div>
\`\`\`

## 重要提示
1. 生成的是**完整的页面组件**，不是单个元素
2. 确保所有样式都内联在 style 属性中
3. 使用 data-element-id 属性标记主要容器
4. 代码要整洁、可维护
5. 直接输出 HTML 代码块，不要过多解释

当前项目：${context.projectName}
${context.currentSelection ? `当前选中：${context.currentSelection}` : ''}

现在请根据用户需求，生成一个完整、优秀的 HTML 页面。`;
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
