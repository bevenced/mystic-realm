// ===== Meditation AI Prompt System =====

export interface MeditationRequest {
  type: string; // "stress" | "sleep" | "focus" | "self-healing" | "gratitude"
  duration: string; // "5" | "10" | "15" minutes
  mood: string; // optional, user's current mood/concern
}

export const MEDITATION_SYSTEM_PROMPT = `You are "Sage", a meditation guide and mindfulness teacher with 20 years of experience in various contemplative traditions including Zen Buddhism, Transcendental Meditation, Vipassana, and modern mindfulness-based stress reduction (MBSR).

Your tone is:
- Calm, soothing, and nurturing
- Clear and precise with instructions
- Inclusive and non-religious (draw from multiple traditions)
- Gentle — you guide rather than command
- Poetic in imagery, practical in technique

You MUST respond in valid JSON format:
{
  "title": "A descriptive meditation title",
  "introduction": "3-4 sentences setting the mood and intention for this meditation",
  "script": [
    {
      "phase": "settling",
      "instruction": "2-3 sentences guiding the listener to settle into position",
      "duration": "1 minute"
    },
    {
      "phase": "breath",
      "instruction": "3-4 sentences focused on breath awareness",
      "duration": "2 minutes"
    },
    {
      "phase": "body",
      "instruction": "3-4 sentences body scan or visualization",
      "duration": "2 minutes"
    },
    {
      "phase": "core",
      "instruction": "4-5 sentences the main meditation focus specific to the type",
      "duration": "3 minutes"
    },
    {
      "phase": "integration",
      "instruction": "2-3 sentences integrating the experience",
      "duration": "1 minute"
    },
    {
      "phase": "closing",
      "instruction": "2-3 sentences gentle return to awareness",
      "duration": "1 minute"
    }
  ],
  "breathingPattern": {
    "name": "Pattern name (e.g., 4-7-8, Box Breathing)",
    "inhale": "X seconds",
    "hold": "X seconds (or 0)",
    "exhale": "X seconds",
    "description": "1 sentence about this breathing pattern"
  },
  "affirmations": [
    "affirmation 1",
    "affirmation 2",
    "affirmation 3"
  ],
  "tips": ["practical tip 1", "practical tip 2"]
}`;

const MEDITATION_TYPES: Record<string, string> = {
  stress: "Stress Release",
  sleep: "Deep Sleep",
  focus: "Mental Clarity & Focus",
  "self-healing": "Self-Healing & Renewal",
  gratitude: "Gratitude & Abundance",
};

export function buildMeditationUserPrompt(req: MeditationRequest): string {
  const typeName = MEDITATION_TYPES[req.type] || req.type;
  return `Meditation Type: ${typeName}
Requested Duration: ${req.duration} minutes
${req.mood ? `User's Current State: ${req.mood}` : "No specific mood or concern mentioned."}

Please create a complete guided meditation script for a ${req.duration}-minute ${typeName.toLowerCase()} session. Include:
1. A calming introduction
2. Phased script (settling → breath → body → core practice → integration → closing)
3. A specific breathing pattern recommendation
4. 3 personalized affirmations
5. Practical tips for this type of meditation

Make the instructions vivid and sensory. Use imagery that engages all senses.`;
}

export function buildMeditationPreviewPrompt(req: MeditationRequest): string {
  const typeName = MEDITATION_TYPES[req.type] || req.type;
  return `Meditation type: ${typeName}, Duration: ${req.duration} min${req.mood ? `, Mood: ${req.mood}` : ""}

Give a brief 2-3 sentence introduction for this meditation session. Set a calming tone. Under 80 words.`;
}
