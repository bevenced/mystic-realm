import type { Metadata } from "next";
import ChatPageClient from "./ChatPageClient";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with your spiritual AI guide for wisdom, guidance, and insight.",
};

export default function ChatPage() {
  return <ChatPageClient isSignedIn={false} />;
}
