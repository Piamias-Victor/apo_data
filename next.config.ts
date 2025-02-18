import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint pendant le build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript pendant le build
  },
  reactStrictMode: true, // ✅ Active le mode strict pour React
  swcMinify: true, // ✅ Minification avancée avec SWC

  productionBrowserSourceMaps: false, // ✅ Empêche la génération de fichiers map volumineux

  images: {
    formats: ["image/avif", "image/webp"], // ✅ Optimise les images pour réduire leur taille
  },
};

export default nextConfig;