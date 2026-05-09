import type { MetadataRoute } from "next";
import { themeList } from "@/lib/themes";

const BASE_URL = "https://mystic-realm.wentchine.shop";

// Blog slugs — keep in sync with lib/blog-posts.ts
const blogSlugs = [
  "meditation-for-beginners",
  "crystal-healing-guide",
  "intro-to-feng-shui",
  "understanding-bazi",
  "tarot-meanings",
  "astrology-houses",
  "daily-meditation-practice",
  "chakra-healing",
  "feng-shui-bedroom",
  "bazi-career-reading",
  "tarot-spreads-explained",
  "planetary-transits-guide",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const themePages: MetadataRoute.Sitemap = themeList.map((t) => ({
    url: `${BASE_URL}/theme/${t.key}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...themePages, ...blogPages];
}
