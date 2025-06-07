/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    unoptimized: true, // This allows serving local images from /public directory
  },
}

module.exports = nextConfig
