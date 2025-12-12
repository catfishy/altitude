import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true
  }
};

module.exports = {
  async rewrites() {
    return [
      {
        source: '/tours/win-win',
        destination: 'https://storage.googleapis.com/altitude-tours/win-win/index.html',
      },
    ]
  },
}

export default nextConfig;
