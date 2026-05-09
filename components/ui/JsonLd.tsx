export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mystic Realm",
    url: "https://mystic-realm.wentchine.shop",
    description: "AI-powered tarot, BaZi, feng shui, astrology, and meditation guidance for your spiritual journey.",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "1.99",
      priceCurrency: "USD",
      description: "First AI reading at a special price",
    },
    author: {
      "@type": "Organization",
      name: "Mystic Realm",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
