import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 六主题颜色将在 CSS 变量中动态切换
        meditation: { primary: "#3B5998", bg: "#F5F0E8" },
        healing: { primary: "#5A8C6A", bg: "#FFF8F0" },
        fengshui: { primary: "#C0392B", bg: "#1A1A1A" },
        bazi: { primary: "#8B6914", bg: "#1E1520" },
        tarot: { primary: "#FFD700", bg: "#0D0D2B" },
        astrology: { primary: "#C0C0C0", bg: "#020817" },
      },
    },
  },
  plugins: [],
};
export default config;
