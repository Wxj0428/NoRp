import type { ToolCall, ToolResult } from '@/types';
import { useProjectStore } from '@/stores/project';
import { useEditorStore } from '@/stores/editor';

export class ToolExecutor {
  private projectStore = useProjectStore();
  private editorStore = useEditorStore();

  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const { name, arguments: args } = toolCall;

    try {
      switch (name) {
        case 'read_current_page':
          return this._readCurrentPage(args);
        case 'read_selected_element':
          return this._readSelectedElement(args);
        case 'read_project_structure':
          return this._readProjectStructure();
        case 'read_element_styles':
          return await this._readElementStyles(args);
        case 'replace_page':
          return this._replacePage(args);
        case 'modify_element':
          return this._modifyElement(args);
        case 'append_content':
          return this._appendContent(args);
        case 'create_page':
          return this._createPage(args);
        default:
          return {
            toolCallId: toolCall.id,
            content: `未知工具: ${name}`,
            isError: true,
          };
      }
    } catch (error: any) {
      return {
        toolCallId: toolCall.id,
        content: `工具执行错误 (${name}): ${error.message || String(error)}`,
        isError: true,
      };
    }
  }

  private _readCurrentPage(args: Record<string, any>): ToolResult {
    const page = this.projectStore.currentPage;
    if (!page) {
      return { toolCallId: '', content: '当前没有打开的页面' };
    }

    const truncate = args.truncate ?? 8000;
    let html = page.html || '';
    if (html.length > truncate) {
      html = html.substring(0, truncate) + '\n... (内容已截断，共 ' + page.html.length + ' 字符)';
    }

    const result = {
      pageId: page.id,
      pageName: page.name,
      pageDescription: page.description || '',
      html,
    };

    return {
      toolCallId: '',
      content: JSON.stringify(result, null, 2),
    };
  }

  private _readSelectedElement(args: Record<string, any>): ToolResult {
    const elementHtml = this.editorStore.selectedElementHtml;
    const elementTag = this.editorStore.selectedElementTag;

    if (!elementHtml) {
      return { toolCallId: '', content: '当前没有选中任何元素。请使用 replace_page 或 append_content 工具来操作页面。' };
    }

    const result: Record<string, any> = {
      elementTag,
      elementHtml,
    };

    if (args.includeContext) {
      const iframe = this._getIframe();
      if (iframe) {
        const selected = iframe.contentDocument?.querySelector(
          `[data-element-id="${this.editorStore.selectedElementId}"]`
        ) as HTMLElement | null;
        if (selected?.parentElement) {
          result.parentElementTag = selected.parentElement.tagName.toLowerCase();
          result.siblingCount = selected.parentElement.children.length;
          result.siblingIndex = Array.from(selected.parentElement.children).indexOf(selected);
        }
      }
    }

    return {
      toolCallId: '',
      content: JSON.stringify(result, null, 2),
    };
  }

  private _readProjectStructure(): ToolResult {
    const pages = this.projectStore.pageList;
    const currentId = this.projectStore.currentPageId;

    const structure = pages.map((page) => {
      const elementCount = (page.html.match(/<[a-z][\s\S]*?>/gi) || []).length;
      return {
        id: page.id,
        name: page.name,
        description: page.description || '',
        elementCount,
        isCurrentPage: page.id === currentId,
      };
    });

    return {
      toolCallId: '',
      content: JSON.stringify({
        projectName: this.projectStore.project?.name || '未命名项目',
        totalPages: pages.length,
        currentPageId: currentId,
        pages: structure,
      }, null, 2),
    };
  }

  private async _readElementStyles(args: Record<string, any>): Promise<ToolResult> {
    const iframe = this._getIframe();
    if (!iframe?.contentDocument) {
      return { toolCallId: '', content: '无法访问画布 DOM', isError: true };
    }

    let element: HTMLElement | null = null;

    if (args.selector) {
      element = iframe.contentDocument.querySelector(args.selector) as HTMLElement | null;
    } else {
      const selectedId = this.editorStore.selectedElementId;
      if (selectedId) {
        element = iframe.contentDocument.querySelector(`[data-element-id="${selectedId}"]`) as HTMLElement | null;
      }
    }

    if (!element) {
      return { toolCallId: '', content: '未找到目标元素。请检查选择器或选中一个元素。' };
    }

    const computed = iframe.contentWindow!.getComputedStyle(element);

    if (args.properties) {
      const props = (args.properties as string).split(',').map((p) => p.trim());
      const result: Record<string, string> = {};
      for (const prop of props) {
        result[prop] = computed.getPropertyValue(prop);
      }
      return { toolCallId: '', content: JSON.stringify(result, null, 2) };
    }

    const commonProps = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'background-color', 'color', 'font-size', 'font-weight', 'font-family',
      'border', 'border-radius', 'box-shadow', 'opacity', 'overflow',
      'flex-direction', 'justify-content', 'align-items', 'gap', 'grid-template-columns',
      'text-align', 'line-height', 'letter-spacing', 'z-index', 'transform',
    ];

    const result: Record<string, string> = {};
    for (const prop of commonProps) {
      const val = computed.getPropertyValue(prop);
      if (val) result[prop] = val;
    }

    return { toolCallId: '', content: JSON.stringify(result, null, 2) };
  }

  private _replacePage(args: Record<string, any>): ToolResult {
    const { html, pageId } = args;
    if (!html) {
      return { toolCallId: '', content: '缺少 html 参数', isError: true };
    }

    this.editorStore.setPendingAction('replace-page', html, pageId);

    return {
      toolCallId: '',
      content: `页面内容已替换${pageId ? ` (目标页面: ${pageId})` : ' (当前页面)'}。`,
    };
  }

  private _modifyElement(args: Record<string, any>): ToolResult {
    const { newHtml, selector, useSelected } = args;
    if (!newHtml) {
      return { toolCallId: '', content: '缺少 newHtml 参数', isError: true };
    }

    if (useSelected) {
      this.editorStore.setPendingAction('modify-selected', newHtml);
      return { toolCallId: '', content: '选中元素已替换。' };
    }

    if (selector) {
      const iframe = this._getIframe();
      if (!iframe?.contentDocument) {
        return { toolCallId: '', content: '无法访问画布 DOM', isError: true };
      }

      const element = iframe.contentDocument.querySelector(selector) as HTMLElement | null;
      if (!element) {
        return { toolCallId: '', content: `未找到匹配选择器的元素: ${selector}`, isError: true };
      }

      const tempDiv = iframe.contentDocument.createElement('div');
      tempDiv.innerHTML = newHtml;
      const newElement = tempDiv.firstElementChild as HTMLElement | null;
      if (!newElement) {
        return { toolCallId: '', content: 'newHtml 无法解析为有效的 DOM 元素', isError: true };
      }

      element.parentNode?.replaceChild(newElement, element);

      const container = iframe.contentDocument.querySelector('.page-container');
      if (container) {
        this.projectStore.updatePageHtml(container.innerHTML);
      }

      return { toolCallId: '', content: `通过选择器 ${selector} 替换了元素。` };
    }

    return { toolCallId: '', content: '请提供 selector 或 useSelected=true 参数', isError: true };
  }

  private _appendContent(args: Record<string, any>): ToolResult {
    const { html } = args;
    if (!html) {
      return { toolCallId: '', content: '缺少 html 参数', isError: true };
    }

    this.editorStore.setPendingAction('append', html);

    return {
      toolCallId: '',
      content: '内容已追加到页面。',
    };
  }

  private _createPage(args: Record<string, any>): ToolResult {
    const { name, html, description } = args;
    if (!name) {
      return { toolCallId: '', content: '缺少 name 参数', isError: true };
    }

    this.projectStore.addPage(name);

    const newPage = this.projectStore.currentPage;
    if (newPage) {
      if (html) {
        newPage.html = html;
      }
      if (description) {
        newPage.description = description;
      }
    }

    return {
      toolCallId: '',
      content: `新页面 "${name}" 已创建并切换为当前页面。`,
    };
  }

  private _getIframe(): HTMLIFrameElement | null {
    return document.querySelector('iframe.canvas-frame') as HTMLIFrameElement | null;
  }
}
