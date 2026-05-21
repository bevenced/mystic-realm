import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import ChatPageClient from "./ChatPageClient";

const META: Record<Locale, { title: string; description: string }> = {
  en: { title: "AI Chat", description: "Chat with your spiritual AI guide for wisdom, guidance, and insight." },
  "zh-CN": { title: "AI 对话", description: "与你的灵性 AI 向导对话，获取智慧、指引和洞见。" },
  "zh-TW": { title: "AI 對話", description: "與你的靈性 AI 嚮導對話，獲取智慧、指引和洞見。" },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = META[locale] || META.en;
  return { title: meta.title, description: meta.description };
}

export default function ChatPage() {
  return <ChatPageClient isSignedIn={false} />;
}
