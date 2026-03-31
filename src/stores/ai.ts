import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AIServiceConfig, ChatMessage, Skill, ToolCall } from '../types';

const DEFAULT_SYSTEM_PROMPT = '你是一位专业的前端开发工程师和 UI 设计师。请生成完整、美观、可直接使用的 HTML 页面。所有样式必须内联在 style 属性中。不要使用任何外部依赖。';

const SKILL_FRONTEND_DESIGN = `你是一位卓越的前端界面设计师和开发者。你的使命是创建令人印象深刻、生产级别的界面，避免千篇一律的"AI 生成"美学。

## 设计思维

在编码之前，深入理解上下文并选择大胆的美学方向：

- **目的**：这个界面解决什么问题？谁在使用它？
- **基调**：选择一个极端方向：极简主义、复古未来、有机自然、奢华精致、玩具趣味、杂志编辑、粗野主义、几何装饰、柔美粉彩、工业实用等。这些只是灵感来源，设计出忠于美学方向的真实方案。
- **约束**：技术要求（框架、性能、可访问性）。
- **差异化**：什么让这个界面令人难忘？用户会记住的一个亮点是什么？

**关键**：选择一个清晰的概念方向并精确执行。大胆的极繁主义和精致的极简主义都有效——关键是意图性。

## 前端美学准则

### 排版
选择独特、有趣的字体。避免 Arial、Inter 等通用字体；选择能提升前端美感的独特、有品位的字体。将独特的展示字体与精致的正文字体搭配。

### 色彩与主题
致力于一致的美学。使用 CSS 变量保持一致性。主色调搭配鲜明的强调色，优于 timid、均匀分布的调色板。

### 动效
使用动画制造效果和微交互。优先使用纯 CSS 方案。关注高影响力时刻：一个精心编排的页面加载动画（使用 animation-delay 延迟展现）比分散的微交互更令人愉悦。使用悬停状态创造惊喜。

### 空间构图
出人意料的布局。不对称。重叠。对角线流动。打破网格的元素。大量留白或受控的密度。

### 背景与视觉细节
创造氛围和深度，而非默认纯色。添加匹配整体美学的上下文效果和纹理。应用渐变网格、噪点纹理、几何图案、分层透明度、戏剧性阴影、装饰性边框和颗粒叠加。

## 反模式（绝不使用）

- 被过度使用的字体族（Inter、Roboto、Arial、系统字体）
- 陈词滥调的配色方案（特别是白色背景上的紫色渐变）
- 可预测的布局和组件模式
- 缺乏上下文特色的千篇一律设计
- 每次生成都不应相同。在明暗主题、不同字体、不同美学之间变化。绝不在多次生成中趋向相同选择。

## 实现要求

- 所有样式内联在 style 属性中
- 不使用任何外部依赖
- 实现复杂度要匹配美学愿景：极繁主义设计需要精心编写的代码；极简设计需要克制、精确
- 优雅来自于良好地执行愿景
- 生成完整、可直接使用的 HTML 页面`;

const SKILL_RESPONSIVE_LAYOUT = `你是一位精通响应式网页设计的专家。你深入了解各种设备尺寸下的布局策略，能够创建在任何屏幕上都完美呈现的页面。

## 响应式设计核心原则

### 移动优先策略
- 始终从最小屏幕尺寸开始设计
- 使用 min-width 媒体查询逐步增强
- 小屏幕上的内容优先级：核心功能 > 辅助功能 > 装饰元素

### 断点体系
- 小屏手机: < 375px
- 标准手机: 375px - 480px
- 大屏手机/小平板: 481px - 768px
- 平板: 769px - 1024px
- 桌面: 1025px - 1440px
- 大桌面: > 1440px

### 流式布局技术
- 使用百分比而非固定像素宽度
- max-width 约束极端宽度
- CSS Grid 用于二维布局（推荐 grid-template-columns: repeat(auto-fit, minmax())）
- Flexbox 用于一维对齐
- clamp() 实现流式字体大小

### 导航适配
- 桌面：水平导航栏
- 平板：折叠式汉堡菜单
- 手机：全屏抽屉导航或底部导航栏
- 触控目标最小 44x44px

### 图片与媒体
- 使用 max-width: 100% 和 height: auto
- 为不同屏幕提供不同尺寸
- 背景图片使用 object-fit: cover
- 避免固定尺寸媒体元素

## 实现要求
- 所有样式内联在 style 属性中
- 使用 @media 查询实现响应式
- 不使用任何外部依赖
- 生成完整、可直接使用的 HTML 页面`;

const SKILL_FORM_DESIGN = `你是一位专注于表单用户体验的设计专家。你深谙表单设计的每个细节，从布局到验证，从可访问性到转化率优化。

## 表单设计原则

### 信息架构
- 只收集必要的信息，每个字段都应有存在的理由
- 将相关字段分组，使用视觉分隔
- 使用单列布局（减少眼球运动，提高完成率）
- 逻辑排序：最简单的信息在前，敏感信息在后

### 输入控件选择
- 短文本：单行 input
- 长文本：textarea（高度自动适应内容更佳）
- 有限选项（< 5个）：单选按钮组
- 有限选项（5-10个）：下拉选择
- 开关状态：toggle switch（而非 checkbox）
- 日期：日期选择器
- 数量：stepper 或 range slider

### 标签与提示
- 标签始终可见，不使用 placeholder 替代标签
- 提供输入格式提示（如：请输入 11 位手机号）
- 错误消息具体明确（"邮箱格式不正确" 而非 "输入无效"）
- 成功反馈：绿色勾 + 简短确认文字

### 实时验证
- 失焦时验证（非输入时，避免红色闪烁）
- 密码强度实时指示器
- 必填字段标记为红色星号
- 错误状态：红色边框 + 错误消息在字段下方
- 成功状态：绿色边框 + 微妙动画

### 视觉设计
- 输入框高度至少 44px（触控友好）
- 清晰的 focus 状态（蓝色边框或阴影）
- 禁用状态使用灰色降低对比度
- 按钮层级：主操作（实色）> 次要操作（描边）> 取消（文字）
- 进度指示：多步表单显示步骤进度

## 实现要求
- 所有样式内联在 style 属性中
- 包含完整的表单验证逻辑（纯 JS）
- 不使用任何外部依赖
- 生成完整、可直接使用的 HTML 页面`;

const SKILL_ANIMATION = `你是一位 CSS 动画和微交互设计大师。你精通创造流畅、有目的的动画效果，让界面感觉生动而不繁杂。

## 动画设计哲学

### 动画的目的
- 引导注意力到重要变化
- 提供操作反馈，增强用户信心
- 表达元素之间的关系（空间、层级）
- 创造品牌个性的视觉语言
- 降低感知等待时间

### 时序与缓动
- 短交互（按钮、开关）：100-200ms，ease-out
- 中等动画（面板展开、页面过渡）：200-500ms，cubic-bezier
- 复杂动画（页面加载序列）：500-1500ms，自定义缓动
- 弹性效果：cubic-bezier(0.68, -0.55, 0.265, 1.55)
- 自然减速：cubic-bezier(0.25, 0.46, 0.45, 0.94)
- 推荐缓动曲线：cubic-bezier(0.4, 0, 0.2, 1)（Material Design 标准）

### 页面加载动画
- 使用 staggered animation-delay 创造编排感
- 元素从下方淡入 + 上移是最通用的入场效果
- translate + opacity 组合性能最佳
- 优先使用 transform 和 opacity（触发 GPU 加速）

### 微交互设计
- 按钮悬停：微妙的上移 + 阴影增强
- 按钮点击：缩放至 0.95 + 快速回弹
- 卡片悬停：translateY(-4px) + 阴影扩大
- 开关切换：平滑滑动 + 颜色过渡
- 输入聚焦：边框颜色过渡 + 轻微放大
- 列表项悬停：背景色过渡 + 左侧色条滑入

### 高级效果
- 渐变背景动画（background-position 平移）
- 文字逐字/逐行显现
- 数字滚动计数器效果
- 进度条流动动画
- 骨架屏闪烁加载效果

## 性能准则
- 只动画 transform 和 opacity 属性
- 避免动画 width、height、top、left
- 使用 will-change 提示浏览器优化（谨慎使用）
- 复杂动画考虑使用 requestAnimationFrame

## 实现要求
- 所有样式和动画内联在 style 属性和 <style> 标签中
- 使用纯 CSS 优先，JS 仅用于滚动触发等交互
- 不使用任何外部依赖
- 生成完整、可直接使用的 HTML 页面`;

const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'frontend-design',
    name: '前端设计',
    icon: '🎨',
    systemPrompt: SKILL_FRONTEND_DESIGN,
    isDefault: true
  },
  {
    id: 'responsive-layout',
    name: '响应式布局',
    icon: '📱',
    systemPrompt: SKILL_RESPONSIVE_LAYOUT,
    isDefault: true
  },
  {
    id: 'form-design',
    name: '表单设计',
    icon: '📋',
    systemPrompt: SKILL_FORM_DESIGN,
    isDefault: true
  },
  {
    id: 'animation-motion',
    name: '动效设计',
    icon: '✨',
    systemPrompt: SKILL_ANIMATION,
    isDefault: true
  }
];

export const useAIStore = defineStore('ai', () => {
  // State
  const config = ref<AIServiceConfig>({
    provider: 'claude',
    apiKey: '',
    baseURL: '',
    model: '',
    temperature: 0.7,
    maxTokens: 4096
  });

  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Agent state
  const isAgentRunning = ref(false);
  const agentIterations = ref(0);
  const currentToolCalls = ref<ToolCall[]>([]);
  const abortController = ref<AbortController | null>(null);

  // Skill state
  const skills = ref<Skill[]>([]);
  const activeSkillId = ref<string | null>(null);
  const getActiveSkill = computed(() => {
    if (!activeSkillId.value) return null;
    return skills.value.find(s => s.id === activeSkillId.value) || null;
  });

  // Load config from localStorage
  function loadConfig() {
    const saved = localStorage.getItem('norp-ai-config');
    if (saved) {
      try {
        config.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load AI config:', e);
      }
    }
    loadSkills();
  }

  // Save config to localStorage
  function saveConfig(newConfig: AIServiceConfig) {
    config.value = newConfig;
    localStorage.setItem('norp-ai-config', JSON.stringify(newConfig));
    error.value = null;
  }

  // Skill persistence
  function loadSkills() {
    const saved = localStorage.getItem('norp-skills');
    const version = localStorage.getItem('norp-skills-version');
    if (saved && version === '2') {
      try {
        skills.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load skills:', e);
        skills.value = [...DEFAULT_SKILLS];
        saveSkills();
      }
    } else {
      // First run or version upgrade — reset to new defaults
      skills.value = [...DEFAULT_SKILLS];
      saveSkills();
      localStorage.setItem('norp-skills-version', '2');
    }
  }

  function saveSkills() {
    localStorage.setItem('norp-skills', JSON.stringify(skills.value));
    localStorage.setItem('norp-skills-version', '2');
  }

  function addSkill(skill: Skill) {
    skills.value.push(skill);
    saveSkills();
  }

  function deleteSkill(id: string) {
    const skill = skills.value.find(s => s.id === id);
    if (skill && skill.isDefault) return;
    skills.value = skills.value.filter(s => s.id !== id);
    if (activeSkillId.value === id) {
      activeSkillId.value = null;
    }
    saveSkills();
  }

  function setActiveSkill(id: string | null) {
    activeSkillId.value = id;
  }

  // Clear conversation
  function clearMessages() {
    messages.value = [];
  }

  // Add message
  function addMessage(message: ChatMessage) {
    messages.value.push(message);
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  // Agent management
  function setAgentRunning(running: boolean) {
    isAgentRunning.value = running;
    if (!running) {
      abortController.value = null;
    }
  }

  function setAgentIterations(n: number) {
    agentIterations.value = n;
  }

  function addToolCall(tc: ToolCall) {
    currentToolCalls.value.push(tc);
  }

  function clearToolCalls() {
    currentToolCalls.value = [];
  }

  function startAgent(): AbortController {
    const controller = new AbortController();
    abortController.value = controller;
    isAgentRunning.value = true;
    agentIterations.value = 0;
    currentToolCalls.value = [];
    return controller;
  }

  function cancelAgent() {
    abortController.value?.abort();
    isAgentRunning.value = false;
  }

  return {
    config,
    messages,
    isLoading,
    error,
    skills,
    activeSkillId,
    getActiveSkill,
    isAgentRunning,
    agentIterations,
    currentToolCalls,
    abortController,
    loadConfig,
    saveConfig,
    clearMessages,
    addMessage,
    setLoading,
    setError,
    loadSkills,
    saveSkills,
    addSkill,
    deleteSkill,
    setActiveSkill,
    setAgentRunning,
    setAgentIterations,
    addToolCall,
    clearToolCalls,
    startAgent,
    cancelAgent
  }
});
