import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds to succeed without failing on non-breaking lints/unused imports
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
