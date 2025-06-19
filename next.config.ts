import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['react-toastify'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }
    return config;
  },
};

export default nextConfig;
