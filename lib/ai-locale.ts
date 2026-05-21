import type { Locale } from "@/lib/i18n/config";

const INSTRUCTIONS: Record<Locale, string> = {
  en: "[IMPORTANT] You MUST respond in English.",
  "zh-CN":
    "[IMPORTANT] You MUST respond in Simplified Chinese (简体中文). All output must be in Chinese.",
  "zh-TW":
    "[IMPORTANT] You MUST respond in Traditional Chinese (繁體中文). All output must be in Chinese.",
};

export function getLocaleInstruction(locale: string): string {
  return INSTRUCTIONS[locale as Locale] || INSTRUCTIONS.en;
}
