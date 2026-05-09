import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--color-primary)" }}
        >
          Privacy Policy
        </h1>
        <div className="prose-mystic space-y-4">
          <p>
            <strong>Last Updated:</strong> May 2026
          </p>
          <h2>1. Information We Collect</h2>
          <p>
            When you sign in, we collect your email address and name from Clerk authentication.
            When you make a purchase, PayPal processes your payment — we do not store your
            credit card or bank details. We store your reading history and preferences to
            provide our services.
          </p>
          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used to provide AI-powered readings, maintain your account,
            process payments, and improve our services. We do not sell your personal data
            to third parties.
          </p>
          <h2>3. AI Data</h2>
          <p>
            Your reading inputs (birth dates, questions, room descriptions) are sent to
            the DeepSeek AI API for processing. DeepSeek does not use this data for
            training. Readings are stored for your reference.
          </p>
          <h2>4. Cookies</h2>
          <p>
            We use essential cookies for authentication (Clerk) and analytics (Vercel).
            No tracking cookies for advertising are used.
          </p>
          <h2>5. Contact</h2>
          <p>
            For privacy inquiries, contact us at{" "}
            <a
              href="mailto:support@wentchine.shop"
              style={{ color: "var(--color-primary)" }}
            >
              support@wentchine.shop
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
