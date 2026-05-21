import { sql } from "@/lib/sql";

export interface UserMemory {
  id: string;
  userId: string;
  key: string;
  value: string;
  category: string;
  confidence: number; // 0-1, how sure we are about this fact
  created_at: string;
  updated_at: string;
}

/**
 * Save a piece of user knowledge to long-term memory.
 * Upserts on (user_id, key).
 */
export async function saveMemory(
  userId: string,
  key: string,
  value: string,
  category = "general",
  confidence = 0.5,
) {
  await sql`
    INSERT INTO user_memory (user_id, key, value, category, confidence)
    VALUES (${userId}, ${key}, ${value}, ${category}, ${confidence})
    ON CONFLICT (user_id, key)
    DO UPDATE SET
      value = EXCLUDED.value,
      confidence = EXCLUDED.confidence,
      updated_at = NOW()
  `;
}

/**
 * Save multiple memory facts in batch.
 */
export async function saveMemories(
  userId: string,
  facts: { key: string; value: string; category?: string; confidence?: number }[],
) {
  for (const f of facts) {
    await saveMemory(userId, f.key, f.value, f.category, f.confidence);
  }
}

/**
 * Get all memories for a user, formatted as a natural-language paragraph
 * for injection into the system prompt.
 */
export async function getMemoryContext(userId: string): Promise<string> {
  const result = await sql`
    SELECT key, value, category, confidence
    FROM user_memory
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 50
  `;
  if (result.rows.length === 0) return "";

  const lines: string[] = ["You have the following knowledge about this user (from previous conversations):"];
  for (const row of result.rows) {
    if (row.confidence >= 0.4) {
      lines.push(`- ${row.key}: ${row.value}`);
    }
  }
  return lines.join("\n");
}

/**
 * Extract factual statements from an AI response to save as memory.
 * Simple heuristic-based extraction — looks for "I am", "I have", "my name is", etc.
 */
export function extractFactsFromText(text: string): { key: string; value: string }[] {
  const facts: { key: string; value: string }[] = [];
  const lower = text.toLowerCase();

  // Name
  const nameMatch = lower.match(/(?:my\s+name\s+is|i'?m\s+called|call\s+me)\s+(\w+)/i);
  if (nameMatch) facts.push({ key: "name", value: nameMatch[1] });

  // Age
  const ageMatch = lower.match(/(?:i'?m|i\s+am)\s+(\d+)\s*(?:years?\s*old|y\.?o\.?)/i);
  if (ageMatch) facts.push({ key: "age", value: ageMatch[1] });

  // Location
  const locMatch = lower.match(/(?:i\s+live\s+in|i'?m\s+from|based\s+in)\s+(\w+(?:\s+\w+)?)/i);
  if (locMatch) facts.push({ key: "location", value: locMatch[1] });

  // Job
  const jobMatch = lower.match(/(?:i'?m\s+a|i\s+work\s+as|my\s+job\s+is)\s+(\w+(?:\s+\w+)?)/i);
  if (jobMatch) facts.push({ key: "occupation", value: jobMatch[1] });

  // Relationship
  const relMatch = lower.match(/(?:i'?m\s+)(married|single|in\s+a\s+relationship|divorced|engaged)/i);
  if (relMatch) facts.push({ key: "relationship_status", value: relMatch[1] });

  return facts;
}
