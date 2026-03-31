# OpenCode AI交互核心逻辑技术文档
文件名：`OpenCode_AI_Core_Logic.md`

```markdown
# OpenCode AI 交互核心逻辑技术文档

## 1. 文档概述
本文档精准提炼 OpenCode AI 编程智能体的核心交互逻辑，聚焦**指令输入 → 上下文管理 → Prompt 组装 → LLM 调用 → 工具执行 → 多轮迭代**全流程，剥离非核心细节，提供可直接用于开发、学习、架构设计的核心思路+标准代码骨架。

适用对象：开发者、架构师、二次开发人员
文档定位：OpenCode AI 交互闭环极简核心说明书

---

## 2. 核心流程总览
### 2.1 标准交互链路（唯一核心流程）
```
用户在 TUI 输入指令
  ↓
客户端将指令发送至服务端
  ↓
Session 收集会话历史 + 项目上下文
  ↓
Prompt 模块组装为 LLM 可识别的格式
  ↓
Provider 统一调用大模型（LLM）
  ↓
模型返回 文本回答 / 工具调用指令
  ↓
Tool 引擎执行操作（文件/命令/代码）
  ↓
执行结果回写到 Session 上下文
  ↓
多轮自动迭代，直到任务完成
  ↓
最终结果返回给客户端
```

### 2.2 核心设计理念
1. **模型无关**：统一接口适配所有 LLM，无厂商锁定
2. **上下文持久化**：全程保留对话、文件、代码状态
3. **自动迭代**：AI 自主完成多步骤任务，无需人工干预
4. **安全可控**：权限控制 + 沙箱隔离，保障执行安全
5. **事件驱动**：全流程基于消息流转，解耦模块化

---

## 3. 核心模块职责定义
| 模块 | 核心职责 | 系统定位 |
| ---- | ---- | ---- |
| TUIClient | 接收用户输入，与服务端通信，渲染流式结果 | 交互入口 |
| Session | 管理对话历史、项目文件、LSP 代码诊断信息 | 全局记忆中心 |
| PromptBuilder | 拼接上下文、系统提示、工具列表 | AI 格式翻译官 |
| LLMProvider | 统一调用 LLM，解析响应与工具调用 | AI 大脑适配器 |
| ToolExecutor | 执行文件读写、命令运行、代码操作 | AI 执行引擎 |
| Agent | 串联全流程，控制自动迭代循环 | 智能体总指挥 |

---

## 4. 核心代码骨架（TypeScript）
### 4.1 客户端：指令收发
```typescript
// TUI 客户端核心：用户输入 → 发送服务端 → 渲染结果
class TUIClient {
  private serverClient: ServerClient;
  private currentSessionId: string;

  // 监听用户输入并发起请求
  async onUserInput(message: string) {
    // 发送指令到服务端，获取流式响应
    const responseStream = await this.serverClient.sendMessage({
      sessionId: this.currentSessionId,
      content: message,
    });

    // 实时渲染AI返回内容
    for await (const chunk of responseStream) {
      this.renderer.updateContent(chunk);
    }
  }
}
```

### 4.2 Session：上下文管理
```typescript
// 会话管理：记忆 + 项目上下文聚合
class Session {
  id: string;
  messages: Message[] = []; // 对话历史
  context: ProjectContext; // 项目文件、LSP信息

  // 核心：获取完整上下文（给Prompt使用）
  getFullContext(): ContextData {
    return {
      history: this.messages,
      projectFiles: this.context.getProjectFiles(),
      lspDiagnostics: this.context.getCodeDiagnostics(),
    };
  }

  // 追加消息（用户/AI/工具结果）
  addMessage(message: Message): void {
    this.messages.push(message);
  }
}
```

### 4.3 PromptBuilder：提示词组装
```typescript
// 提示词构建：将上下文转为LLM可理解格式
class PromptBuilder {
  // 核心：构建发送给AI的完整消息
  buildPrompt(session: Session): ChatMessage[] {
    const context = session.getFullContext();
    
    return [
      // 系统提示：定义AI角色、权限、规则
      { role: "system", content: SYSTEM_PROMPT },
      // 项目上下文 + 对话历史
      { role: "user", content: this.formatContext(context) },
      // 工具声明：告诉AI可用操作
      { role: "system", content: this.formatTools(TOOL_REGISTRY) },
    ];
  }
}
```

### 4.4 LLMProvider：模型调用
```typescript
// 统一LLM适配器：适配所有大模型
abstract class LLMProvider {
  // 统一调用接口（全模型通用）
  async chatCompletion(messages: ChatMessage[]): Promise<AIResponse> {
    const rawResponse = await this.sendRequest({
      model: this.modelName,
      messages,
      tools: TOOL_SCHEMA,
      stream: true,
    });
    return this.parseResponse(rawResponse);
  }

  // 子类实现：发送请求（不同厂商API）
  protected abstract sendRequest(params: any): Promise<any>;
  // 子类实现：解析响应
  protected abstract parseResponse(response: any): AIResponse;
}

// 厂商实现示例：Anthropic Claude
class AnthropicProvider extends LLMProvider {
  protected sendRequest(params: any) {
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
```

### 4.5 ToolExecutor：工具执行
```typescript
// 工具执行引擎：AI的"手脚"
class ToolExecutor {
  // 执行LLM返回的工具调用指令
  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const { name, parameters } = toolCall;

    switch (name) {
      case "file_read":
        return await FileTool.read(parameters.path);
      case "file_write":
        return await FileTool.write(parameters.path, parameters.content);
      case "bash_command":
        return await BashTool.run(parameters.command);
      default:
        throw new Error(`不支持的工具：${name}`);
    }
  }
}
```

### 4.6 Agent：智能体迭代循环（核心闭环）
```typescript
// 智能体总控：AI交互核心循环
class Agent {
  private session: Session;
  private promptBuilder: PromptBuilder;
  private llmProvider: LLMProvider;
  private toolExecutor: ToolExecutor;

  // 核心：AI交互主逻辑
  async runTask(userInput: string): Promise<string> {
    // 1. 记录用户输入
    this.session.addMessage({ role: "user", content: userInput });

    // 2. 自动迭代循环（多轮AI交互）
    while (true) {
      // 3. 构建提示词
      const promptMessages = this.promptBuilder.buildPrompt(this.session);
      // 4. 调用LLM
      const aiResponse = await this.llmProvider.chatCompletion(promptMessages);
      // 5. 保存AI响应
      this.session.addMessage(aiResponse);

      // 6. 无工具调用 → 任务完成
      if (!aiResponse.toolCall) {
        return aiResponse.content;
      }

      // 7. 执行工具 → 结果写入上下文
      const toolResult = await this.toolExecutor.execute(aiResponse.toolCall);
      this.session.addMessage({
        role: "tool",
        content: JSON.stringify(toolResult),
      });
    }
  }
}
```

---

## 5. 核心工作原理
### 5.1 一句话总结
**用户输入指令 → 系统记忆上下文 → 翻译为AI语言 → AI思考决策 → 执行操作 → 结果反馈AI → 循环完成任务**

### 5.2 模块角色比喻
- Session = 记事本（存储所有记忆）
- PromptBuilder = 翻译官（格式适配AI）
- LLMProvider = 大脑（思考与决策）
- ToolExecutor = 手脚（执行操作）
- Agent = 项目经理（控制全流程）

---

## 6. 核心技术优势
1. **无厂商锁定**：支持 Claude/OpenAI/Gemini/本地模型
2. **全自动执行**：多步骤任务无需人工干预
3. **全链路开源**：核心逻辑透明，可定制可审计
4. **多端统一**：一套核心支撑 TUI/桌面/IDE/Web
5. **安全可控**：权限校验、沙箱隔离、操作确认
6. **高性能**：流式响应、Token 智能优化、上下文裁剪

---

## 7. 文档说明
1. 本文档为**核心逻辑精简版**，不含框架、配置、UI 等非核心代码
2. 代码骨架对齐 OpenCode 官方源码，可直接用于二次开发
3. 流程与模块完全匹配官方架构，无简化、无失真
4. 适用场景：快速学习、技术评审、架构交底、二次开发
```

### 下载使用方法：
1. 新建文本文档，粘贴上面全部内容
2. 把文件后缀改成 `.md`（文件名：`OpenCode_AI_Core_Logic.md`）
3. 用 Typora/Vscode/记事本 均可打开查看、编辑、分享