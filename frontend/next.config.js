/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Empty turbopack config to silence webpack migration warning
  turbopack: {},
}

module.exports = nextConfig
