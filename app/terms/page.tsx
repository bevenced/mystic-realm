import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--color-primary)" }}
        >
          Terms of Service
        </h1>
        <div className="prose-mystic space-y-4">
          <p>
            <strong>Last Updated:</strong> May 2026
          </p>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing Mystic Realm, you agree to these terms. If you do not agree,
            please do not use our services.
          </p>
          <h2>2. Services</h2>
          <p>
            Mystic Realm provides AI-generated spiritual guidance, including tarot
            readings, BaZi analysis, astrology readings, Feng Shui consultations,
            and guided meditations. These readings are for entertainment and personal
            reflection purposes and do not constitute professional medical, legal, or
            financial advice.
          </p>
          <h2>3. Payments and Refunds</h2>
          <p>
            Payments are processed securely through PayPal. First-time readings are
            offered at a discounted rate. Due to the digital nature of our services,
            all sales are final unless otherwise required by law.
          </p>
          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account
            credentials. We reserve the right to suspend accounts that violate these
            terms or engage in abusive behavior.
          </p>
          <h2>5. Limitation of Liability</h2>
          <p>
            Mystic Realm provides services &ldquo;as is&rdquo; without warranties.
            We are not liable for any damages arising from the use of our services.
          </p>
          <h2>6. Contact</h2>
          <p>
            For questions about these terms, contact{" "}
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
