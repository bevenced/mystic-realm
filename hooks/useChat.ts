"use client";

import { useState, useRef, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseChatOptions {
  persona: string;
  subPersona?: string;
  locale?: string;
  onError?: (error: string) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => Promise<void>;
  resetConversation: () => void;
}

let msgCounter = 0;
const nextId = () => `msg_${++msgCounter}`;

export function useChat({ persona, subPersona, locale, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const convIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || !text.trim()) return;

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: convIdRef.current,
            message: text.trim(),
            persona,
            subPersona,
            locale,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Server error (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const assistantId = nextId();
        let assistantContent = "";
        let finalContent = "";

        // Process SSE stream
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (currentEvent === "token") {
                  assistantContent += data.token;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.id === assistantId) {
                      const updated = [...prev];
                      updated[updated.length - 1] = { ...last, content: assistantContent };
                      return updated;
                    }
                    return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
                  });
                } else if (currentEvent === "done") {
                  finalContent = data.content;
                  convIdRef.current = data.conversationId;
                  setConversationId(data.conversationId);
                  // Ensure final content is set
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.id === assistantId) {
                      const updated = [...prev];
                      updated[updated.length - 1] = { ...last, content: finalContent || assistantContent };
                      return updated;
                    }
                    return [...prev, { id: assistantId, role: "assistant", content: finalContent || assistantContent }];
                  });
                } else if (currentEvent === "error") {
                  throw new Error(data.message || "Stream error");
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
              currentEvent = "";
            }
          }
        }

        // If we never got a "done" event but the stream ended, update the message
        if (assistantContent && !finalContent) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) return prev;
            return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        onError?.(msg);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [persona, subPersona, isStreaming, onError],
  );

  const resetConversation = useCallback(() => {
    convIdRef.current = null;
    setConversationId(null);
    setMessages([]);
  }, []);

  return { messages, isStreaming, conversationId, sendMessage, resetConversation };
}
