import { ref } from 'vue';
import { useAIStore } from '../stores/ai';
import { createAIService } from '../services/ai';
import { Agent, type AgentCallbacks } from '../services/ai/agent';
import { ToolExecutor } from '../services/ai/tools/executor';
import { ALL_TOOLS } from '../services/ai/tools';
import type { ChatMessage, ToolCall, ToolResult } from '../types';
import type { ToolCallDetail } from '../types';

interface UseAgentCallbacks {
  onTextChunk?: (text: string) => void;
  onToolCallStart?: (toolCall: ToolCall) => void;
  onToolCallResult?: (result: ToolResult) => void;
  onIterationStart?: (iteration: number, max: number) => void;
  onComplete?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseAgentOptions {
  timeout?: number;
  maxIterations?: number;
  signal?: AbortSignal;
}

export function useAgent() {
  const aiStore = useAIStore();
  const isRunning = ref(false);

  function cancel() {
    aiStore.cancelAgent();
    isRunning.value = false;
  }

  async function run(
    messages: ChatMessage[],
    callbacks: UseAgentCallbacks,
    options?: UseAgentOptions
  ): Promise<string> {
    if (!aiStore.config.apiKey && aiStore.config.provider !== 'local') {
      throw new Error('请先配置 AI 服务');
    }

    const aiService = createAIService(aiStore.config);
    const toolExecutor = new ToolExecutor();
    const controller = aiStore.startAgent();
    isRunning.value = true;

    const maxIter = options?.maxIterations || aiStore.config.maxAgentIterations || 10;
    const timeoutMs = options?.timeout || 120000;
    const agent = new Agent(aiService, toolExecutor, {
      maxIterations: maxIter,
      signal: options?.signal ?? controller.signal,
    });

    let fullText = '';
    const toolCallDetailsMap = new Map<string, ToolCallDetail>();

    const timeoutId = setTimeout(() => {
      controller.abort();
      isRunning.value = false;
      callbacks.onError?.(new Error('Agent 运行超时'));
    }, timeoutMs);

    // Build AgentCallbacks (all required fields)
    const agentCallbacks: AgentCallbacks = {
      onTextChunk: (text: string) => {
        fullText += text;
        callbacks.onTextChunk?.(text);
      },
      onToolCallStart: (toolCall: { id: string; name: string; arguments: Record<string, any> }) => {
        const detail: ToolCallDetail = {
          id: toolCall.id,
          name: toolCall.name,
          arguments: toolCall.arguments,
          timestamp: Date.now(),
        };
        toolCallDetailsMap.set(toolCall.id, detail);
        callbacks.onToolCallStart?.(toolCall as ToolCall);
      },
      onToolCallResult: (result: ToolResult) => {
        const detail = toolCallDetailsMap.get(result.toolCallId);
        if (detail) {
          detail.result = result.content;
          detail.isError = result.isError;
        }
        callbacks.onToolCallResult?.(result);
      },
      onIterationStart: (iteration: number, max: number) => {
        callbacks.onIterationStart?.(iteration, max);
      },
      onComplete: (text: string) => {
        fullText = text || fullText;
        callbacks.onComplete?.(fullText);
      },
      onError: (error: Error) => {
        callbacks.onError?.(error);
      },
    };

    try {
      await agent.run(messages, ALL_TOOLS, agentCallbacks);
    } finally {
      clearTimeout(timeoutId);
      aiStore.setAgentRunning(false);
      isRunning.value = false;
    }

    return fullText;
  }

  return { run, cancel, isRunning };
}
