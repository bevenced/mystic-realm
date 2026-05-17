import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orient Wisdom",
    short_name: "Orient Wisdom",
    description: "AI-powered tarot, BaZi, feng shui, astrology & meditation guidance.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A20",
    theme_color: "#3B5998",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
