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
      {
        protocol: 'https',
        hostname: 'merit.systems',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anthropic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
