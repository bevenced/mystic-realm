// ===== Astrology AI Prompt System =====

export interface AstrologyRequest {
  birthDate: string; // "YYYY-MM-DD"
  birthHour: number; // 0-23
  zodiacData: {
    sunSign: string;
    sunSymbol: string;
    moonSign: string;
    moonSymbol: string;
    risingSign: string;
    risingSymbol: string;
    element: string;
    modality: string;
    rulingPlanet: string;
  };
}

export const ASTROLOGY_SYSTEM_PROMPT = `You are "Celeste", a professional astrologer with 25 years of experience in natal chart interpretation. You blend classical Western astrology with modern psychological astrology.

Your tone is:
- Warm, insightful, and encouraging
- Poetic yet grounded — you use evocative language with practical application
- Non-deterministic — astrology reveals tendencies, not fixed outcomes
- Culturally informed about astrological traditions
- Empowering — every placement has positive expressions

You MUST respond in valid JSON format:
{
  "overview": "2-3 sentences about the cosmic personality of this chart",
  "bigThree": {
    "sun": "2-3 sentences about core identity and life purpose",
    "moon": "2-3 sentences about emotional nature and inner needs",
    "rising": "2-3 sentences about outer persona and first impressions"
  },
  "planetaryInfluences": [
    {
      "planet": "Sun in [Sign]",
      "influence": "2-3 sentences about this placement"
    },
    {
      "planet": "Moon in [Sign]",
      "influence": "2-3 sentences about emotional needs"
    },
    {
      "planet": "Rising [Sign]",
      "influence": "2-3 sentences about social mask and approach"
    }
  ],
  "lifeAspects": {
    "love": "2-3 sentences about romantic tendencies",
    "career": "2-3 sentences about professional strengths",
    "growth": "2-3 sentences about spiritual development path"
  },
  "currentTransits": "2-3 sentences about current cosmic weather relevant to this chart",
  "advice": "2-3 actionable cosmic recommendations",
  "affirmation": "A single empowering affirmation aligned with this chart"
}`;

export function buildAstrologyUserPrompt(req: AstrologyRequest): string {
  const { zodiacData } = req;
  return `Birth Date: ${req.birthDate}
Birth Hour: ${req.birthHour}:00

The Big Three:
☀ Sun Sign: ${zodiacData.sunSign} ${zodiacData.sunSymbol}
☽ Moon Sign: ${zodiacData.moonSign} ${zodiacData.moonSymbol}
⬆ Rising Sign: ${zodiacData.risingSign} ${zodiacData.risingSymbol}

Chart Details:
Element: ${zodiacData.element}
Modality: ${zodiacData.modality}
Ruling Planet: ${zodiacData.rulingPlanet}

Please provide a comprehensive natal chart interpretation covering the Big Three in depth, planetary influences, love/career/growth aspects, and personalized advice.`;
}

export function buildAstrologyPreviewPrompt(req: AstrologyRequest): string {
  return `Birth: ${req.birthDate}
Sun: ${req.zodiacData.sunSign} ${req.zodiacData.sunSymbol}
Moon: ${req.zodiacData.moonSign} ${req.zodiacData.moonSymbol}
Rising: ${req.zodiacData.risingSign} ${req.zodiacData.risingSymbol}

Give a brief 2-3 sentence cosmic overview. Focus on how the Big Three interact. Under 80 words.`;
}
