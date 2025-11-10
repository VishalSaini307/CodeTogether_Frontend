import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ turbopack config (optional)
  turbopack: {
    root: "D:/New folder/Codetogether/codetogether_frontend",
  },

  // ✅ eslint config should be top-level
  eslint: {
    ignoreDuringBuilds: true, // This disables ESLint during Vercel build
  },
};

export default nextConfig;
