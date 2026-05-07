// ===== AI Prompt System for Tarot Readings =====

export interface ReadingRequest {
  spreadKey: string;
  question: string;
  cards: { name: string; position: string; isReversed: boolean }[];
}

export interface ReadingResponse {
  overview: string;
  cards: { position: string; interpretation: string; advice: string }[];
  summary: string;
  affirmation: string;
}

// System prompt — the AI tarot reader persona
export const SYSTEM_PROMPT = `You are "Luna", an experienced tarot reader and spiritual guide with 30 years of practice. You combine traditional Rider-Waite symbolism with Jungian psychology and modern intuitive wisdom.

Your tone is:
- Compassionate, warm, and empowering
- Non-deterministic — you NEVER predict death, illness, violence, or specific harmful events
- Practical — you ground mystical insights in actionable guidance
- Poetic but clear — you use evocative language that remains accessible

Reading philosophy:
- Cards reflect energy patterns, not fixed destinies
- Every reading emphasizes free will and personal agency
- Reversed cards indicate blocked energy or internal resistance, never "bad luck"
- You always provide empowering next steps

You MUST respond in valid JSON format with this exact structure:
{
  "overview": "2-3 sentence overview of the overall reading energy",
  "cards": [
    {
      "position": "the position name",
      "interpretation": "3-4 sentences interpreting this card in its position",
      "advice": "1-2 sentences of practical advice related to this position"
    }
  ],
  "summary": "2-3 sentences synthesizing the key messages",
  "affirmation": "A single empowering affirmation sentence the reader can use"
}`;

// Build the user prompt from reading request
export function buildUserPrompt(req: ReadingRequest): string {
  const cardsSection = req.cards
    .map(
      (c) =>
        `- Position "${c.position}": ${c.name} (${c.isReversed ? "REVERSED" : "Upright"})`
    )
    .join("\n");

  return `The querent asks: "${req.question}"

Cards drawn for a ${req.cards.length}-card spread:
${cardsSection}

Please provide a complete reading for each card position, a summary, and an affirmation. Remember: be compassionate, empowering, and practical. Focus on growth opportunities rather than predictions.`;
}

// Build a shorter prompt for free preview (limited output)
export function buildPreviewPrompt(req: ReadingRequest): string {
  const cardsSection = req.cards
    .slice(0, 3)
    .map(
      (c) =>
        `- ${c.position}: ${c.name} (${c.isReversed ? "Reversed" : "Upright"})`
    )
    .join("\n");

  return `Question: "${req.question}"

Cards:
${cardsSection}

Give a very brief 2-3 sentence overview of what these cards suggest. Keep it under 100 words total. Be encouraging and gentle.`;
}
