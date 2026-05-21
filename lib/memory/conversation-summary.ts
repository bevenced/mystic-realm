import { sql } from "@/lib/sql";
import { extractFactsFromText, saveMemories } from "@/lib/memory/profile-store";

/**
 * After a conversation exchange, extract and persist any user facts
 * the AI learned from this turn.
 */
export async function processConversationTurn(
  userId: string,
  userMessage: string,
  aiResponse: string,
) {
  const facts = extractFactsFromText(userMessage);
  if (facts.length === 0) return;

  await saveMemories(
    userId,
    facts.map((f) => ({ ...f, confidence: 0.6 })),
  );
}

/**
 * Summarize a completed conversation and store key insights as memory.
 */
export async function summarizeConversation(
  userId: string,
  conversationId: string,
) {
  const result = await sql`
    SELECT role, content FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  `;

  const messages = result.rows;
  if (messages.length < 2) return;

  // Extract facts from all user messages
  const facts: { key: string; value: string }[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      facts.push(...extractFactsFromText(msg.content));
    }
  }

  if (facts.length > 0) {
    await saveMemories(
      userId,
      facts.map((f) => ({ ...f, confidence: 0.5 })),
    );
  }
}
