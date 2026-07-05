import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Writeup documents can be up to 20MB; leave headroom for multipart overhead.
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
