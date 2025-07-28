import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Exclude the submodule from the build process
  webpack: (config, { isServer }) => {
    // Ignore the submodule directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/lib/coinbase-agentkit/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
