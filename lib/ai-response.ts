/**
 * Strip markdown code fences and parse JSON from AI response.
 * Returns parsed object or null if parsing fails.
 */
export function parseAiJsonResponse(content: string): Record<string, unknown> | null {
  try {
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
