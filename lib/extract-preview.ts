/**
 * Extract readable preview text from an AI response that may be:
 * 1. Valid JSON (parse + extract field)
 * 2. Truncated JSON (regex extract field)
 * 3. JSON wrapped in markdown code blocks
 * 4. Plain text
 *
 * @param content - Raw AI response string
 * @param fields - Field names to try extracting (in priority order)
 * @returns Clean preview text string
 */
export function extractPreviewText(
  content: string,
  fields: string[] = ["overview", "summary", "introduction", "affirmation"]
): string {
  // Strip markdown code blocks if present
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  // 1. Try full JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    for (const field of fields) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value.length > 10) return value;
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") return value[0];
    }
    // No matching field found but JSON is valid — stringify it
    return JSON.stringify(parsed);
  } catch {
    // JSON parse failed (likely truncated by max_tokens)
  }

  // 2. Try regex extraction from truncated JSON
  for (const field of fields) {
    const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cleaned.match(
      new RegExp(`"${escapedField}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`),
    );
    if (match) {
      return match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\(.)/g, "$1");
    }
  }

  // 3. If content starts with { but we couldn't extract anything,
  //    try to get the first string value we can find
  if (cleaned.startsWith("{")) {
    const firstValue = cleaned.match(/:\s*"((?:[^"\\]|\\.)*)"/);
    if (firstValue) {
      return firstValue[1]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\(.)/g, "$1");
    }
  }

  // 4. Plain text fallback
  return content;
}

/** Field priorities per service */
export const PREVIEW_FIELDS = {
  reading: ["overview", "summary", "introduction", "affirmation", "affirmations"],
  bazi: ["overview", "dayMaster", "summary", "personality"],
  fengshui: ["overview", "summary", "topImprovements", "introduction"],
  astrology: ["overview", "summary", "currentTransits", "advice", "affirmation"],
  meditation: ["introduction", "title", "overview", "affirmation", "affirmations"],
} as const;
