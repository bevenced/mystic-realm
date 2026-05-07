// ===== Astrology Calculation Engine =====
// Pure JS algorithm for calculating zodiac signs from birth data

export interface ZodiacInfo {
  sunSign: string;
  sunSymbol: string;
  moonSign: string;
  moonSymbol: string;
  risingSign: string;
  risingSymbol: string;
  element: string;
  modality: string;
  rulingPlanet: string;
}

// Sun sign date ranges (tropical zodiac)
const SUN_SIGNS = [
  { sign: "Capricorn", symbol: "♑", start: [1, 1], end: [1, 19], element: "Earth", modality: "Cardinal", planet: "Saturn" },
  { sign: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18], element: "Air", modality: "Fixed", planet: "Uranus" },
  { sign: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20], element: "Water", modality: "Mutable", planet: "Neptune" },
  { sign: "Aries", symbol: "♈", start: [3, 21], end: [4, 19], element: "Fire", modality: "Cardinal", planet: "Mars" },
  { sign: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20], element: "Earth", modality: "Fixed", planet: "Venus" },
  { sign: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20], element: "Air", modality: "Mutable", planet: "Mercury" },
  { sign: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22], element: "Water", modality: "Cardinal", planet: "Moon" },
  { sign: "Leo", symbol: "♌", start: [7, 23], end: [8, 22], element: "Fire", modality: "Fixed", planet: "Sun" },
  { sign: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22], element: "Earth", modality: "Mutable", planet: "Mercury" },
  { sign: "Libra", symbol: "♎", start: [9, 23], end: [10, 22], element: "Air", modality: "Cardinal", planet: "Venus" },
  { sign: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21], element: "Water", modality: "Fixed", planet: "Pluto" },
  { sign: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21], element: "Fire", modality: "Mutable", planet: "Jupiter" },
  { sign: "Capricorn", symbol: "♑", start: [12, 22], end: [12, 31], element: "Earth", modality: "Cardinal", planet: "Saturn" },
];

/**
 * Get sun sign from month and day
 */
function getSunSign(month: number, day: number) {
  for (const z of SUN_SIGNS) {
    const afterStart = month > z.start[0] || (month === z.start[0] && day >= z.start[1]);
    const beforeEnd = month < z.end[0] || (month === z.end[0] && day <= z.end[1]);
    if (afterStart && beforeEnd) {
      return z;
    }
  }
  return SUN_SIGNS[0]; // Capricorn default
}

/**
 * Simplified moon sign calculation
 * The moon changes signs approximately every 2.5 days.
 * This uses a simplified formula based on a known reference point.
 */
function getMoonSign(year: number, month: number, day: number, hour: number) {
  // Reference: Jan 6, 2000 00:00 UTC = Moon in Cancer (index 3)
  const refDate = new Date(Date.UTC(2000, 0, 6));
  const targetDate = new Date(Date.UTC(year, month - 1, day, hour));
  const diffHours = (targetDate.getTime() - refDate.getTime()) / (1000 * 60 * 60);

  // Moon cycle is ~29.53 days = 708.72 hours, changes sign every ~60.73 hours
  const moonSignIndex = Math.floor(((diffHours / 60.73) % 12) + 12) % 12;

  const MOON_SIGNS = [
    "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋",
    "Leo ♌", "Virgo ♍", "Libra ♎", "Scorpio ♏",
    "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓",
  ];

  return MOON_SIGNS[moonSignIndex];
}

/**
 * Simplified rising sign (ascendant) calculation
 * The rising sign changes approximately every 2 hours.
 * This uses a simplified formula.
 */
function getRisingSign(year: number, month: number, day: number, hour: number) {
  // Approximation: rising sign changes every 2 hours, starting from Aries at midnight
  // Reference offset based on approximate sidereal time
  const dayOfYear = Math.floor(
    (Number(new Date(year, month - 1, day)) - Number(new Date(year, 0, 0))) / (1000 * 60 * 60 * 24)
  );
  const refOffset = (year * 0.9856 + dayOfYear * 1.0) % 12; // Simplified sidereal offset
  const risingIndex = Math.floor(((hour / 2 + refOffset) % 12) + 12) % 12;

  const RISING_SIGNS = [
    { sign: "Aries", symbol: "♈" }, { sign: "Taurus", symbol: "♉" },
    { sign: "Gemini", symbol: "♊" }, { sign: "Cancer", symbol: "♋" },
    { sign: "Leo", symbol: "♌" }, { sign: "Virgo", symbol: "♍" },
    { sign: "Libra", symbol: "♎" }, { sign: "Scorpio", symbol: "♏" },
    { sign: "Sagittarius", symbol: "♐" }, { sign: "Capricorn", symbol: "♑" },
    { sign: "Aquarius", symbol: "♒" }, { sign: "Pisces", symbol: "♓" },
  ];

  return RISING_SIGNS[risingIndex];
}

/**
 * Calculate the Big Three (Sun, Moon, Rising) from birth data
 */
export function calculateZodiac(
  year: number,
  month: number,
  day: number,
  hour: number
): ZodiacInfo {
  const sunInfo = getSunSign(month, day);
  const moonStr = getMoonSign(year, month, day, hour);
  const moonParts = moonStr.split(" ");
  const risingInfo = getRisingSign(year, month, day, hour);

  return {
    sunSign: sunInfo.sign,
    sunSymbol: sunInfo.symbol,
    moonSign: moonParts[0],
    moonSymbol: moonParts[1] || "☽",
    risingSign: risingInfo.sign,
    risingSymbol: risingInfo.symbol,
    element: sunInfo.element,
    modality: sunInfo.modality,
    rulingPlanet: sunInfo.planet,
  };
}
