/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'unitedstates.github.io' },
      { protocol: 'https', hostname: 'theunitedstates.io' }
    ]
  }
};

export default nextConfig;
