import type { ToolDefinition } from '@/types';

/** 获取当前页面 HTML */
export const READ_CURRENT_PAGE: ToolDefinition = {
  name: 'read_current_page',
  description: '获取当前正在编辑的页面的完整 HTML 内容。当需要了解页面当前状态、分析页面结构时使用。',
  inputSchema: {
    type: 'object',
    properties: {
      truncate: {
        type: 'number',
        description: '返回内容的最大字符数，默认 8000。当页面很大时可设置较小值。',
      },
    },
  },
};

/** 获取选中元素的 HTML */
export const READ_SELECTED_ELEMENT: ToolDefinition = {
  name: 'read_selected_element',
  description: '获取当前选中元素的 HTML 内容。当需要了解或修改特定元素时使用。如果没有选中元素，会返回提示信息。',
  inputSchema: {
    type: 'object',
    properties: {
      includeContext: {
        type: 'boolean',
        description: '是否包含父元素和兄弟元素的上下文信息，默认 false',
      },
    },
  },
};

/** 获取项目结构 */
export const READ_PROJECT_STRUCTURE: ToolDefinition = {
  name: 'read_project_structure',
  description: '获取项目的页面列表，包括每个页面的名称、描述和元素数量。当需要了解项目整体结构、跨页面操作时使用。',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

/** 获取元素计算样式 */
export const READ_ELEMENT_STYLES: ToolDefinition = {
  name: 'read_element_styles',
  description: '获取指定元素的计算样式（computed styles）。当需要了解元素的具体样式属性时使用。',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS 选择器，用于定位要查询的元素。如果不提供，则查询当前选中的元素。',
      },
      properties: {
        type: 'string',
        description: '要查询的 CSS 属性名，多个用逗号分隔。如果不提供，返回所有常用样式属性。',
      },
    },
  },
};

/** 替换整个页面 */
export const REPLACE_PAGE: ToolDefinition = {
  name: 'replace_page',
  description: '用新的 HTML 内容替换整个当前页面。用于页面重构、完全重新设计等场景。会触发 Canvas 实时更新。',
  inputSchema: {
    type: 'object',
    properties: {
      html: {
        type: 'string',
        description: '新的页面 HTML 内容（不需要包含 html/head/body 标签）',
      },
      pageId: {
        type: 'string',
        description: '目标页面 ID。如果不提供，替换当前页面。',
      },
    },
    required: ['html'],
  },
};

/** 修改指定元素 */
export const MODIFY_ELEMENT: ToolDefinition = {
  name: 'modify_element',
  description: '替换页面中指定元素为新内容。支持通过 CSS 选择器定位元素，或直接修改当前选中的元素。会触发 Canvas 实时更新。',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS 选择器，用于定位要替换的元素。如果提供 useSelected=true，则可省略。',
      },
      useSelected: {
        type: 'boolean',
        description: '是否替换当前选中的元素。默认 false。',
      },
      newHtml: {
        type: 'string',
        description: '替换后的新 HTML 内容',
      },
    },
    required: ['newHtml'],
  },
};

/** 追加内容 */
export const APPEND_CONTENT: ToolDefinition = {
  name: 'append_content',
  description: '在页面中追加新的 HTML 内容。默认追加到页面容器末尾。会触发 Canvas 实时更新。',
  inputSchema: {
    type: 'object',
    properties: {
      html: {
        type: 'string',
        description: '要追加的 HTML 内容',
      },
      selector: {
        type: 'string',
        description: '将内容追加到指定选择器匹配的元素内部末尾。如果不提供，追加到页面主容器。',
      },
    },
    required: ['html'],
  },
};

/** 创建新页面 */
export const CREATE_PAGE: ToolDefinition = {
  name: 'create_page',
  description: '在项目中创建一个新的空白页面或带初始内容的页面。',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '新页面的名称',
      },
      html: {
        type: 'string',
        description: '页面的初始 HTML 内容（可选）',
      },
      description: {
        type: 'string',
        description: '页面的设计说明（可选）',
      },
    },
    required: ['name'],
  },
};

/** 所有工具定义集合 */
export const ALL_TOOLS: ToolDefinition[] = [
  READ_CURRENT_PAGE,
  READ_SELECTED_ELEMENT,
  READ_PROJECT_STRUCTURE,
  READ_ELEMENT_STYLES,
  REPLACE_PAGE,
  MODIFY_ELEMENT,
  APPEND_CONTENT,
  CREATE_PAGE,
];
