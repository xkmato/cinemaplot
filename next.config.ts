import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
    // Add image domains for better compatibility
    domains: ['firebasestorage.googleapis.com'],
    // Increase the limit for image sizes that can be optimized
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add formats for better optimization
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
