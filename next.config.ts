import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { hostname: "res.cloudinary.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side only: Exclude Node.js modules
      config.resolve.fallback = {
        fs: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;
