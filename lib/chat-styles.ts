// ===== AI Chat Sub-Personas / Styles =====
// Within each main persona (theme), users can switch tone/style mid-conversation.

export interface ChatStyle {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  toneInstruction: string;     // Appended to system prompt
  temperature: number;         // AI temperature override
  description: string;
}

export const CHAT_STYLES: ChatStyle[] = [
  {
    id: "gentle",
    name: "温柔",
    nameEn: "Gentle",
    emoji: "🕊",
    toneInstruction: "Respond with exceptional warmth, gentleness, and compassion. Use a soft, nurturing tone like a wise and caring grandmother. Be encouraging, validating, and focus on emotional safety. Use gentle metaphors and offer reassurance.",
    temperature: 0.8,
    description: "Warm, nurturing, compassionate",
  },
  {
    id: "direct",
    name: "直接",
    nameEn: "Direct",
    emoji: "⚡",
    toneInstruction: "Be direct, honest, and straightforward. No sugar-coating — give clear, actionable advice. Be somewhat blunt but not rude. Focus on efficiency and getting to the point. Cut through confusion with crisp, clear guidance.",
    temperature: 0.5,
    description: "Straightforward, no-nonsense",
  },
  {
    id: "scholarly",
    name: "学者",
    nameEn: "Scholarly",
    emoji: "📚",
    toneInstruction: "Adopt a scholarly, academic tone. Reference classical texts and traditional wisdom where relevant. Use precise terminology, provide historical context, and explain the philosophical underpinnings. Write with erudition but remain accessible. Cite sources naturally.",
    temperature: 0.6,
    description: "Academic, researched, detailed",
  },
  {
    id: "energetic",
    name: "元气",
    nameEn: "Energetic",
    emoji: "🌟",
    toneInstruction: "Be extremely positive, energetic, and uplifting. Use exclamation points freely. Be enthusiastic and motivational. Encourage the user with vibrant energy and optimism. Make them feel excited about their journey of self-discovery.",
    temperature: 0.9,
    description: "Enthusiastic, motivational, vibrant",
  },
  {
    id: "poetic",
    name: "诗意",
    nameEn: "Poetic",
    emoji: "🌸",
    toneInstruction: "Speak in poetic, lyrical language. Use vivid imagery, metaphors drawn from nature and classical Chinese poetry. Be evocative and beautiful in your phrasing. Let your words paint pictures. Prioritize aesthetic beauty and emotional resonance.",
    temperature: 0.85,
    description: "Lyrical, metaphorical, beautiful",
  },
];

export function getChatStyle(id: string): ChatStyle {
  return CHAT_STYLES.find((s) => s.id === id) || CHAT_STYLES[0];
}
