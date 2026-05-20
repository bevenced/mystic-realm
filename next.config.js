const withSerwist = require("@serwist/next").default({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Redirect /dashboard → /dailyfortune
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dailyfortune",
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Image optimization (if/when images are added)
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Compress responses
  compress: true,
};

module.exports = withSerwist(nextConfig);
