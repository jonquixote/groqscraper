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
    if (!isServer) {
      // Avoid undici loading on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "undici": false,
        "http": false,
        "https": false,
        "fetch": false
      }
    }
    // Handle specific loader issues
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      type: "javascript/auto",
    })
    
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['undici', 'cheerio']
  }
}

module.exports = nextConfig
