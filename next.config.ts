import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/about-us#contact", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Cap generated widths: nothing on this site needs a 3840px image, and those
    // were the slowest and heaviest to produce on first request.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2200],
    qualities: [60, 75, 80],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
