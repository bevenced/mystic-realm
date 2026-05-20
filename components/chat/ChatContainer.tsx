"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useChat } from "@/hooks/useChat";
import { PERSONAS, type PersonaConfig } from "@/lib/personas";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatWelcome from "@/components/chat/ChatWelcome";
import PersonaSelector from "@/components/chat/PersonaSelector";
import { Send, Sparkles, Trash2 } from "lucide-react";

export default function ChatContainer({ isSignedIn }: { isSignedIn: boolean }) {
  const { currentTheme, setTheme } = useTheme();
  const c = currentTheme.colors;
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, sendMessage, resetConversation } = useChat({
    persona: currentPersona.id,
    onError: (msg) => setError(msg),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSelectPersona = (p: PersonaConfig) => {
    if (isStreaming || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPersona(p);
      setTheme(p.themeKey);
      resetConversation();
      setError("");
      setTimeout(() => setTransitioning(false), 100);
    }, 250);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    setError("");
    setInput("");
    await sendMessage(input.trim());
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col h-dvh max-h-dvh"
      style={{ backgroundColor: c.bg }}
    >
      {/* Persona selector */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-2"
        style={{
          borderBottom: `1px solid ${c.primary}10`,
          backgroundColor: c.bg,
        }}
      >
        <PersonaSelector selected={currentPersona.id} onSelect={handleSelectPersona} />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {!hasMessages && !isStreaming ? (
            <ChatWelcome
              personaEmoji={currentPersona.emoji}
              personaName={currentPersona.name}
              starterQuestions={currentPersona.starterQuestions}
              onSelectQuestion={(q) => {
                setInput(q);
                inputRef.current?.focus();
              }}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isStreaming && (
                <ChatMessage role="assistant" content="" isStreaming />
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          borderTop: `1px solid ${c.primary}10`,
          backgroundColor: c.bg,
        }}
      >
        <div className="mx-auto max-w-3xl">
          {error && (
            <div
              className="mb-3 px-4 py-2 rounded-lg text-xs"
              style={{ backgroundColor: "#E74C3C12", color: "#E74C3C", border: "1px solid #E74C3C20" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-end gap-3">
            {hasMessages && (
              <button
                onClick={resetConversation}
                className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center rounded-lg transition-all"
                style={{ color: c.textMuted, border: `1px solid ${c.primary}10` }}
                title="New conversation"
                aria-label="New conversation"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div
              className="flex-1 flex items-end rounded-lg"
              style={{
                backgroundColor: `${c.primary}06`,
                border: `1px solid ${c.primary}15`,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${currentPersona.name} anything...`}
                rows={1}
                className="flex-1 bg-transparent px-4 py-[14px] text-sm resize-none outline-none"
                style={{ color: c.text }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center rounded-lg transition-all"
              style={{
                backgroundColor: input.trim() && !isStreaming ? c.primary : `${c.primary}20`,
                color: input.trim() && !isStreaming ? (currentTheme.isDark ? c.bg : "#FFFFFF") : c.textMuted,
                cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
              }}
              aria-label="Send message"
            >
              {isStreaming ? (
                <Sparkles size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <p
            className="text-[10px] mt-2 text-center"
            style={{ color: c.textMuted }}
          >
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Persona transition overlay */}
      {transitioning && (
        <div
          className="fixed inset-0 z-50 animate-fade-in"
          style={{ backgroundColor: c.bg }}
        />
      )}
    </div>
  );
}
