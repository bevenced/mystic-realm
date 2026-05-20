export interface ThemeConfig {
  key: string;
  name: string;
  nameZh: string;
  desc: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
  };
  glow: string;
  gradientHero: string;
  font: string;
  fontFallback: string;
  fontHeading: string;
  fontHeadingFallback: string;
  isDark: boolean;
}

export const themes: Record<string, ThemeConfig> = {
  meditation: {
    key: "meditation",
    name: "Meditation",
    nameZh: "冥想",
    desc: "Find your inner peace through guided journeys into stillness.",
    emoji: "🧘",
    colors: {
      primary: "#3B5998",
      secondary: "#6B8ACB",
      bg: "#F5F0E8",
      surface: "#FFFFFF",
      text: "#1A1A2E",
      textMuted: "#6B6B8D",
      accent: "#8B7FC4",
    },
    glow: "rgba(59, 89, 152, 0.25)",
    gradientHero: "linear-gradient(180deg, #F5F0E8 0%, #E8DFD0 50%, #DDD4C0 100%)",
    font: "'Cormorant Garamond'",
    fontFallback: "Georgia, serif",
    fontHeading: "'Cormorant Garamond'",
    fontHeadingFallback: "Georgia, serif",
    isDark: false,
  },
  healing: {
    key: "healing",
    name: "Healing",
    nameZh: "疗愈",
    desc: "Restore balance with natural energy and gentle light.",
    emoji: "🌿",
    colors: {
      primary: "#5A8C6A",
      secondary: "#8ABD98",
      bg: "#FFF8F0",
      surface: "#FFFFFF",
      text: "#2D3A2E",
      textMuted: "#7A8B7C",
      accent: "#F4C091",
    },
    glow: "rgba(90, 140, 106, 0.25)",
    gradientHero: "linear-gradient(180deg, #FFF8F0 0%, #F0EDE5 50%, #E8E4DA 100%)",
    font: "'Nunito'",
    fontFallback: "system-ui, sans-serif",
    fontHeading: "'Nunito'",
    fontHeadingFallback: "system-ui, sans-serif",
    isDark: false,
  },
  fengshui: {
    key: "fengshui",
    name: "Feng Shui",
    nameZh: "风水",
    desc: "Harmonize your space, align your destiny with ancient wisdom.",
    emoji: "☯",
    colors: {
      primary: "#C0392B",
      secondary: "#E74C3C",
      bg: "#0F0F0F",
      surface: "#1E1E1E",
      text: "#F5E6D3",
      textMuted: "#B8A898",
      accent: "#D4A843",
    },
    glow: "rgba(192, 57, 43, 0.3)",
    gradientHero: "linear-gradient(180deg, #0F0F0F 0%, #1A0A0A 50%, #0F0F0F 100%)",
    font: "'Noto Serif SC'",
    fontFallback: "'SimSun', serif",
    fontHeading: "'Noto Serif SC'",
    fontHeadingFallback: "'SimSun', serif",
    isDark: true,
  },
  bazi: {
    key: "bazi",
    name: "BaZi Divination",
    nameZh: "八卦命理",
    desc: "Unlock the secrets written in your birth chart by the stars.",
    emoji: "🔮",
    colors: {
      primary: "#C4A035",
      secondary: "#D4B84A",
      bg: "#12101A",
      surface: "#1E1A2A",
      text: "#E8D5A3",
      textMuted: "#A09080",
      accent: "#FFD700",
    },
    glow: "rgba(196, 160, 53, 0.25)",
    gradientHero: "linear-gradient(180deg, #12101A 0%, #1A1525 50%, #12101A 100%)",
    font: "'Cormorant Garamond'",
    fontFallback: "Georgia, serif",
    fontHeading: "'Cinzel'",
    fontHeadingFallback: "Georgia, serif",
    isDark: true,
  },
  tarot: {
    key: "tarot",
    name: "Tarot",
    nameZh: "塔罗",
    desc: "Peer into the cards and discover what the universe whispers.",
    emoji: "🃏",
    colors: {
      primary: "#FFD700",
      secondary: "#FFE44D",
      bg: "#0A0A20",
      surface: "#151535",
      text: "#E8E0FF",
      textMuted: "#9B8EC4",
      accent: "#A78BFA",
    },
    glow: "rgba(255, 215, 0, 0.2)",
    gradientHero: "linear-gradient(180deg, #0A0A20 0%, #150A30 50%, #0A0A20 100%)",
    font: "'Cormorant Garamond'",
    fontFallback: "Georgia, serif",
    fontHeading: "'Uncial Antiqua'",
    fontHeadingFallback: "Georgia, serif",
    isDark: true,
  },
  astrology: {
    key: "astrology",
    name: "Astrology",
    nameZh: "星象",
    desc: "Read the stars and map your cosmic path through the zodiac.",
    emoji: "✨",
    colors: {
      primary: "#A8C4E0",
      secondary: "#C8D8E8",
      bg: "#020810",
      surface: "#0A1420",
      text: "#D0DCE8",
      textMuted: "#6A80A0",
      accent: "#7DD3FC",
    },
    glow: "rgba(125, 211, 252, 0.15)",
    gradientHero: "linear-gradient(180deg, #020810 0%, #081020 50%, #020810 100%)",
    font: "'Josefin Sans'",
    fontFallback: "system-ui, sans-serif",
    fontHeading: "'Josefin Sans'",
    fontHeadingFallback: "system-ui, sans-serif",
    isDark: true,
  },
};

export const themeList = Object.values(themes);

/** 根据 key 获取主题 */
export function getTheme(key: string): ThemeConfig {
  return themes[key] ?? themes.meditation;
}

/** 获取 Google Fonts URL（预加载所有主题字体） */
export function getGoogleFontsUrl(): string {
  const families = [
    "Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400",
    "Nunito:wght@400;600;700",
    "Noto+Serif+SC:wght@400;700",
    "Cinzel:wght@400;600;700",
    "Uncial+Antiqua",
    "Josefin+Sans:wght@300;400;600;700",
  ];
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}
