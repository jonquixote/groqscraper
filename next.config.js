/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for undici package
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "undici": false
      };
    }
    return config;
  },
}

module.exports = nextConfig
