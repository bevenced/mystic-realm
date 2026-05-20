"use client";

import dynamic from "next/dynamic";

const ChatContainer = dynamic(() => import("@/components/chat/ChatContainer"), {
  ssr: false,
  loading: () => <ChatPageLoading />,
});

function ChatPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--color-primary)40", borderTopColor: "var(--color-primary)" }}
      />
    </div>
  );
}

export default function ChatPageClient({ isSignedIn }: { isSignedIn: boolean }) {
  return <ChatContainer isSignedIn={isSignedIn} />;
}
