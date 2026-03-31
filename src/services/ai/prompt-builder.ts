import type { ChatMessage, Skill, Page } from '@/types';

export interface PromptBuilderOptions {
  skill?: Skill | null;
  currentPage?: Page | null;
  selectedElementHtml?: string | null;
  selectedElementTag?: string | null;
  projectName?: string;
  hasTools: boolean;
}

export class PromptBuilder {
  /**
   * 构建系统提示词
   * 双模式：hasTools 时指导 AI 使用工具；否则保持现有 HTML 生成行为
   */
  buildSystemPrompt(options: PromptBuilderOptions): string {
    // 基础提示词：skill 或默认
    let systemContent = options.skill
      ? options.skill.systemPrompt
      : '你是一位专业的前端开发工程师和 UI 设计师。请生成完整、美观、可直接使用的 HTML 页面。所有样式必须内联在 style 属性中。不要使用任何外部依赖。';

    // 注入页面上下文
    if (options.currentPage) {
      systemContent += this._buildPageContext(options);
    }

    // 注入工具使用指引或 HTML 输出指引
    if (options.hasTools) {
      systemContent += this._buildToolGuidance();
    } else {
      systemContent += this._buildHtmlOutputGuidance();
    }

    return systemContent;
  }

  /**
   * 构建消息数组
   */
  buildMessages(
    sessionHistory: ChatMessage[],
    systemPrompt: string,
    userMessage: string,
    maxHistoryMessages: number = 10
  ): ChatMessage[] {
    return [
      { role: 'system', content: systemPrompt },
      ...sessionHistory.slice(-maxHistoryMessages),
      { role: 'user', content: userMessage },
    ];
  }

  private _buildPageContext(options: PromptBuilderOptions): string {
    const page = options.currentPage!;
    const parts: string[] = [
      '\n\n## 当前页面上下文',
      `- 页面名称: ${page.name}`,
    ];

    if (page.description) {
      parts.push(`- 页面描述: ${page.description}`);
    }

    if (page.html) {
      const truncatedHtml = page.html.length > 8000
        ? page.html.substring(0, 8000) + '\n<!-- [...已截断...] -->'
        : page.html;
      parts.push(`\n### 当前页面 HTML:\n\`\`\`html\n${truncatedHtml}\n\`\`\``);
    }

    if (options.selectedElementHtml) {
      const selectedHtml = options.selectedElementHtml.length > 2000
        ? options.selectedElementHtml.substring(0, 2000) + '\n<!-- [...已截断...] -->'
        : options.selectedElementHtml;
      parts.push(`\n### 当前选中元素 (${options.selectedElementTag || 'unknown'}):\n\`\`\`html\n${selectedHtml}\n\`\`\``);
    }

    return parts.join('\n');
  }

  private _buildToolGuidance(): string {
    return `

## 工具使用指引
你可以使用以下工具来完成设计任务。当需要执行操作时，调用相应的工具：

### 读取工具（用于了解当前状态）
- \`read_current_page\`: 获取当前页面的 HTML
- \`read_selected_element\`: 获取选中元素的 HTML 和上下文
- \`read_project_structure\`: 获取项目的页面列表
- \`read_element_styles\`: 获取元素的计算样式

### 写入工具（用于修改页面）
- \`replace_page\`: 替换整个页面内容
- \`modify_element\`: 替换指定的元素（通过选择器或选中元素）
- \`append_content\`: 在页面末尾追加新内容
- \`create_page\`: 创建新的项目页面

### 操作策略
1. 如果用户要求**全新设计**，使用 \`replace_page\` 一次性替换整个页面
2. 如果用户要求**修改已有元素**，先读取元素信息，再用 \`modify_element\` 替换
3. 如果用户要求**添加新部分**，使用 \`append_content\` 追加到页面
4. 如果需要**跨页面操作**，先用 \`read_project_structure\` 了解结构，再用 \`create_page\` 创建新页面
5. 在不确定页面当前状态时，先调用 \`read_current_page\` 查看当前内容
6. 你可以连续调用多个工具来完成复杂任务

### 输出规范
- 生成 HTML 时，所有样式**必须内联在 style 属性中**
- 使用语义化 HTML 标签
- 确保代码可直接使用，不留 TODO 或占位符
- 添加适当的 hover/focus 过渡效果
- 保持响应式设计`;
  }

  private _buildHtmlOutputGuidance(): string {
    return `

## 响应操作
生成 HTML 时，在代码开头用注释标记操作类型：
- 替换整个页面: <!-- ACTION:REPLACE_PAGE -->
- 修改选中元素: <!-- ACTION:MODIFY_SELECTED -->（HTML 将替换当前选中的元素）
- 追加新内容: <!-- ACTION:APPEND -->（默认，追加到页面末尾）

当用户要求修改已有元素时，使用 MODIFY_SELECTED。
当用户要求全新设计时，使用 REPLACE_PAGE。
当用户要求添加新部分时，使用 APPEND。`;
  }
}
