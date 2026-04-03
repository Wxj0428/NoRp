import type { ChatMessage, ToolDefinition, ToolResult, AgentStreamEvent } from '@/types';
import type { AIService } from '@/types';
import { ToolExecutor } from './tools/executor';

export interface AgentCallbacks {
  onTextChunk: (text: string) => void;
  onToolCallStart: (toolCall: { id: string; name: string; arguments: Record<string, any> }) => void;
  onToolCallResult: (toolResult: ToolResult) => void;
  onIterationStart: (iteration: number, maxIterations: number) => void;
  onComplete: (finalText: string, wasTruncated: boolean) => void;
  onError: (error: Error) => void;
}

export interface AgentOptions {
  maxIterations?: number;
  signal?: AbortSignal;
}

export class Agent {
  private aiService: AIService;
  private toolExecutor: ToolExecutor;
  private maxIterations: number;
  private signal?: AbortSignal;

  constructor(aiService: AIService, toolExecutor: ToolExecutor, options?: AgentOptions) {
    this.aiService = aiService;
    this.toolExecutor = toolExecutor;
    this.maxIterations = options?.maxIterations ?? 10;
    this.signal = options?.signal;
  }

  /**
   * Agent 核心迭代循环
   * 调用 LLM → 收集文本和工具调用 → 执行工具 → 结果回传 → 继续迭代
   */
  async run(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    callbacks: AgentCallbacks
  ): Promise<void> {
    let iteration = 0;
    let wasTruncated = false;

    try {
      while (iteration < this.maxIterations) {
        // 检查是否被取消
        if (this.signal?.aborted) {
          callbacks.onComplete('', false);
          return;
        }

        iteration++;
        callbacks.onIterationStart(iteration, this.maxIterations);

        // 调用 LLM（带工具调用支持）
        let accumulatedText = '';
        const toolCalls: { id: string; name: string; arguments: Record<string, any> }[] = [];
        let stopReason: string = 'end_turn';

        try {
          for await (const event of this.aiService.chatWithTools(messages, tools)) {
            if (this.signal?.aborted) {
              callbacks.onComplete(accumulatedText, wasTruncated);
              return;
            }

            switch (event.type) {
              case 'text':
                accumulatedText += event.content;
                callbacks.onTextChunk(event.content);
                break;

              case 'tool_call':
                toolCalls.push(event.toolCall);
                break;

              case 'tool_result':
                callbacks.onToolCallResult(event.toolResult);
                break;

              case 'done':
                stopReason = event.stopReason;
                break;
            }
          }
        } catch (error) {
          // Provider 不支持工具调用，回退到纯文本模式
          if (iteration === 1 && toolCalls.length === 0) {
            callbacks.onComplete(accumulatedText, wasTruncated);
            return;
          }
          throw error;
        }

        // 保存 assistant 消息（可能包含 tool calls）
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: accumulatedText,
        };
        if (toolCalls.length > 0) {
          assistantMessage.toolCalls = toolCalls;
        }
        messages.push(assistantMessage);

        // 检测截断
        if (stopReason === 'max_tokens') {
          wasTruncated = true;
        }

        // 如果没有工具调用或 stopReason 不是 tool_use → 任务完成
        if (toolCalls.length === 0 || stopReason !== 'tool_use') {
          callbacks.onComplete(accumulatedText, wasTruncated);
          return;
        }

        // 执行每个工具调用
        for (const toolCall of toolCalls) {
          if (this.signal?.aborted) {
            callbacks.onComplete(accumulatedText, wasTruncated);
            return;
          }

          callbacks.onToolCallStart(toolCall);

          const result = await this.toolExecutor.execute(toolCall);
          result.toolCallId = toolCall.id;
          callbacks.onToolCallResult(result);

          // 将工具结果添加到消息历史
          messages.push({
            role: 'tool',
            content: result.content,
            toolCallId: toolCall.id,
          });
        }
      }

      // 达到最大迭代次数
      callbacks.onComplete('', wasTruncated);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
