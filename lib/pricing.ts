/**
 * Server-side pricing configuration
 * These are the authoritative prices - never trust client-sent amounts
 */

export const SERVICE_PRICES: Record<string, number> = {
  // Tarot spreads
  "three-card": 5.99,
  "five-card": 8.88,
  "celtic-cross": 12.99,
  // Other AI services
  "tarot": 8.88,
  "bazi": 12.99,
  "astrology": 12.99,
  "fengshui": 9.99,
  "meditation": 6.99,
} as const;

/** First-time user pricing (flat discount ~70% off) */
export const FIRST_TIME_PRICE = 1.99 as const;

export const SERVICE_NAMES: Record<string, string> = {
  "three-card": "3-Card Tarot Reading",
  "five-card": "5-Card Week Ahead Reading",
  "celtic-cross": "10-Card Celtic Cross Reading",
  "tarot": "AI Tarot Reading",
  "bazi": "BaZi Destiny Analysis",
  "astrology": "Natal Chart Reading",
  "fengshui": "Feng Shui Consultation",
  "meditation": "Guided Meditation",
} as const;

/**
 * Validate that a service key exists and return its expected price
 */
export function validateServicePrice(serviceKey: string): {
  valid: boolean;
  expectedPrice: number;
  serviceKey: string;
  serviceName: string;
} {
  const expectedPrice = SERVICE_PRICES[serviceKey];
  if (!expectedPrice) {
    return { valid: false, expectedPrice: 0, serviceKey, serviceName: "Unknown" };
  }
  return { valid: true, expectedPrice, serviceKey, serviceName: SERVICE_NAMES[serviceKey] || "AI Mystical Service" };
}
