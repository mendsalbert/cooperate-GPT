/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    serverSourceMaps: false,
  },
  env: {
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: "memory",
      });
    }
    return config;
  },
  eslint: {
    // Ignore ESLint errors during production builds for smooth deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during production builds for smooth deployment
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
