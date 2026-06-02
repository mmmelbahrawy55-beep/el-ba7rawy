import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
