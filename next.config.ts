import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Disable ESLint and TypeScript type checking during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Optional turbopack root (make it relative, not absolute!)
  turbopack: {
    root: ".", // relative to your project root, not your Windows path
  },
};

export default nextConfig;
