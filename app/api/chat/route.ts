import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { getPersona } from "@/lib/personas";
import { getChatStyle } from "@/lib/chat-styles";
import { streamDeepSeek } from "@/lib/deepseek";
import { sseEvent } from "@/lib/stream-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { getLocaleInstruction } from "@/lib/ai-locale";
import {
  createConversation,
  getConversation,
  addMessage,
  searchKnowledge,
} from "@/lib/db";

export const runtime = "nodejs";

const RATE_LIMITS = {
  anonymous: { maxRequests: 3, windowSeconds: 60 },
  free: { maxRequests: 5, windowSeconds: 60 },
  subscribed: { maxRequests: 30, windowSeconds: 60 },
};

export async function POST(request: Request) {
  try {
    const { conversationId, message, persona: personaId, subPersona, locale } = await request.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const persona = getPersona(personaId || "meditation");
    if (!persona) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    // Resolve sub-persona (chat style) if provided
    const style = subPersona ? getChatStyle(subPersona) : null;

    // Auth + rate limiting
    const session = getSessionUserFromRequest(request);
    let userId: string | null = null;
    let rateLimitKey: string;
    let rateLimitConfig: { maxRequests: number; windowSeconds: number };

    if (session) {
      userId = session.id;
      // Determine if subscribed for rate limit tier
      const { getActiveSubscription } = await import("@/lib/db");
      const sub = await getActiveSubscription(userId);
      rateLimitConfig = sub ? RATE_LIMITS.subscribed : RATE_LIMITS.free;
      rateLimitKey = `chat:user:${userId}`;
    } else {
      rateLimitConfig = RATE_LIMITS.anonymous;
      rateLimitKey = `chat:anon:${getClientIp(request)}`;
    }

    const rl = await checkRateLimit(rateLimitKey, rateLimitConfig);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Reset": String(rl.resetAt) } },
      );
    }

    // Resolve or create conversation
    let convId = conversationId;
    if (convId) {
      const conv = await getConversation(convId);
      if (!conv) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
      if (userId && conv.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (userId) {
      const conv = await createConversation(userId, persona.id, persona.themeKey);
      convId = conv.id;
    } else {
      // Anonymous: create a temp conversation (no DB persistence)
      convId = crypto.randomUUID();
    }

    // Save user message (only for signed-in users)
    if (userId && convId && conversationId) {
      await addMessage(convId, "user", message.trim());
    }

    // RAG: search knowledge base for relevant classical text chunks
    const knowledgeChunks = await searchKnowledge(message.trim(), 3);
    let systemPrompt = persona.systemPrompt;

    // Inject sub-persona tone instruction
    if (style) {
      systemPrompt += `\n\n[Style: ${style.name} / ${style.nameEn}]\n${style.toneInstruction}`;
    }

    if (knowledgeChunks.length > 0) {
      const references = knowledgeChunks
        .map((k) => `[${k.source}${k.chapter ? ` — ${k.chapter}` : ""}]\n${k.content}`)
        .join("\n\n");
      systemPrompt += `\n\nYou may reference the following classical texts when relevant to the user's question:\n${references}`;
    }

    // Inject long-term user memory for signed-in users
    if (userId) {
      const { getMemoryContext } = await import("@/lib/memory/profile-store");
      const memoryCtx = await getMemoryContext(userId);
      if (memoryCtx) {
        systemPrompt += `\n\n${memoryCtx}`;
      }
    }

    // Append locale instruction
    systemPrompt += "\n\n" + getLocaleInstruction(locale || "en");

    // Build message history
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (userId && convId && conversationId) {
      const conv = await getConversation(convId);
      if (conv?.messages) {
        for (const msg of conv.messages) {
          if (msg.role === "user" || msg.role === "assistant") {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }
    }

    // Add current message (may duplicate last user message if already saved, but that's fine)
    messages.push({ role: "user", content: message.trim() });

    // Determine temperature from style, or use default
    const temperature = style?.temperature;

    // SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const token of streamDeepSeek(messages, { temperature })) {
            fullContent += token;
            controller.enqueue(encoder.encode(sseEvent("token", { token })));
          }

          // Save assistant response
          if (userId && convId) {
            await addMessage(convId, "assistant", fullContent);
            // Extract memory facts from this exchange
            const { processConversationTurn } = await import("@/lib/memory/conversation-summary");
            await processConversationTurn(userId, message.trim(), fullContent);
          }

          controller.enqueue(
            encoder.encode(
              sseEvent("done", {
                conversationId: convId,
                content: fullContent,
              }),
            ),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(sseEvent("error", { message: msg })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
