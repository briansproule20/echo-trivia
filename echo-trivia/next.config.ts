import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: '.',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'echo.merit.systems',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
