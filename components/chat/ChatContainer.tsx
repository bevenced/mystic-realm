"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useChat } from "@/hooks/useChat";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { PERSONAS, type PersonaConfig } from "@/lib/personas";
import { type ChatStyle } from "@/lib/chat-styles";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatWelcome from "@/components/chat/ChatWelcome";
import PersonaSelector from "@/components/chat/PersonaSelector";
import AgentStyleSelector from "@/components/chat/AgentStyleSelector";
import { Send, Sparkles, Trash2 } from "lucide-react";

export default function ChatContainer({ isSignedIn }: { isSignedIn: boolean }) {
  const { currentTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [currentStyle, setCurrentStyle] = useState<string>("gentle");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, sendMessage, resetConversation } = useChat({
    persona: currentPersona.id,
    subPersona: currentStyle,
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

  const handleSelectStyle = (style: ChatStyle) => {
    if (isStreaming) return;
    setCurrentStyle(style.id);
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
        className="flex-shrink-0 pt-3 pb-2"
        style={{
          borderBottom: `1px solid ${c.primary}10`,
          backgroundColor: c.bg,
        }}
      >
        <div className="mx-auto max-w-3xl">
          <PersonaSelector selected={currentPersona.id} onSelect={handleSelectPersona} />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative">
        {/* Ambient glow background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle, ${c.primary}15 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle, ${c.secondary || c.primary}10 0%, transparent 70%)`,
            }}
          />
        </div>
        <div className="mx-auto max-w-3xl">
          {!hasMessages && !isStreaming ? (
            <ChatWelcome
              personaEmoji={currentPersona.emoji}
              personaName={t.personas[currentPersona.id]?.name || currentPersona.name}
              starterQuestions={t.personas[currentPersona.id]?.starterQuestions || currentPersona.starterQuestions}
              onSelectQuestion={(q) => {
                setInput(q);
                inputRef.current?.focus();
              }}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} personaEmoji={currentPersona.emoji} />
              ))}
              {isStreaming && (
                <ChatMessage role="assistant" content="" isStreaming personaEmoji={currentPersona.emoji} />
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

          {/* Chat style selector */}
          {hasMessages && (
            <div
              className="mb-3 rounded-lg"
              style={{ backgroundColor: `${c.primary}04`, border: `1px solid ${c.primary}08` }}
            >
              <AgentStyleSelector
                selected={currentStyle}
                onSelect={handleSelectStyle}
                disabled={isStreaming}
              />
            </div>
          )}

          <div className="flex items-end gap-3">
            {hasMessages && (
              <button
                onClick={resetConversation}
                className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center rounded-lg transition-all"
                style={{ color: c.textMuted, border: `1px solid ${c.primary}10` }}
                title={t.chat.newConversation}
                aria-label={t.chat.newConversation}
              >
                <Trash2 size={18} />
              </button>
            )}

            <div
              className="flex-1 flex items-end rounded-xl transition-all duration-200"
              style={{
                backgroundColor: `${c.primary}06`,
                border: `1px solid ${c.primary}15`,
                boxShadow: input.trim() ? `0 0 0 2px ${c.primary}12` : "none",
              }}
              onFocus={() => {}}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-grow
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 200) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={t.chat.placeholder.replace("{name}", t.personas[currentPersona.id]?.name || currentPersona.name)}
                rows={1}
                className="flex-1 bg-transparent px-4 py-[14px] text-sm resize-none outline-none"
                style={{ color: c.text, minHeight: "48px" }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: input.trim() && !isStreaming ? c.primary : `${c.primary}20`,
                color: input.trim() && !isStreaming ? (currentTheme.isDark ? c.bg : "#FFFFFF") : c.textMuted,
                cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                transform: input.trim() && !isStreaming ? "scale(1)" : "scale(1)",
                boxShadow: input.trim() && !isStreaming ? `0 4px 12px ${c.primary}25` : "none",
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isStreaming) e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              aria-label={t.chat.send}
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
            {t.chat.enterHint}
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
