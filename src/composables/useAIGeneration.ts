import { useAIStore } from '@/stores/ai';
import { createAIService } from '@/services/ai';
import type { ChatMessage } from '@/types';

const DESIGN_SYSTEM_PROMPT = `你是一位顶级前端工程师和UI设计师。根据描述生成完整、精美的HTML页面。

## 设计要求
- 现代深色风格: 深色渐变背景(#0f172a→#1e293b), 浅色文字, 鲜明主色(#3b82f6/#8b5cf6)
- 大量留白, 层次分明: 用 shadow/border/渐变 创造层次
- 排版: system-ui字体, 行高1.7, 段落间距16px, 大标题字重700
- 交互: 按钮/卡片 hover时 translateY(-2px)+shadow增强, 所有交互元素有transition
- 动效: 用@keyframes做fadeIn加载动画

## 页面结构（必须完整）
1. 顶部导航栏（毛玻璃背景, position:sticky）
2. Hero区域（大标题+副标题+CTA按钮, 内边距100px）
3. 功能/内容区域（卡片网格、特性列表等, 至少3-4个区块）
4. 页脚（简洁, 链接+版权）

## 输出格式
- 在代码块最开头放一个<style>标签, 用class选择器定义所有样式（包括@keyframes动画）
- 然后是HTML结构, 用class引用样式
- 不要输出<html><head><body>标签, 只输出<style>和HTML元素
- 不要用外部库
- 不要用emoji
- 页面内容要丰富完整, 不要偷懒省略任何部分`;

function truncateHtml(html: string, maxChars: number = 8000): string {
  if (!html || html.length <= maxChars) return html || '';
  return html.substring(0, maxChars) + '\n<!-- [...已截断，仅显示前 ' + maxChars + ' 字符...] -->';
}

export function useAIGeneration() {
  const aiStore = useAIStore();

  // Ensure config is loaded from localStorage before use
  function ensureConfig() {
    if (!aiStore.config.apiKey && !aiStore.config.baseURL) {
      aiStore.loadConfig();
    }
    return createAIService(aiStore.config);
  }

  async function generateDescription(html: string): Promise<string> {
    const aiService = ensureConfig();
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一位专业的 UI/UX 设计分析师。请分析给定的 HTML 页面代码，用中文写一段简洁的设计描述。

描述应包含：
1. 页面的主要用途和目标用户
2. 布局结构和关键组件
3. 配色方案和视觉风格
4. 交互特点

请直接输出描述文本，不要使用代码块包裹。描述控制在 200 字以内。`
      },
      {
        role: 'user',
        content: `请分析以下 HTML 页面并生成设计描述：\n\n\`\`\`html\n${truncateHtml(html, 6000)}\n\`\`\``
      }
    ];

    let result = '';
    for await (const chunk of aiService.chat(messages)) {
      result += chunk;
    }
    return result.trim();
  }

  async function optimizeDescriptionStream(currentContent: string, onChunk: (chunk: string) => void): Promise<void> {
    const aiService = ensureConfig();
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一位专业的 UI/UX 设计师。用户会提供一段页面设计思路/描述，请优化它。

优化方向：
1. 补充缺失的设计细节（布局、配色、字体、间距等）
2. 完善交互流程和用户体验描述
3. 增加技术实现建议
4. 使描述更加清晰、结构化、专业

请直接输出优化后的文本，不要使用代码块包裹，保持中文。`
      },
      {
        role: 'user',
        content: `请优化以下设计思路：\n\n${currentContent}`
      }
    ];

    for await (const chunk of aiService.chat(messages)) {
      onChunk(chunk);
    }
  }

  async function generatePageFromDescriptionStream(description: string, onChunk: (chunk: string) => void): Promise<void> {
    const aiService = ensureConfig();
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: DESIGN_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: description
      }
    ];

    for await (const chunk of aiService.chat(messages)) {
      onChunk(chunk);
    }
  }

  // Keep the old non-streaming version for backward compat (context menu uses it indirectly now, but just in case)
  async function generatePageFromDescription(description: string): Promise<string> {
    let result = '';
    await generatePageFromDescriptionStream(description, (chunk) => { result += chunk; });

    const codeMatch = result.match(/```html\n([\s\S]*?)\n```/);
    if (codeMatch) return codeMatch[1];

    const htmlMatch = result.match(/<html[\s\S]*?<\/html>/);
    if (htmlMatch) return htmlMatch[0];

    if (result.includes('<') && result.includes('>')) {
      return result;
    }

    return '';
  }

  return {
    generateDescription,
    generatePageFromDescription,
    optimizeDescriptionStream,
    generatePageFromDescriptionStream,
    truncateHtml
  };
}
