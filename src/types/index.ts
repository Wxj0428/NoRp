// ============= AI Service Types =============

export interface ToolCallDetail {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: string;
  isError?: boolean;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  toolCallDetails?: ToolCallDetail[];
}

// ============= Tool Calling Types =============

export interface ToolParameterSchema {
  type: string;
  description?: string;
  enum?: string[];
  items?: ToolParameterSchema;
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolParameterSchema>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export type AgentStreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'tool_result'; toolResult: ToolResult }
  | { type: 'done'; stopReason: 'end_turn' | 'tool_use' | 'max_tokens' };

export interface ProjectContext {
  projectName: string;
  currentSelection?: string;
  projectStructure?: any;
  conversationHistory: ChatMessage[];
}

export interface GeneratedCode {
  html: string;
  css?: string;
  javascript?: string;
  description?: string;
}

export interface AIServiceConfig {
  provider: 'claude' | 'openai' | 'local' | 'custom';
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableToolCalling?: boolean;
  maxAgentIterations?: number;
}

export interface AIService {
  name: string;
  generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode>;
  chat(messages: ChatMessage[]): AsyncGenerator<string>;
  chatWithTools(messages: ChatMessage[], tools: ToolDefinition[]): AsyncGenerator<AgentStreamEvent>;
  isConfigured(): boolean;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  systemPrompt: string;
  userPrompt?: string;
  isDefault?: boolean;
}

export interface PageContext {
  pageName: string;
  pageDescription?: string;
  pageHtml: string;
  selectedElementHtml?: string;
  selectedElementTag?: string;
}

export type AIActionType = 'replace-page' | 'modify-selected' | 'append';

// ============= Project Types =============

export interface Project {
  id: string;
  name: string;
  path?: string; // 项目文件路径（可选，新建项目时为空）
  createdAt: Date;
  modifiedAt: Date;
  pages: Page[];
  assets: Asset[];
  settings: ProjectSettings;
}

export interface Page {
  id: string;
  name: string;
  html: string;
  styles: Record<string, CSSStyleDeclaration>;
  scripts?: string;
  description?: string; // 页面设计思路说明
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'icon' | 'other';
  path: string;
  url?: string;
}

export interface ProjectSettings {
  theme: 'light' | 'dark';
  autosave: boolean;
  autosaveInterval: number;
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
}

// ============= Component Types =============

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'image';
  label: string;
  defaultValue?: any;
  options?: string[]; // For select type
}

export interface Component {
  id: string;
  name: string;
  category:
    | 'basic'
    | 'layout'
    | 'navigation'
    | 'data'
    | 'feedback'
    | 'forms'
    | 'media'
    | '按钮'
    | '表单'
    | '卡片'
    | '标签'
    | '提示'
    | '导航'
    | '布局'
    | '页面模板';
  icon: string;
  template: string;
  defaultStyles?: Partial<CSSStyleDeclaration>;
  props?: ComponentProp[];
  editableAreas?: string[];
}

// ============= Editor Types =============

export interface ElementData {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  styles: CSSStyleDeclaration;
  children?: ElementData[];
  content?: string;
}

export interface SelectionState {
  element: HTMLElement | null;
  elementData: ElementData | null;
}

export interface HistoryAction {
  type: 'snapshot';
  pageHtml: string;
  pageId: string;
  timestamp: Date;
}

// ============= Export Types =============

export interface ExportOptions {
  format: 'html-single' | 'html-split' | 'vue' | 'react';
  minify: boolean;
  includeDependencies: boolean;
  responsive: boolean;
}

export interface ExportResult {
  html: string;
  css?: string;
  javascript?: string;
  files?: { name: string; content: string }[];
}
