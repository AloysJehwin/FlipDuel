/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Empty turbopack config to silence webpack migration warning
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/casper-rpc/:path*',
        destination: 'https://node.testnet.casper.network/:path*',
      },
    ]
  },
}

module.exports = nextConfig
