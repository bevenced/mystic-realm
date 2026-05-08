import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        meditation: { primary: "#3B5998", bg: "#F5F0E8" },
        healing: { primary: "#5A8C6A", bg: "#FFF8F0" },
        fengshui: { primary: "#C0392B", bg: "#1A1A1A" },
        bazi: { primary: "#8B6914", bg: "#1E1520" },
        tarot: { primary: "#FFD700", bg: "#0D0D2B" },
        astrology: { primary: "#C0C0C0", bg: "#020817" },
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.5" }],     // 13px
        sm: ["0.9375rem", { lineHeight: "1.6" }],     // 15px
        base: ["1.0625rem", { lineHeight: "1.7" }],   // 17px
        lg: ["1.1875rem", { lineHeight: "1.7" }],     // 19px
        xl: ["1.375rem", { lineHeight: "1.6" }],      // 22px
        "2xl": ["1.625rem", { lineHeight: "1.5" }],   // 26px
        "3xl": ["2rem", { lineHeight: "1.3" }],       // 32px
        "4xl": ["2.5rem", { lineHeight: "1.2" }],     // 40px
      },
    },
  },
  plugins: [],
};
export default config;
